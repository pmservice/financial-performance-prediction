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
import PlotlyChart from "../Chart/PlotlyBasicChart.jsx"
var json2plotly = require('../../../app_server/utils/json2plotly-util');

class Chart extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    location.href = "#";
    location.href = "#scoringChart";
  }

  render() {
    var headers = ['VALUE', '$TS-VALUE', '$TSLCI-VALUE', '$TSUCI-VALUE'];
    var data = json2plotly.scoringLineChart(this.props.data, headers,
      {
        'VALUE': 'Original series',
        '$TS-VALUE': 'Model fit and forecast',
        '$TSLCI-VALUE': 'Lower confidence interval',
        '$TSUCI-VALUE': 'Upper confidence interval'
      }
    );

    return (
      <div id="scoringChart" className="row">
        <div className="col-sm-12">
          <PlotlyChart data={data.data} width-to-height-ratio={3} layout={data.layout} id="scoringCharts_lineChart" />
        </div>
      </div>
    );
  }
}

module.exports = Chart;
