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
      const sheetContext = sheetDataElement ? 
        sheetDataElement.textContent || "No sheet data available" : 
        "No sheet data available";

      // System prompt focused on Excel/Google Sheets assistance
      const systemPrompt = `
        You are a Spreadsheets Copilot called Hungry Llama, a spreadsheets assistant that helps users analyze data and create formulas.
        Provide concise and helpful responses for spreadsheet-related questions.
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