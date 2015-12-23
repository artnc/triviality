module.exports = {
  entry: [
    __dirname + '/src/index.js'
  ],
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: __dirname + '/dist'
  }
};
