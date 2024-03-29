import cssnano from "cssnano";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import webpack from "webpack";

const WEBPACK_DEV_PORT = 9000;

/* Environment-specific config */

const PROD = process.env.NODE_ENV === "production";
const envConfig = PROD
  ? {
      entry: [],
      jsLoaders: [],
      plugins: [new webpack.optimize.UglifyJsPlugin()],
    }
  : {
      entry: [
        `webpack-dev-server/client?http://localhost:${WEBPACK_DEV_PORT}`,
        "webpack/hot/only-dev-server",
      ],
      jsLoaders: ["react-hot"],
      plugins: [new webpack.HotModuleReplacementPlugin()],
    };

/* Base config */

export default {
  debug: !PROD,
  devServer: {
    contentBase: `${__dirname}/dist`,
    hot: true,
  },
  entry: [...envConfig.entry, `${__dirname}/src/main.jsx`],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [...envConfig.jsLoaders, "babel"],
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          "style",
          [
            "css?modules&importLoaders=1" + "&localIdentName=[hash:base64:4]",
            "postcss",
            "sass",
          ].join("!")
        ),
      },
    ],
  },
  output: {
    path: `${__dirname}/dist/trivia`,
    publicPath: "/trivia",
    filename: "bundle.js",
  },
  resolve: {
    extensions: ["", ".jsx", ".js", ".scss"],
    root: [`${__dirname}/src`, `${__dirname}/node_modules`],
  },
  plugins: [
    ...envConfig.plugins,
    new webpack.DefinePlugin({
      __DEV__: !PROD,
      __LOG_STATES__: false,
      __PROD__: PROD,
    }),
    new ExtractTextPlugin("styles.css"),
  ],
  postcss: [
    cssnano({
      autoprefixer: {
        add: true,
        remove: true,
        browsers: ["last 2 versions"],
      },
      discardComments: {
        removeAll: true,
      },
    }),
  ],
};
