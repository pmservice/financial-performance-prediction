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

'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var ioHolder = {};

var routes = require('./app_server/routes')(ioHolder);

var app = express();
require('./app_server/utils/morgan-log-util')(app, 'log', 'financialTS', 'combined');

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '150mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public/build')));

app.use('/', routes);

// catch 404 and forward to error handler or redirect to application
app.use(function (req, res, next) {
  // redirect to application if error is caused by React Router
  if (req.originalUrl !== '/')
    res.redirect('/');
  else { // forward to error handler
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'Error occured'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'Error occured'
  });
});

module.exports = {
  getApp: function () {
    return app;
  },
  setServer: function (server) {
    ioHolder.io = require('socket.io')(server);
  }
};
