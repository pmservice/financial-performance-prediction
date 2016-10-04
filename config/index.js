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

const nconf = require('nconf');
const path = require('path');

nconf.argv();
nconf.add('vcapServices', {type: 'literal', store: _getVcapServicesAsJson()});
if (process.env.NODE_ENV === 'test') {
  nconf.file('test', path.join(__dirname, '../test/config.json'));
}
nconf.file('dev', path.join(__dirname, 'local.json'));
nconf.file('logger', path.join(__dirname, 'logger-config.json'));

function _flattenArrayDataInJson(jsonObj) {
  for (let p in jsonObj) {
    if (Array.isArray(jsonObj[p])) {
      jsonObj[p] = jsonObj[p][0];
    }
  }
  return jsonObj;
}

function _getVcapServicesAsJson() {
  let vcapSvcRaw = process.env.VCAP_SERVICES;
  let vcapSvcJSON;
  // Parse VCAP Services into JSON
  if (vcapSvcRaw) {
    console.log('Parsing JSON from VCAP_SERVICES environment variable');
    try {
      vcapSvcJSON = JSON.parse(vcapSvcRaw);
      if (!vcapSvcJSON) {
        console.log('VCAP_SERVICES JSON is not defined');
        return null;
      }
      vcapSvcJSON = _flattenArrayDataInJson(vcapSvcJSON);
    } catch (error) {
      console.log('Failed to parse JSON from VCAP_SERVICES environment variable');
      console.log(error);
      return null;
    }
  }
  return vcapSvcJSON;
}

module.exports = nconf.get.bind(nconf);
