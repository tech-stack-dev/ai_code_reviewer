const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'node',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      process: 'process/browser',
      '@/config': path.resolve(__dirname, 'src/config/'),
      '@/modules': path.resolve(__dirname, 'src/modules/'),
      '@/core': path.resolve(__dirname, 'src/core/'),
      '@/prompts': path.resolve(__dirname, 'src/prompts/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
};
