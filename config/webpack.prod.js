const path = require('path');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonConfig = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  entry: path.join(__dirname, '../src/index.tsx'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist'),
    library: {
      name: 'ImUI',
      type: 'umd',
    },
    clean: true,
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
};

module.exports = merge(commonConfig(/src/), prodConfig);
