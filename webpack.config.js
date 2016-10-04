/*
   Copyright 2016 IBM Corp.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var webpack = require('webpack');  // eslint-disable-line
var path = require('path');  // eslint-disable-line

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      './src/builder.js'
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  devtool: 'source-map',
  output: {
    path: __dirname + '/public/build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        include: [
          path.join(__dirname, 'src')
        ],
        loaders: [
          'react-hot',
          'babel?presets[]=react,presets[]=es2015'
        ]
      },
      {test: /\.(html|png|jpg|jpeg|gif|eot|svg)$/,
          loader: 'file?name=[path][name].[ext]&context=./src/static'
        },
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.(woff|woff2)$/, loader: 'url?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'}
    ]
  }
};
