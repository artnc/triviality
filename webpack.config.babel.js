import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

const WEBPACK_DEV_PORT = 8080;

/* Environment-specific config */

const PROD = process.env.NODE_ENV === 'production';
const envConfig = PROD ? {
  entry: [],
  jsLoaders: [],
  plugins: [new webpack.optimize.UglifyJsPlugin()]
} : {
  entry: [
    `webpack-dev-server/client?http://localhost:${WEBPACK_DEV_PORT}`,
    'webpack/hot/only-dev-server'
  ],
  jsLoaders: ['react-hot'],
  plugins: [new webpack.HotModuleReplacementPlugin()]
};

/* Base config */

export default {
  debug: !PROD,
  devServer: {
    contentBase: `${__dirname}/dist`,
    hot: true
  },
  entry: [...envConfig.entry, `${__dirname}/src/main.jsx`],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [...envConfig.jsLoaders, 'babel']
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          'style',
          'css?modules&importLoaders=1' +
            '&localIdentName=[name]__[local]___[hash:base64:5]!sass'
        )
      }
    ]
  },
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.scss']
  },
  plugins: [
    ...envConfig.plugins,
    new webpack.DefinePlugin({
      DEV: !PROD,
      PROD
    }),
    new ExtractTextPlugin('styles.css')
  ]
};
