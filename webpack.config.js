import path from "path";
import { fileURLToPath } from 'url';
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("DOTENV RESULT:", dotenv.config());
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

export default {
  mode: "development",
  devtool: "source-map",
  entry: {
    popup: "./popup.js",
    options: "./options.js",
    history: "./history.js",
    config: "./config.js",
    background: "./background.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  experiments: {
    outputModule: false
  },
  plugins: [
    // Define plugin for environment variables
    new webpack.DefinePlugin({
      "process.env.GOOGLE_CLIENT_ID": JSON.stringify(
        process.env.GOOGLE_CLIENT_ID
      ),
      "process.env.GOOGLE_CLIENT_SECRET": JSON.stringify(
        process.env.GOOGLE_CLIENT_SECRET
      ),
    }),
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "manifest.json" },
        { from: "popup.html" },
        { from: "images", to: "images" },
        { from: "styles.css" },
        { from: "options.html" },
        { from: "options.css" },
        { from: "history.html" },
        { from: "history.css" },
      ],
    }),
  ],
  // Add this to handle modules properly for background service worker
  resolve: {
    extensions: ['.js', '.json']
  }
};