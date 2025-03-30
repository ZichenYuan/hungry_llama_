// Save options to chrome.storage
function saveOptions() {
  const apiKey = document.getElementById("api-key").value;

  chrome.storage.sync.set({ groqApiKey: apiKey }, function () {
    // Update status to let user know options were saved
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    status.className = "success";
    setTimeout(function () {
      status.textContent = "";
      status.className = "";
    }, 3000);
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get({ groqApiKey: "" }, function (items) {
    document.getElementById("api-key").value = items.groqApiKey;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
