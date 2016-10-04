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
import SummaryStatistics from "../IO/SummaryStatistics.jsx"
import MathMLMatrix from "../IO/MathMLMatrix.jsx"

class Chart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if(this.props.data.length > 1) {
      var scatterplotMatrixData = json2plotly.scatterplotMatrix(this.props.data, 'logReturn');
      scatterplotMatrixData.layout.title = 'Scatterplot Matrix (Log Return)';
      var scatterplotMatrix = (
        <PlotlyChart data={scatterplotMatrixData.data} width-to-height-ratio={1} layout={scatterplotMatrixData.layout} id="charts_scatterplotMatrixChart" />
      );
    } else {
      var scatterplotMatrix = null;
    }

    var data = json2plotly.basicChart(this.props.data, 'data', 'scatter');
    var logReturn = json2plotly.histogram(this.props.data, 'logReturn');
    return (
      <div className="row">
        <div className="col-sm-6">
          <PlotlyChart data={data} width-to-height-ratio={1.5} layout={{title: 'Time series'}} id="charts_lineChart" />
          {scatterplotMatrix}
        </div>
        <div className="col-sm-6">
          <PlotlyChart data={logReturn} width-to-height-ratio={1.5} layout={{title: 'Log Return', barmode: 'overlay'}} id="charts_logReturnChart" />
          <SummaryStatistics data={this.props.data} dataPart="logReturn" />
        </div>
      </div>
    );
  }
}

module.exports = Chart;
