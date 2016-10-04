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

class LineChart extends React.Component {
  constructor(props) {
    super(props);
  };

  componentDidMount() {
    var width = document.getElementById(this.props.id + "_container").clientWidth;
    this.setState({
      width: width,
      height: width/this.props["width-to-height-ratio"]
    });
    this._draw(width, width/this.props["width-to-height-ratio"]);
  };

  componentDidUpdate() {
    this._clean();
    this._draw(this.state.width, this.state.height);
  };

  _draw(width, height){
    var layout= {
      autosize: false,
      width: width,
      height: height,
      margin: {
        l: 40,
        r: 40,
        b: 80,
        t: 80,
        pad: 4
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: '#ffffff'
      },
      xaxis: {
        showgrid: false,
        showline: true,
        linecolor: 'white'
      },
      yaxis: {
        showgrid: false,
        showline: true,
        linecolor: 'white'
      }
    };
    for(var attrName in this.props.layout)
      layout[attrName] = this.props.layout[attrName];
    Plotly.newPlot(document.getElementById(this.props.id), this.props.data, layout);
  }

  _clean() {
    if(document.getElementById(this.props.id) !== null){
      var chartDiv = document.getElementById(this.props.id);
      while (chartDiv.firstChild) {
        chartDiv.removeChild(chartDiv.firstChild);
      }
    }
  }

  render() {
    return (
      <div id={this.props.id + "_container"}>
        <div id={this.props.id}></div>
      </div>
    );
  };
}

module.exports = LineChart;
