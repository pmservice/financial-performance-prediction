/* eslint-env node

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

const config = require('../../../config');
const log4js = require('../../utils/log4js-log-util');
const logger = log4js.getLogger('clients/pa/pa-client');
const parseString = require('xml2js').parseString;

let db1Host = config('dashDB:credentials:host');
let db1Password = config('dashDB:credentials:password');
let db1Port = config('dashDB:credentials:port');
let db1Username = config('dashDB:credentials:username');

function getJobJson(action, modelId, modelName, tableName, inputsNode) {
  // TODO error handling
  let training = require('./training.json');
  return eval('`' + JSON.stringify(training) + '`');
}

function parseModelMetadata(metadata, callback) {
  parseString(metadata, {
    trim: true
  }, function (error, result) {
    if (!error) {
      var scoringInput = {
        'tableData': {}
      };

      result['metadata']['table'].forEach(function (tableEntry) {
        var fields = tableEntry['field'];
        var fieldsNames = {};
        for (var item in fields) {
          fieldsNames[fields[item]['$']['name']] =
              fields[item]['$']['storageType'];
        }
        scoringInput.tableData[tableEntry['$']['name']] = fieldsNames;
      });
      return callback(null, scoringInput);
    } else {
      logger.error('error in parseModelMetadata(), msg: ' + error);
      return callback(error);
    }
  });
}

module.exports = {
  getJobJson: getJobJson,
  parseModelMetadata: parseModelMetadata
};
