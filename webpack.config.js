// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

const HtmlWebpackPlugin = require("html-webpack-plugin");

const CONFIG = {
  mode: "development",

  entry: {
    app: "./app.js",
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      title: "Wind Particle",
    }),
  ],
  output: {
    libraryTarget: "var",
    library: "app",
  },
};

// This line enables bundling against src in this repo rather than installed module
module.exports = CONFIG;
