console.log('Excel Copilot extension loaded');

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // Get references to the UI elements
  const authorizeButton = document.getElementById('authorize');
  const readSheetButton = document.getElementById('read-sheet');
  const analyzeButton = document.getElementById('analyze-data');
  const statusDiv = document.getElementById('status');
  
  // Display initial status
  if (statusDiv) {
    console.log('Status div found');
    statusDiv.textContent = 'Extension loaded successfully!';
  } else {
    console.error('Status div not found!');
  }
  
  // Add event listeners to buttons
  if (authorizeButton) {
    authorizeButton.addEventListener('click', function() {
      console.log('Authorize button clicked');
      updateStatus('Authorization feature coming soon!');
    });
  }
  
  if (readSheetButton) {
    readSheetButton.addEventListener('click', function() {
      console.log('Read Sheet button clicked');
      updateStatus('Sheet reading feature coming soon!');
    });
  }
  
  if (analyzeButton) {
    analyzeButton.addEventListener('click', function() {
      console.log('Analyze Data button clicked');
      updateStatus('Analysis feature coming soon!');
    });
  }
  
  // Helper function to update status
  function updateStatus(message) {
    if (statusDiv) {
      statusDiv.textContent = message;
      console.log('Status updated:', message);
    }
  }
});