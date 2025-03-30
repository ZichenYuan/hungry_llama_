// background.js - Service worker for the Chrome extension
console.log('Hungry Llama background script loaded');

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // You could open options page on install to prompt for API key
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  if (message.action === 'getApiKey') {
    chrome.storage.sync.get(['groqApiKey'], (result) => {
      sendResponse({ apiKey: result.groqApiKey || null });
    });
    return true; // Required for async response
  }
  
  if (message.action === 'getGoogleConfig') {
    sendResponse({ 
      clientId: `861871143534-0pm2f391rbbm8k5t1lp6c5fpfbdsadan.apps.googleusercontent.com`,
    });
    return true;
  }
  
  return false;
});