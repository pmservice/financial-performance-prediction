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

process.env.NODE_ENV = 'test';
let config = require('../../config');

function extractPACredentials() {
  let result = config('pm-20:credentials');
  if (typeof result === 'undefined') {
    throw new Error('Test environment not configured, need credentials for PA service. Fill in ./test/config.json pm-20 section.');
  }
  return config('pm-20:credentials');
}

function extractDashDBCredentials() {
  let result = config('dashDB:credentials');
  if (typeof result === 'undefined') {
    throw new Error('Test environment not configured, need credentials for PA service. Fill in ./test/config.json dashDB section.');
  }
  return config('dashDB:credentials');
}

module.exports = {
  extractPACredentials: extractPACredentials,
  extractDashDBCredentials: extractDashDBCredentials
};
