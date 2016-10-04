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
var util = require('util');
import Input from "../IO/Input.jsx"
import Chart from "../Chart/Chart.jsx"
import ScoringChart from "../Chart/ScoringChart.jsx"
import ScoringInput from "../IO/ScoringInput.jsx"
import Table from "../IO/Table.jsx"
import Loader from "./Loader.jsx"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  _setData(tickers, start, end) {
    this.setState({
      loading: true
    });
    var ctx = this;
    let url = `/stockData?tickers=${tickers.join(',')}&start=${start}&end=${end}`;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(data) {
        data.errors.forEach(function(error){
          ctx.refs['input'].refs['tickersAlertBox'].error(error);
        });
        data.warnings.forEach(function(warning){
          ctx.refs['input'].refs['tickersAlertBox'].warn(warning);
        });
        ctx.setState({
          data: data.result,
          scoringData: null,
          loading: false
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        ctx.setState({
          loading: false
        });

        ctx.refs['input'].refs['totalScoringAlertBox'].error('Service connection error. Please try again later');
        console.log('score failure', errorThrown);
      }
    });
  }

  _setScoringData(runData) {
    this.setState({
      loading: true
    });

    var counter = 10;
    var ctx = this;
    var socket;
    var intervalId = setInterval(function () {
      --counter;
      if(counter == 0) {
        clearInterval(intervalId);
        console.log('Cannot establish connection with socket io server');
      }
      socket = io();
      socket.on('info', function (data) {
        ctx.refs["loader"].setInfo(data);
      });
      socket.on('connected', function (data) {
        clearInterval(intervalId);
        console.log('Successfully connected to socket io server');
        ctx.refs["loader"].setInfo('Preparing environment');
      });
    }, 1000);

    var ctx = this;
    this.state.data.forEach(function (tickerData) {
      if(tickerData.ticker === runData.ticker) {
        $.ajax({
          type: "POST",
          url: "/score",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify({
            data: tickerData,
            model: runData.model
          }),
          success: function (data) {

            if(socket)
              socket.disconnect();

            ctx.setState({
              loading: false
            });

            if (data.errors) {
              data.errors.forEach(function(error){
                ctx.refs['scoringInput'].refs['tickersSelection'].error(error);
              });
            }
            ctx.setState({
              scoringData: data.result
            });
          },
          error: function (jqXHR, textStatus, errorThrown) {
            if(socket)
              socket.disconnect();

            ctx.setState({
              loading: false
            });

            ctx.refs['scoringInput'].refs['tickersSelection'].error('Service connection error. Please try again later');
            console.log('score failure', errorThrown);
          }
        });
      }
    });
  }

  _onScoringError(errors, warnings) {
    var ctx = this;
    if (errors) {
      errors.map(function (error) {
        ctx.refs['input'].refs['totalScoringAlertBox'].error(error);
      });
    }
    if (warnings) {
      warnings.map(function (warning) {
        ctx.refs['input'].refs['totalScoringAlertBox'].warn(warning);
      });
    }
  }

  render() {
    if(this.state.loading) {
      var loading = (
      <div className="loadingOverlayContainer">
        <div className="loadingContainer">
          <Loader ref="loader" />
        </div>
      </div>
      );
    } else {
      var loading = null;
    }

    if(!this.state.scoringData || this.state.scoringData.length === 0)
      var scoringOutput = null;
    else
      var scoringOutput = (
        <ScoringChart data={this.state.scoringData} />
      );

    if (!this.state.data || this.state.data.length === 0) {
      var renderedCharts = null;
    } else {
      var options = this.state.data.map(function (tickerData) {
        return tickerData.ticker;
      });
      var renderedCharts = (
        <div>
          <Chart data={this.state.data} />
          <ScoringInput ref="scoringInput" onerror={this._onScoringError.bind(this)} onchange={this._setScoringData.bind(this)} data={this.state.data} options={options} />
          {scoringOutput}
        </div>
      );
    }

    return (
      <div>
        {loading}
        <Input ref="input" onchange={this._setData.bind(this)} />
        {renderedCharts}
      </div>
    );
  }
}

module.exports = App;
