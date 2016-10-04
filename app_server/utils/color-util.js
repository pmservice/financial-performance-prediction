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

var colors = [
  '#a2cfe4',
  '#a2e886',
  '#ffbf69',
  '#2aa21d',
  '#f20f08',
  '#cab1d9',
  '#1576bb',
  '#ff9794',
  '#fefe9c'
];

function _getColorByIndex(index) {
  return colors[index];
}

function _getMatrixColor(i, j) {
  return colors[j * 3 + i];
}

module.exports = {
  getColorByIndex: _getColorByIndex,
  getMatrixColor: _getMatrixColor
};
