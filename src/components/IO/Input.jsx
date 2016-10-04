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
import Calendar from "./Calendar.jsx"
import AlertBox from "./AlertBox.jsx"
import TickerSelection from "./TickerSelection.jsx"

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tickers: {}
    };
  }

  _clearAlerts(callback) {
    this.refs['tickersAlertBox'].clear();
    this.refs['startAlertBox'].clear();
    this.refs['endAlertBox'].clear();

    var ctx = this;
    var intervalId = setInterval(function () {
      if(
        ctx.refs['tickersAlertBox'].isEmpty() &&
        ctx.refs['startAlertBox'].isEmpty() &&
        ctx.refs['endAlertBox'].isEmpty()
      ) {
        clearInterval(intervalId);
        return callback();
      }
    }, 2);
  }

  _validate() {
    var correctData = true;
    if(this.refs['tickersSelection'].getValue().length === 0){
      correctData = false;
      this.refs['tickersAlertBox'].error('Choose at least one symbol');
    }

    if(this.refs['tickersSelection'].getValue().length > 3){
      correctData = false;
      this.refs['tickersAlertBox'].error('Choose up to 3 symbols');
    }

    if(this.refs.start.isEmpty()){
      correctData = false;
      this.refs['startAlertBox'].error('Please define start date');
    } else if(new Date(this.refs.start.getValue()) > new Date()) {
      correctData = false;
      this.refs['startAlertBox'].error('Start date cannot be future date');
    }

    if(this.refs.end.isEmpty()){
      correctData = false;
      this.refs['endAlertBox'].error('Please define end date');
    } else if(new Date(this.refs.end.getValue()) > new Date()) {
      correctData = false;
      this.refs['endAlertBox'].error('End date cannot be future date');
    }

    if(!this.refs.start.isEmpty() && !this.refs.end.isEmpty()){
      if(new Date(this.refs.start.getValue()) >= new Date(this.refs.end.getValue())){
        correctData = false;
        this.refs['endAlertBox'].error('End date cannot be earlier than or equal to start date');
      }

      if(new Date(this.refs.end.getValue()) - new Date(this.refs.start.getValue()) < 1000*60*60*24*365*2){
        this.refs['endAlertBox'].warn('Date range is shorter than 2 years - this can result in unreliable training of the model');
      }
    }

    return correctData;
  }

  _onclick(event) {
    var ctx = this;
    this._clearAlerts(function () {
      if(ctx._validate())
        ctx.props.onchange(
          ctx.refs['tickersSelection'].getValue(),
          ctx.refs.start.getValue(),
          ctx.refs.end.getValue()
        );
    });
  }

  componentDidMount() {
    var ctx = this;
    $.get({
      url: '/tickers',
      type: 'GET',
      success: function (data) {
        ctx.setState({
          tickers: data
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        this.refs['totalScoringAlertBox'].error('Service connection error. Please try again later');
      }
    })
  }

  render() {
    return (
      <div className="well col-sm-12 base-color2 special-border">
        <div className="form-group">
          <div className="col-sm-12">
            <h3>Data Select Options</h3>
            <hr className="special-border" />
          </div>
          <div className="col-sm-7">
            <div className="form-group" key="tickers">
              <TickerSelection data={this.state.tickers} ref="tickersSelection" />
              <AlertBox ref="tickersAlertBox" />
            </div>
          </div>
          <div className="col-sm-5">
            <div className="form-group" key="period">
              <label htmlFor="start">From:</label>
              <Calendar ref="start" id="start" />
              <AlertBox ref="startAlertBox" />
              <label htmlFor="end">to:</label>
              <Calendar ref="end" id="end" />
              <AlertBox ref="endAlertBox" />
            </div>
          </div>
        </div>
        <div className="col-sm-12">
          <button onClick={this._onclick.bind(this)} className="btn btn-primary" type="button">Go!</button>
          <AlertBox ref="totalScoringAlertBox" />
        </div>
      </div>
    );
  }
}

module.exports = Input;
