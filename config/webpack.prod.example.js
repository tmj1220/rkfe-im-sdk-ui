const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('./webpack.common');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = process.env.NODE_ENV;
const vc = require('../version.config.json');
const publicPath = `https://static.rokidcdn.com/${env}/rkfe-im-sdk-ui/${vc[env]}/`;

const exampleProdConfig = {
  mode: 'production',
  entry: path.join(__dirname, '../example/index.tsx'),
  output: {
    filename: '[hash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: publicPath,
    clean: true,
  },
  module: {
    rules: [
      {
        test: /antd\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env'],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../example/index.html'),
    }),
  ],
};

module.exports = merge(commonConfig(/src|example/), exampleProdConfig);
