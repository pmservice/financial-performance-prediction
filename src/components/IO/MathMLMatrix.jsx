/* eslint-env browser

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

"use strict";

import React from "react";
var numbers = require('numbers');

class Input extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var matrix = [];
    var data = this.props.data;

    for(var i = 0; i < data.length; ++ i) {
      matrix.push([]);
      for(var j = 0; j < data.length; ++j) {
        if(i === j) {
          matrix[i][j] = 1;
        } else if(j < i) {
          matrix[i][j] = matrix[j][i]
        } else {
          var x = data[i][this.props.dataPart].map(function (el) {
            return parseFloat(el.Value);
          });

          var y = data[j][this.props.dataPart].map(function (el) {
            return parseFloat(el.Value);
          });

          var minLen = Math.min(x.length, y.length);

          x = x.slice(0, minLen);
          y = y.slice(0, minLen);

          matrix[i].push(numbers.statistic.correlation(x, y));
        }
      }
    }

    return (
      <div style={{"paddingTop": "30px", "paddingBottom": "30px"}}>
      <math display="inline">
        <mi>{this.props.title}</mi>
        <mo>=</mo>
        <mrow>
          <mo>[</mo>
            <mtable>
              {matrix.map(function (row) {
                return (
                  <mtr>
                    {row.map(function (el) {
                      return (
                        <mtd>
                          <mn>
                            {parseFloat(el.toFixed(2))}
                          </mn>
                        </mtd>
                      );
                    })}
                  </mtr>
                );
              })}
            </mtable>
          <mo>]</mo>
        </mrow>
      </math>
      </div>
    );
  }
}

module.exports = Input;
