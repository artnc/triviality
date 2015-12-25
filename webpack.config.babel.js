import webpack from 'webpack';

const PROD = process.env.NODE_ENV === 'production';
const WEBPACK_DEV_PORT = 8080;

module.exports = {
  entry: PROD ? [
    `${__dirname}/src/index.jsx`
  ] : [
    `webpack-dev-server/client?http://localhost:${WEBPACK_DEV_PORT}`,
    'webpack/hot/only-dev-server',
    `${__dirname}/src/index.jsx`
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: PROD ? 'babel' : 'react-hot!babel'
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
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
    hot: !PROD
  },
  plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin()
  ] : [
    new webpack.HotModuleReplacementPlugin()
  ]
};
