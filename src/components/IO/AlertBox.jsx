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

class AlertBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: []
    };
  }

  error(msg) {
    var alerts = this.state.alerts;
    alerts.push({
      msg: msg,
      type: 'error'
    });
    this.setState({
      alerts: alerts
    });
  }

  warn(msg) {
    var alerts = this.state.alerts;
    alerts.push({
      msg: msg,
      type: 'warn'
    });
    this.setState({
      alerts: alerts
    });
  }

  clear() {
    this.setState({
      alerts: []
    });
  }

  isEmpty() {
    return (this.state.alerts.length === 0);
  }

  _closeAlert(event) {
    event.target.parentNode.style.display= "none";
  }

  render() {
    var ctx = this;
    return (
      <div>
        {this.state.alerts.map(function(alert){
          if(alert.type === 'error'){
            return (
              <div className="alert alert-danger">
                <a href="#" onClick={ctx._closeAlert.bind(this)} className="close" aria-label="close">&times;</a>
                <strong>Error!</strong> {alert.msg}
              </div>
            );
          } else if(alert.type === 'warn'){
            return (
              <div className="alert alert-warning">
                <a href="#" onClick={ctx._closeAlert.bind(this)} className="close" aria-label="close">&times;</a>
                <strong>Warning!</strong> {alert.msg}
              </div>
            );
          }
        })}
      </div>
    );
  }
}

module.exports = AlertBox;
