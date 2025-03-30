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
// THIS IS FAILING!!!!
// Function to chat with LLaMA LLM
async function chatWithLlama(
  userMessage,
  systemPrompt = "answer user message"
) {
  try {
    // API endpoint for chat completions
    const endpoint = "http://localhost:1234/api/v0/chat/completions";

    // Prepare the request body
    const requestBody = {
      model: "dolphin3.0-llama3.1-8b",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    };

    // Update status to show we're calling the LLM
    updateStatus("Calling LLM for assistance...");

    // Make the API call
    // const response = await fetch(endpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(requestBody),
    //   mode: "cors",
    // });

    // Parse and return the response
    //  const result = await response.json();

    const hardcodedResponse = {
      choices: [
        {
          message: {
            content: `This is a hardcoded response from the LLM.
                In order to do a sum of a column in Excel, you can use the formula:
                \`
                =SUM(A1:A10)
                \`
                Where A1:A10 is the range of cells you want to sum`,
          },
        },
      ],
    };
    const result = hardcodedResponse; // Use the hardcoded response for testing

    if (result.choices && result.choices.length > 0) {
      updateStatus("Received LLM response successfully");
      return result.choices[0].message.content;
    } else {
      updateStatus("No response generated from LLM");
      return "No response generated";
    }
  } catch (error) {
    console.error("Error calling LLaMA chat API:", error);
    updateStatus(`Error calling LLM: ${error.message}`);
    return `Error: ${error.message}`;
  }
}

// Add this to your DOMContentLoaded event handler
document.getElementById("ask-llm").addEventListener("click", async function () {
  const userPrompt = document.getElementById("user-prompt").value;
  if (!userPrompt) {
    updateStatus("Please enter a question first");
    return;
  }

  // System prompt focused on Excel assistance
  const systemPrompt =
    "You are an Excel assistant that helps users analyze data and create formulas. Provide concise and helpful responses for Excel-related questions.";

  // Call the LLM
  const response = await chatWithLlama(userPrompt, systemPrompt ?? null);

  // Display the response
  const responseDiv = document.getElementById("llm-response");
  responseDiv.textContent = response;
  responseDiv.style.display = "block";
});
