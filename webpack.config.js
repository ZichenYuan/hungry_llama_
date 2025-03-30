import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const result = dotenv.config();
console.log('DOTENV RESULT:', result);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);

export default {
  mode: "development",
  devtool: "source-map",
  entry: {
    popup: "./popup.js",
    options: "./options.js",
    history: './history.js',
    config: './config.js',
    background: './background.js'
  },
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    // Define plugin for environment variables
    new webpack.DefinePlugin({
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(process.env.GOOGLE_CLIENT_SECRET)
    }),
    new CopyPlugin({
      patterns: [
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
};