const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = function commonConfig(babelInclude) {
  return {
    resolve: {
      extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|jsx|tsx)$/,
          include: babelInclude,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env'],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                [
                  '@babel/plugin-transform-runtime',
                  {
                    corejs: {
                      version: 3,
                      proposals: true,
                    },
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.(css|less)$/i,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
              },
            },
            'less-loader',
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
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: '[hash].css' }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'local'),
      }),
    ],
  };
};
