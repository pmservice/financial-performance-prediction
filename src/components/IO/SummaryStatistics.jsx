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

class SummaryStatistics extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var data = this.props.data;
    var ctx = this;

    return (
      <div>
      <h4>Summary Statistics (Log Return)</h4>
      <table className="table small-text-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Mean</th>
            <th>Median</th>
            <th>Mode</th>
            <th>St. Dev</th>
            <th>Range</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map(function (dataPiece) {
              return (
                <tr>
                  <td>{dataPiece.ticker}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].mean.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].median.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].mode.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].standardDev.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].min.toFixed(4))} - {parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].max.toFixed(4))}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
      </div>
    );
  }
}

module.exports = SummaryStatistics;
