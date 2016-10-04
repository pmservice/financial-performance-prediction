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
const Dropzone = require('react-dropzone');

class DataInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputText: ''
    };
  }

  getValue() {
    return this.state.inputText;
  }

  _handleChange(event) {
    console.log('handleChange');
    console.log(event);
    let val = event.target.value;
    if (typeof val !== 'undefined') {
      this.setState({inputText: val});
    }
  }

  _onDrop(files) {
    let reader = new FileReader();
    let file = files[0];
    reader.onload = (evt, isCsv = file.name.endsWith('.csv')) => {
      let inputs = evt.target.result;
      this.setState({
        inputText: inputs
      });
    };
    reader.readAsText(file);
  }

  validate() {
    try {
      return this.state.inputText.trim() !== '';
    } catch (err) {
      return false;
    }
  }

  render() {
    let textareaStyle = {};
    if (this.state.inputText === '') {
      textareaStyle = {
        backgroundImage: `url(${this.props.backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      };
    }
    return (
      <Dropzone style={{width: '100%'}} multiple={false} disablePreview={true} disableClick={true} accept=".csv, text/plain" onDrop={this._onDrop.bind(this)} ref="dropzone">
        <div>
          <textarea
            style={textareaStyle}
            required className='form-control' rows="6" value={this.state.inputText}
            onChange={this._handleChange.bind(this)}
            onDoubleClick={() => {this.refs.dropzone.open();}} >
          </textarea>
        </div>
      </Dropzone>
    );
  }
};

module.exports = DataInput;
