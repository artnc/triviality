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

module.exports = {
  entry: [...envConfig.entry, `${__dirname}/src/index.jsx`],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [...envConfig.jsLoaders, 'babel']
      },
      {
        test: /\.s?css$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass'
      }
    ]
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.css']
  },
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: `${__dirname}/dist`,
    hot: true
  },
  plugins: [
    ...envConfig.plugins,
    new webpack.DefinePlugin({
      DEV: !PROD,
      PROD
    })
  ]
};
