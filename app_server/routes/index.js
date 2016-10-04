/* eslint-env node es6

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

const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');
var ioHolder;
const forecastApi = require('../clients/pa/forecast-api');
const logger = require('../utils/log4js-log-util').getLogger('routes');
const fs = require('fs');
const numbers = require('numbers');
const config = require('../../config');
const PAClient = require('../clients/pa/pa-client');
const fileDataExtractor = require('../clients/file-data-extractor');

let paClient = new PAClient();

function _handleDownloadFunction(data) {
  var i;
  var logReturn = [];
  var allLogReturnValues = [];
  for (i = 1; i < data.length; ++i) {
    var value = Math.log(data[i].Value) - Math.log(data[i - 1].Value);
    allLogReturnValues.push(value);
    logReturn.push({
      Date: data[i].Date,
      Value: value
    });
  }

  // counting statisticalSummary
  var allBasicValues = data.map(function (el) {
    return parseFloat(el.Value);
  });
  var summaryStatistics = {
    data: {
      mean: numbers.statistic.mean(allBasicValues),
      median: numbers.statistic.median(allBasicValues),
      mode: numbers.statistic.mode(allBasicValues),
      standardDev: numbers.statistic.standardDev(allBasicValues),
      min: Math.min(...allBasicValues),
      max: Math.max(...allBasicValues)
    },
    logReturn: {
      mean: numbers.statistic.mean(allLogReturnValues),
      median: numbers.statistic.median(allLogReturnValues),
      mode: numbers.statistic.mode(allLogReturnValues),
      standardDev: numbers.statistic.standardDev(allLogReturnValues),
      min: Math.min(...allLogReturnValues),
      max: Math.max(...allLogReturnValues)
    }
  };

  return {
    data: data,
    logReturn: logReturn,
    summaryStatistics: summaryStatistics
  };
}

/* GET home page. */
router.get('/', ctrlLocations.main);
router.get('/overview', ctrlLocations.main);
router.get('/importData', ctrlLocations.main);

router.get('/stockData', function (req, res) {
  logger.enter('/stockData', req.query);

  let tickers = req.query.tickers.split(',');
  let startDate = req.query.start;
  let endDate = req.query.end;

  let result = [];
  let errors = [];
  let warnings = [];

  tickers.forEach(function (ticker) {
    fileDataExtractor.getData(ticker, startDate, endDate, function (err, data) {
      if (err || !data) {
        logger.warn(`No data found for symbol: ${ticker}`);
        errors.push(`No data found for symbol: ${ticker}`);
      } else if (data.length > 0) {
        if(data.length < (new Date(endDate) - new Date(startDate))/(1000*60*60*24*31) - 1)
          warnings.push(`Too little amount of data loaded to the system for specified date range for symbol: ${ticker}. Plots and forecast can be not accurate`);

        data = _handleDownloadFunction(data);
        data.ticker = ticker;
        result.push(data);
      } else {
        logger.warn(`No data found in specified date range for symbol: ${ticker}`);
        errors.push(`No data found in specified date range for symbol: ${ticker}`);
      }
    });
  });

  var intervalId = setInterval(function () {
    if (errors.length + result.length >= tickers.length) {
      clearInterval(intervalId);
      logger.return('/stockData');
      res.json({result: result, errors: errors, warnings: warnings});
    }
  }, 1000);
});

function _validateFormat(tableData) {
  if (Object.keys(tableData).length > 2)
    return false;

  if (tableData.DATE === 'DATE' && tableData.VALUE === 'DOUBLE')
    return true;
  else
    return false;
}

router.get('/modelsData', function (req, res) {
  paClient.getModels(function (errors, models) {
    var validModels = [];
    var warnings = [];
    models.forEach(function (modelData) {
      if (modelData.tableData.in && _validateFormat(modelData.tableData.in))
        validModels.push(modelData);
      else {
        warnings.push(`\"${modelData.id}\" model has incorrect format. Valid format is described in application documentation`);
      }
    });
    res.json({errors: errors, warnings: warnings, result: validModels});
  });
});

router.post('/score', function (req, res) {
  var socket;
  if (ioHolder) {
    logger.debug('socket io initialized');
    ioHolder.io.on('connection', function (preparedSocket) {
      if (!socket) {
        socket = preparedSocket;
        socket.emit('connected', {});
        logger.debug('connected with socket io client');
        socket.on('disconnect', function () {
          logger.debug('disconnected with socket io client');
        });
      }
    });
  } else {
    logger.warn('socket io is not initialized');
  }

  forecastApi.run(req.body.data, req.body.model,
    function (msg) {
      if (socket)
        socket.emit('info', msg);
      else
        console.log(msg);
    }, function (error, data) {
      res.json({errors: error, result: data});
    }
  );
});

router.post('/stockData', function (req, res) {
  var ticker = req.query.ticker;
  var companyName = req.query.companyName;
  var data = req.body.data;

  fs.writeFile(`config/data/${ticker}.csv`, data, function (err) {
    if (err) {
      res.json({error: err});
    } else {
      fs.readFile('config/tickers.json', 'utf8', function (err, data) {
        if (err) {
          res.json({error: err});
        }
        var tickers = JSON.parse(data);

        if (!tickers['User provided time series']) {
          tickers['User provided time series'] = {};
        }

        tickers['User provided time series'][ticker] = companyName;

        fs.writeFile('config/tickers.json', JSON.stringify(tickers), function (err) {
          if (err) {
            res.json({error: err});
          } else {
            res.json({});
          }
        });
      });
    }
  });
});

router.get('/tickers', function (req, res) {
  fs.readFile('config/tickers.json', 'utf8', function (err, data) {
    if (err) {
      res.json({error: err});
    } else {
      res.json(JSON.parse(data));
    }
  });
});

module.exports = function (passedIoHolder) {
  ioHolder = passedIoHolder;
  return router;
};
