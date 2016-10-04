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

class TickerSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chosenTickers: []
    };
  }

  getValue() {
    return this.state.chosenTickers;
  }

  _onchange(event) {
    var chosenTickers = [];
    for (var i = 0; i < event.target.selectedOptions.length; i++) {
      chosenTickers.push(event.target.selectedOptions[i].value);
    }
    this.setState({
      chosenTickers: chosenTickers
    });
  }

  render() {
    if (this.state.chosenTickers.length > 0) {
      var chosenTickers = (
        <div>
          <b>Chosen symbols: </b>
          {this.state.chosenTickers.join(', ')}
        </div>
      )
    } else {
      var chosenTickers = null;
    }

    var tickers = this.props.data;

    return (
      <div>
        <div className="form-group">
          <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Choose symbols representing data to be plotted. You can select up to 3 symbols. To select more than one use CTRL or SHIFT button." data-placement="right">
          </span>
          <label htmlFor="tickersSelection">Select symbols: </label>
          <select multiple onChange={this._onchange.bind(this)} className="form-control" size="6" id="tickersSelection">
            {
              Object.keys(tickers).map(function (tickersGroup) {
                return (
                  <optgroup label={tickersGroup}>
                    {
                      Object.keys(tickers[tickersGroup]).map(function (ticker, idx) {
                        return (
                          <option key={idx} value={ticker}>{tickers[tickersGroup][ticker] + ' (' + ticker + ')'}</option>
                        );
                      })
                    }
                  </optgroup>
                );
              })
            }
          </select>
          <a href="/importData" className="special-link" >Import custom company data</a>
        </div>
        {chosenTickers}
      </div>
    );
  }
}

module.exports = TickerSelection;
