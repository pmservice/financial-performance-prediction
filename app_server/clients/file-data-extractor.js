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

var fs = require('fs');
var logger = require('../utils/log4js-log-util').getLogger('clients/file-data-extractor');
var csv2json = require('../utils/csv2json-util.js');

var pathToData = 'config/data';

function _getData(ticker, startDate, endDate, callback) {
  logger.enter(
    '_getData()',
    {ticker: ticker, startDate: startDate, endDate: endDate}
  );

  fs.readFile(`${pathToData}/${ticker}.csv`, 'utf8', function (err, data) {
    if (err) {
      logger.error(err);
      return callback(err);
    } else {
      data = csv2json.translate(data);
      var finalData = [];
      data.forEach(function (dataPiece) {
        if (new Date(dataPiece.Date) > new Date(startDate) &&
          new Date(dataPiece.Date) < new Date(endDate))
          finalData.push(dataPiece);
      });
      logger.return('_getData()', {numberOfData: finalData.length});
      return callback(null, finalData);
    }
  });
}

module.exports = {
  getData: _getData
};
