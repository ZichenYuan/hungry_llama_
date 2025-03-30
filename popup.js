// ==================================== SIMPLE POPUP ====================================
console.log("Excel Copilot loaded");

// Function to update status
function updateStatus(message) {
  const statusDiv = document.getElementById("status");
  if (statusDiv) {
    statusDiv.textContent = message;
    console.log("Status updated:", message);
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded");

  // Update initial status
  updateStatus("Extension loaded successfully!");

  // Add button click handlers
  document.getElementById("authorize").addEventListener("click", function () {
    updateStatus("Authorization feature coming soon!");
  });

  document.getElementById("read-sheet").addEventListener("click", function () {
    updateStatus("Sheet reading feature coming soon!");
  });

  document
    .getElementById("analyze-data")
    .addEventListener("click", function () {
      updateStatus("Analysis feature coming soon!");
    });
});

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
        "API key not found. Please set your Groq API key in the options."
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
    updateStatus(`Error calling AI: ${error.message}`);

    // Fallback to hardcoded response in case of errors during development
    const hardcodedResponse = {
      choices: [
        {
          message: {
            content: `This is a fallback response because we couldn't connect to the Groq API.
              
  In order to do a sum of a column in Excel, you can use the formula:
  
  =SUM(A1:A10)
  
  Where A1:A10 is the range of cells you want to sum. You can also use AVERAGE(), COUNT(), MAX(), or MIN() with similar syntax.`,
          },
        },
      ],
    };

    return hardcodedResponse.choices[0].message.content;
  }
}

// ==================================== HELPER ====================================

document.getElementById('open-options').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
  
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["groqApiKey"], function (result) {
      resolve(result.groqApiKey || null);
    });
  });
}

// Add this to your DOMContentLoaded event handler
document.getElementById("ask-llm").addEventListener("click", async function () {
  const userPrompt = document.getElementById("user-prompt").value;
  if (!userPrompt) {
    updateStatus("Please enter a question first");
    return;
  }

  // Get context from the current sheet (placeholder for now)
  const sheetContext =
    document.getElementById("sheet-data").textContent ||
    "No sheet data available";

  // System prompt focused on Excel/Google Sheets assistance
  const systemPrompt =
    "You are an Excel/Google Sheets assistant that helps users analyze data and create formulas. Provide concise and helpful responses for spreadsheet-related questions. Your answers should be practical and easy to implement.";

  // Call the LLM with context if available
  const fullPrompt = sheetContext
    ? `Context from current sheet:\n${sheetContext}\n\nUser question: ${userPrompt}`
    : userPrompt;

  const response = await chatWithAI(fullPrompt, systemPrompt);

  // Display the response
  const responseDiv = document.getElementById("llm-response");
  responseDiv.textContent = response;
  responseDiv.style.display = "block";
});
