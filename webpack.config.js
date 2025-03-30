import path from "path";
import CopyPlugin from "copy-webpack-plugin";

export default {
  mode: "development",
  devtool: "source-map",
  entry: {
    popup: "./popup.js",
    options: "./options.js",
    history: './history.js'
  },
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "manifest.json" },
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