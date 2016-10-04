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
import DataInput from "./DataInput.jsx"
import AlertBox from "../IO/AlertBox.jsx"
var csv2json = require('../../../app_server/utils/csv2json-util');

class FileLoader extends React.Component {
  constructor(props) {
    super(props);
  }

  _convertYahooData(yahooData) {
    var jsonData = csv2json.translate(yahooData);
    var existsCorrectData = false;
    var finalFileContent = jsonData.map(function (row) {
      if(!existsCorrectData && row['Date'] && row['Adj Close'])
        existsCorrectData = true;
      return `${row['Date']},${row['Adj Close']}`;
    });
    finalFileContent = 'Date,Value\n' + finalFileContent.join('\n');

    return existsCorrectData ? finalFileContent : null;
  }

  _clearAlerts() {
    this.refs["generalAlertBox"].clear();
    this.refs["tickerAlertBox"].clear();
    this.refs["companyNameAlertBox"].clear();
    this.refs["dataFileAlertBox"].clear();
  }

  _validate(ticker, companyName, fileContent) {
    var isValid = true;

    if(!ticker || ticker.length === 0) {
      this.refs["tickerAlertBox"].error("Symbol field is required");
      isValid = false;
    }

    if(ticker.length > 10) {
      this.refs["tickerAlertBox"].warn("Recommended length of symbol should be less than 10");
    }

    if(ticker !== ticker.toUpperCase()) {
      this.refs["tickerAlertBox"].warn("Recommended format of symbol is capitalized");
    }

    if(!companyName || companyName.length === 0) {
      this.refs["companyNameAlertBox"].error("Company name cannot be empty");
      isValid = false;
    }

    if(!fileContent || fileContent.length === 0) {
      this.refs["dataFileAlertBox"].error("Data file field is required");
      isValid = false;
    }

    if(fileContent && !this._convertYahooData(fileContent)) {
      this.refs["dataFileAlertBox"].error("Data file has incorrect format. Valid format is described in application documentation");
      isValid = false;
    }

    return isValid;
  }

  _onclick() {
    var ticker = document.getElementById('ticker').value;
    var companyName = document.getElementById('companyName').value;
    var fileContent = this.refs.dataInput.getValue();

    this._clearAlerts();

    if (this._validate(ticker, companyName, fileContent)) {
      $.post({
        url: `/stockData?ticker=${ticker}&companyName=${companyName}`,
        type: 'POST',
        data: {
          data: this._convertYahooData(fileContent)
        },
        success: function (data) {
          if (data.error) {
            this.refs["generalAlertBox"].error(data.error);
          } else {
            $('#resultModal').modal('show');
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          this.refs["generalAlertBox"].error('Service connection error. Please try again later');
        }
      });
    }
  }

  render() {
    return (
      <div className="well col-sm-12 base-color2 special-border">
        <h3>Import Custom Company Data</h3>
        <hr className="special-border" />
        <div className="col-sm-6">
          <div className="form-group">
            <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Provide csv file with custom data in format described in application documentation. This field is required if you plan to import and use custom data" data-placement="right"></span>
            <label for="dataInput">Data file:</label>
            <DataInput id="dataInput" ref="dataInput" backgroundImage="images/upload.svg" />
          </div>
          <AlertBox ref="dataFileAlertBox" />
        </div>
        <div className="col-sm-6">
          <div className="form-group">
            <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Provide company name – this value will be used as label for imported data. This field is required if you plan to import and use custom data" data-placement="right"></span>
            <label for="companyName">Company name:</label>
            <input type="text" className="form-control" id="companyName" />
            <AlertBox ref="companyNameAlertBox" />
          </div>
          <div className="form-group">
            <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Provide company symbol – this value will be used to identify your data on charts. This field is required if you plan to import and use custom data" data-placement="right"></span>
            <label for="ticker">Symbol:</label>
            <input type="text" className="form-control" id="ticker" />
            <AlertBox ref="tickerAlertBox" />
          </div>
          <button onClick={this._onclick.bind(this)} className="btn btn-primary" type="button">Import & Save data</button>
          <AlertBox ref="generalAlertBox" />

          <div id="resultModal" className="modal fade" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content base-color2 special-border">
                <div className="modal-header special-border">
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                  <h4 className="modal-title">Data successfully saved</h4>
                </div>
                <div className="modal-body">
                  <p>Congratulation! Your data was successfully saved on the server. Imported data will be available now in application.</p>
                </div>
                <div className="modal-footer special-border">
                  <button type="button" onClick={function () {window.location = '/'}} className="btn btn-primary" >Move to application</button>
                  <button type="button" className="btn btn-default" data-dismiss="modal">Remain on this site</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

module.exports = FileLoader;
