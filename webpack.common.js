const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FontPreloadPlugin = require('webpack-font-preload-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    app: './src/js/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {from: 'src/images', to: 'images'},
        {from: 'src/root'},
      ],
    }),
    new FontPreloadPlugin({
      index: 'index.html',
      insertBefore: 'link:first-of-type',
      loadType: 'preload',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        // Encapsulated shadow DOM styles in web components.
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, 'src/js/components')
        ],
        use: [
          'lit-css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'modern',
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },
      {
        // App shell styles and custom properties.
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, 'src/styles')
        ],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'modern',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
  },
}