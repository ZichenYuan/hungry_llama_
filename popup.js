// Simple popup script
console.log('Excel Copilot loaded');

// Function to update status
function updateStatus(message) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = message;
    console.log('Status updated:', message);
  }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
  
  // Update initial status
  updateStatus('Extension loaded successfully!');
  
  // Add button click handlers
  document.getElementById('authorize').addEventListener('click', function() {
    updateStatus('Authorization feature coming soon!');
  });
  
  document.getElementById('read-sheet').addEventListener('click', function() {
    updateStatus('Sheet reading feature coming soon!');
  });
  
  document.getElementById('analyze-data').addEventListener('click', function() {
    updateStatus('Analysis feature coming soon!');
  });
});