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

function _pa2json(data) {
  var lines = data.trim().split('\r\n');

  var header = lines[0].split('\t');
  lines.splice(0, 1);

  return lines.map(function (line) {
    var dataPiece = {};
    line.split('\t').forEach(function (el, index) {
      dataPiece[header[index]] = el;
    });

    return dataPiece;
  });
}

module.exports = {
  translate: _pa2json
};
