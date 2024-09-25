const path = require('path');

module.exports = {
  mode: 'production', 
  entry: './src/main.ts',
  target: 'node', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), 
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
        process: "process/browser",
    }
},
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
