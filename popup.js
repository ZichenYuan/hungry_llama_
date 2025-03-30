// ==================================== SIMPLE POPUP ====================================
console.log("Excel Copilot loaded");

// Function to update status
function updateStatus(message, isError = false) {
  const statusDiv = document.getElementById("status");
  if (statusDiv) {
    statusDiv.textContent = message;
    console.log("Status updated:", message);
  }
  if (isError && statusDiv) {
    statusDiv.style.color = "red";
  } else if (statusDiv) {
    statusDiv.style.color = "green";
  }
}

// ==================================== HELPER FUNCTIONS ====================================
// Move getApiKey outside of any event listeners so it's globally available
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["groqApiKey"], function (result) {
      resolve(result.groqApiKey || null);
    });
  });
}

// Function to save response to history
function saveToHistory(prompt, response) {
  chrome.storage.local.get(["llamaHistory"], function (result) {
    let history = result.llamaHistory || [];

    // Add new item at the beginning
    history.unshift({
      prompt: prompt,
      response: response,
      timestamp: Date.now(),
    });

    // Keep only the last 10 items
    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    // Save back to storage
    chrome.storage.local.set({ llamaHistory: history });
  });
}

// ==================================== LLM INTERACTION ====================================
async function chatWithAI(userMessage, systemPrompt = "answer user message") {
  try {
    // Update status to show we're calling the LLM
    updateStatus("Calling AI assistant for help...");

    // API endpoint for Groq
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";

    // Get API key from storage
    const apiKey = await getApiKey();

    if (!apiKey) {
      updateStatus(
        "API key not found. Please set your Groq API key in the options.",
        true
      );
      return "Error: API key not configured. Please set your Groq API key in the extension options.";
    }

    // Prepare the request body
    const requestBody = {
      model: "llama-3.1-8b-instant",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };

    // Make the API call
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    // Parse and return the response
    const result = await response.json();

    if (result.choices && result.choices.length > 0) {
      updateStatus("Received AI response successfully");
      return result.choices[0].message.content;
    } else {
      updateStatus("No response generated from AI");
      return "No response generated";
    }
  } catch (error) {
    console.error("Error calling Groq API:", error);
    updateStatus(`Error calling AI: ${error.message}`, true);
    return `Error: ${error.message}`;
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  loadSheetData();
  console.log("DOM loaded");

  // Update initial status
  updateStatus("Your Spreadsheets Copilot is ready!");
  // Populate selected sheet info with sample data for testing
  const selectedSheetInfo = document.getElementById("selected-sheet-info");
  if (selectedSheetInfo) {
    // Sample data - in a real implementation, this would come from the active sheet
    selectedSheetInfo.innerHTML = `
        <h4>Selected Cell Information:</h4>
        <p><strong>Cell:</strong> A1</p>
        <p><strong>Value:</strong> Sales</p>
        <p><strong>Formula:</strong> None</p>
        <p><strong>Range:</strong> A1:D5</p>
      `;
  }

  // Event listener for the "Ask LLM" button
  const askLlmButton = document.getElementById("ask-llm");
  if (askLlmButton) {
    askLlmButton.addEventListener("click", async function () {
      const userPromptElement = document.getElementById("user-prompt");
      if (!userPromptElement || !userPromptElement.value) {
        updateStatus("Please enter a question first");
        return;
      }

      const userPrompt = userPromptElement.value;

      // Get context from the current sheet (placeholder for now)
      const sheetDataElement = document.getElementById("sheet-data");
      const sheetContext = sheetDataElement
        ? sheetDataElement.textContent || "No sheet data available"
        : "No sheet data available";

      // System prompt focused on Excel/Google Sheets assistance
      const systemPrompt = `
You are a Spreadsheets Copilot called Hungry Llama, a spreadsheets assistant that helps users analyze data and create formulas.
You specialize in both Google Sheets and Excel formulas and functions.

When given spreadsheet data:
1. Analyze the structure and content of the data to understand what it represents
2. Provide concise and helpful responses for spreadsheet-related questions
3. Suggest appropriate formulas, functions or data analysis approaches
4. If asked to create a formula, focus on providing accurate, well-structured formulas with minimal explanation unless requested
5. If asked to analyze the data, provide insights about trends, patterns, or anomalies
6. Always consider the context of the spreadsheet when answering questions

Your answers should be practical and easy to implement.
Avoid unnecessary technical jargon unless specifically asked for it.
Response with only the formula or code needed, and no additional explanations by default.
        `;

      // Call the LLM with context if available
      const fullPrompt = sheetContext
        ? `Context from current sheet:\n${sheetContext}\n\nUser question: ${userPrompt}`
        : userPrompt;

      const response = await chatWithAI(fullPrompt, systemPrompt);

      if (response && !response.startsWith("Error:")) {
        saveToHistory(userPrompt, response);
      }

      // Display the response
      let responseRow = document.getElementsByClassName("response-row")[0]; // Get the first match
      const responseDiv = document.getElementById("llm-response");

      if (responseDiv) {
        responseDiv.textContent = response;
        responseDiv.style.display = "block";
      }

      if (responseRow && copyBtn && response && response.trim()) {
        responseRow.style.display = "block";
      }
    });
  }

  // ==================================== HELPERS ====================================

  // Update the event listener for the "Configure API key" link
  const optionsLink = document.getElementById("open-options");
  if (optionsLink) {
    optionsLink.addEventListener("click", function () {
      window.open(chrome.runtime.getURL("options.html"));
    });
  }

  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      const responseDiv = document.getElementById("llm-response");
      if (!responseDiv) return;

      const text = responseDiv.innerText;
      console.log("Text to copy:", text);

      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    });
  }

  const historyLink = document.getElementById("open-history");
  if (historyLink) {
    historyLink.addEventListener("click", function () {
      window.open(chrome.runtime.getURL("history.html"));
    });
  }
});

// Add this to your popup.js file in the READING SHEETS section

// ==================================== READING SHEETS ====================================

// Function to get the active spreadsheet ID from the current tab
async function getActiveSpreadsheetId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const tab = tabs[0];
      const url = new URL(tab.url);

      // Check if this is a Google Sheets URL
      if (
        url.hostname === "docs.google.com" &&
        url.pathname.includes("/spreadsheets/d/")
      ) {
        // Extract the spreadsheet ID from the URL
        const matches = url.pathname.match(
          /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
        );
        if (matches && matches[1]) {
          resolve(matches[1]);
          return;
        }
      }

      // Not a valid Google Sheets URL
      reject(new Error("Current tab is not a Google Spreadsheet"));
    });
  });
}

// Function to get the selected cell or range from the active sheet
async function getSelectedRange(token, spreadsheetId) {
  try {
    // First get the spreadsheet to find active sheet
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties,sheets.properties`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to retrieve spreadsheet: ${response.statusText}`);
    }

    const data = await response.json();

    // Find the active sheet
    const activeSheetId = data.properties.activeSheetId;
    let activeSheetTitle = "Sheet1"; // Default fallback

    // Find the sheet title from ID
    for (const sheet of data.sheets) {
      if (sheet.properties.sheetId === activeSheetId) {
        activeSheetTitle = sheet.properties.title;
        break;
      }
    }

    // Now use the sheet metadata to get sheet data
    // For simplicity, we'll grab a reasonable range from the active sheet
    // In a real implementation, you might need a content script to get the actual selected range
    const dataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${activeSheetTitle}!A1:Z20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!dataResponse.ok) {
      throw new Error(
        `Failed to retrieve sheet data: ${dataResponse.statusText}`
      );
    }

    const sheetData = await dataResponse.json();

    // Return structured data
    return {
      sheetTitle: activeSheetTitle,
      data: sheetData.values || [],
      range: sheetData.range || `${activeSheetTitle}!A1:Z20`,
      spreadsheetTitle: data.properties.title,
    };
  } catch (error) {
    console.error("Error getting sheet data:", error);
    throw error;
  }
}

// Function to populate cell information in the UI
function populateSheetInfo(sheetInfo) {
  const infoDiv = document.getElementById("selected-sheet-info");
  if (!infoDiv) return;

  // Create a summary of the sheet data
  let rowCount = sheetInfo.data.length;
  let colCount = rowCount > 0 ? sheetInfo.data[0].length : 0;

  // Create a sample of the data (first few cells)
  let dataSample = "";
  if (rowCount > 0 && colCount > 0) {
    // Get cell A1 if available
    if (sheetInfo.data[0][0]) {
      dataSample = `<p><strong>A1:</strong> ${sheetInfo.data[0][0]}</p>`;
    }
  }

  // Prepare table preview for the first few rows (max 5)
  let tablePreview = '<table class="sheet-preview">';
  const maxRows = Math.min(5, rowCount);
  const maxCols = Math.min(5, colCount);

  // Add header row with column letters
  tablePreview += "<tr><th></th>";
  for (let c = 0; c < maxCols; c++) {
    tablePreview += `<th>${columnToLetter(c + 1)}</th>`;
  }
  tablePreview += "</tr>";

  // Add data rows
  for (let r = 0; r < maxRows; r++) {
    tablePreview += `<tr><th>${r + 1}</th>`;
    for (let c = 0; c < maxCols; c++) {
      const cellValue =
        sheetInfo.data[r] && sheetInfo.data[r][c] ? sheetInfo.data[r][c] : "";
      tablePreview += `<td>${cellValue}</td>`;
    }
    tablePreview += "</tr>";
  }
  tablePreview += "</table>";

  // Update the UI
  infoDiv.innerHTML = `
    <h4>Active Sheet Information:</h4>
    <p><strong>Spreadsheet:</strong> ${sheetInfo.spreadsheetTitle}</p>
    <p><strong>Sheet:</strong> ${sheetInfo.sheetTitle}</p>
    <p><strong>Range:</strong> ${sheetInfo.range}</p>
    <p><strong>Size:</strong> ${rowCount} rows × ${colCount} columns</p>
    ${dataSample}
    <div class="table-container">
      <h5>Preview:</h5>
      ${tablePreview}
    </div>
    <div id="sheet-data" style="display:none">${JSON.stringify(
      sheetInfo.data
    )}</div>
  `;
}

// Helper function to convert column index to letter (A, B, C, ..., AA, AB, etc.)
function columnToLetter(column) {
  let letter = "";
  while (column > 0) {
    const remainder = (column - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    column = Math.floor((column - 1) / 26);
  }
  return letter;
}

// Function to load sheet data when popup opens
async function loadSheetData() {
  try {
    updateStatus("Reading spreadsheet data...");

    // Get the spreadsheet ID from the current tab
    const spreadsheetId = await getActiveSpreadsheetId();

    // Get auth token
    const token = await getAuthToken();

    // Get the selected range data
    const sheetInfo = await getSelectedRange(token, spreadsheetId);

    // Update UI with sheet info
    populateSheetInfo(sheetInfo);

    updateStatus("Ready to assist with your sheet data!");
  } catch (error) {
    console.error("Error loading sheet data:", error);
    // If not on a Google Sheet page, show a friendly message
    if (error.message === "Current tab is not a Google Spreadsheet") {
      updateStatus("Open a Google Sheet to analyze data", true);
      document.getElementById("selected-sheet-info").innerHTML = `
        <p class="info-message">
          Please open a Google Sheets document in another tab, then click on this extension again.
        </p>
      `;
    } else {
      updateStatus(`Error: ${error.message}`, true);
    }
  }
}


async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError) {
        console.error("Authentication error:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      console.log("Successfully obtained auth token");
      resolve(token);
    });
  });
}
// Function to load spreadsheet data using the token


// Function to extract the current spreadsheet ID from the URL
function getSpreadsheetIdFromUrl(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}
