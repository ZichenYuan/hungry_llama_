// background.js - Service worker for the Chrome extension
console.log('Hungry Llama background script loaded');

// Import configuration
import CONFIG from './config.js';

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
      clientId: CONFIG.GOOGLE_CLIENT_ID,
      // Don't send the client secret to the frontend for security reasons
    });
    return true;
  }
  
  return false;
});