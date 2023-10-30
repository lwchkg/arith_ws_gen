const VueLoaderPlugin = require("vue-loader/lib/plugin");
const nodeExternals = require("webpack-node-externals");

const path = require("path");

const npmConfig = {
  target: "node",
  entry: path.resolve(__dirname, "src", "index.ts"),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "lib.node.js"
  }
};

const websiteConfig = {
  entry: "./src/frontends/website/index.ts",
  output: {
    filename: "vueapp.js",
    path: path.resolve(__dirname, "website")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: { appendTsSuffixTo: [/\.vue$/] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: { ts: "ts-loader" }
        }
      }
    ]
  },
  plugins: [new VueLoaderPlugin()],
  resolve: {
    alias: { vue$: "vue/dist/vue.esm.js" }
  }
};

module.exports = [npmConfig, websiteConfig];
