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

const log4js = require('log4js');
const config = require('../../config');

log4js.configure({
  appenders: [
    {type: 'console'}
  ]
});

function _toString(obj) {
  if (typeof obj === 'object')
    return JSON.stringify(obj);
  else
    return obj;
}

var customLogger = {
  getLogger: function (name) {
    var logger = log4js.getLogger(name);

    logger.setLevel(config('log4js:level'));

    logger.enter = function (where, args) {
      if (typeof args === 'undefined')
        this.debug('entering ' + where);
      else
        this.debug('entering ' + where + ', arg(s): ' + _toString(args));
    };
    logger.return = function (where, returnValue) {
      if (typeof returnValue === 'undefined')
        this.debug('returning from ' + where);
      else
        this.debug('returning from ' + where + ', return: ' + _toString(returnValue));
    };

    return logger;
  }
};

module.exports = customLogger;
