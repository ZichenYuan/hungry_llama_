import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default {
  mode: "development",
  devtool: "source-map",
  entry: {
    popup: "./popup.js",
    options: "./options.js",
    history: './history.js',
    config: './config.js'
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
        // This will replace the CLIENT_ID in manifest.json with the one from the .env file
        {
          from: "manifest.json",
          transform(content) {
            return content
              .toString()
              .replace(
                /\${CLIENT_ID}/g,
                process.env.GOOGLE_CLIENT_ID || "MISSING_CLIENT_ID"
              );
          },
        },
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