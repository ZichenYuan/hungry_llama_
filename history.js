document.addEventListener("DOMContentLoaded", function () {
  // Load history items
  loadHistoryItems();

  // Set up event listeners
  document
    .getElementById("clear-history")
    .addEventListener("click", clearHistory);
  document
    .getElementById("back-to-popup")
    .addEventListener("click", function () {
      window.close();
    });
});

// Function to load history items from storage
function loadHistoryItems() {
  chrome.storage.local.get(["llamaHistory"], function (result) {
    const historyContainer = document.getElementById("history-container");

    if (result.llamaHistory && result.llamaHistory.length > 0) {
      // Clear the container
      historyContainer.innerHTML = "";

      // Add each history item
      result.llamaHistory.forEach((item, index) => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const date = new Date(item.timestamp);
        const formattedDate =
          date.toLocaleDateString() + " " + date.toLocaleTimeString();

        historyItem.innerHTML = `
            <div class="history-meta">
              <span>${formattedDate}</span>
              <span>Item ${index + 1}</span>
            </div>
            <div class="history-content">${item.response}</div>
            <div class="history-prompt">Prompt: ${item.prompt}</div>
            <button class="copy-btn" data-index="${index}">Copy</button>
          `;

        historyContainer.appendChild(historyItem);
      });

      // Add event listeners to copy buttons
      document.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          const text = result.llamaHistory[index].response;
          copyToClipboard(text);
        });
      });
    } else {
      historyContainer.innerHTML =
        '<div class="no-history">No history found</div>';
    }
  });
}

// Function to clear history
function clearHistory() {
  if (confirm("Are you sure you want to clear all history?")) {
    chrome.storage.local.set({ llamaHistory: [] }, function () {
      loadHistoryItems(); // Reload the empty history
    });
  }
}

// Function to copy text to clipboard
function copyToClipboard(text) {
//   navigator.clipboard
//     .writeText(text)
//     .then(() => {
//       alert("Copied to clipboard!");
//     })
//     .catch((err) => {
//       console.error("Failed to copy text: ", err);
//     });
}
