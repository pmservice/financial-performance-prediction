/*
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

class Loader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      info: null
    }
  }

  setInfo(info) {
    this.setState({
      info: info
    });
  }

  clearInfo() {
    this.setState({
      info: null
    });
  }

  render() {
    if(this.state.info) {
      var infoText = (
        <span>
          <center>{this.state.info}</center>
        </span>
      );
    } else {
      var infoText = null;
    }

    return (
      <div>
        <svg viewBox="25 25 50 50" className="loader loader--dark">
          <circle r="20" cy="50" cx="50" className="loader__path">
          </circle>
        </svg>
        {infoText}
      </div>
    );
  }
}

module.exports = Loader;
