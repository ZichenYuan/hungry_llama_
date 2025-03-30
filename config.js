// config.js - Environment variables and global configuration
// These values will be replaced by webpack during build

const CONFIG = {
    // Values injected by webpack.DefinePlugin
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  };
  
  // Make CONFIG available globally for other scripts to access
  window.CONFIG = CONFIG;
  
  // Log configuration details (for debugging, remove in production)
  console.log("Config loaded:", {
    // Don't log the actual secrets in production
    hasClientId: !!CONFIG.GOOGLE_CLIENT_ID,
    hasClientSecret: !!CONFIG.GOOGLE_CLIENT_SECRET
  });
  
  export default CONFIG;