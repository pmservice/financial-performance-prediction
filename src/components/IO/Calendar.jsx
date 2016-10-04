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

class Calendar extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    var ctx = this;
    $(function () {
      $('#' + ctx.props.id).datetimepicker({
        viewMode: 'years',
        format: 'YYYY-MM',
        maxDate: new Date()
      });
    });
  }

  getValue(){
    var ctx = this;
    return $('#' + ctx.props.id).data("DateTimePicker").date().add(1, 'hours').format("YYYY-MM-DD");
  }

  isEmpty(){
    var ctx = this;
    var dataObject = $('#' + ctx.props.id).data("DateTimePicker");
    if (dataObject == null)
      return true;
    else {
      var dateObject = dataObject.date();
      if (dateObject == null)
        return true;
      else
        return false;
    }
  }

  render() {
    return (
      <div className='short-input form-group'>
          <div className='input-group date' id={this.props.id}>
            <input type='text' className="form-control" />
            <span className="input-group-addon">
              <span className="glyphicon glyphicon-calendar"></span>
            </span>
        </div>
      </div>
    );
  }
}

module.exports = Calendar;
