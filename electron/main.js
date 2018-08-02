import { app, BrowserWindow } from 'electron';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import wpMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

const PORT = 3000;

const compiler = webpack({
  mode: process.env.NODE_ENV,
  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${PORT}/hmr`,
    './src/index.js'
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    proxy: [
      {
        path: '/connect/**',
        target: 'https://localhost:8088/',
        changeOrigin: true
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: `http://localhost:${3000}/`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
});

const expressApp = express();
expressApp.use(wpMiddleware(compiler));
expressApp.use(
  hotMiddleware(compiler, {
    path: '/hmr'
  })
);
expressApp.listen(PORT, () =>
  console.log('Webpack dev server running on' + PORT)
);

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  win.loadFile('index.html');
}

app.on('ready', createWindow);
