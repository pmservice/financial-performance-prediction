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

import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css';
//import 'eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js';
import App from "./components/App/App.jsx";
import Overview from "./components/Overview/Overview.jsx";
import FileLoader from "./components/FileLoaderPanel/FileLoader.jsx";
import "./static/stylesheets/style.css";

require.context("./static/", true, /^\.\/.*\.(html|png|svg|gif|css)/);

const AppLayout = React.createClass({
  render() {
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top lower-nav base-color2 no-border shadowed" role="navigation">
          <div className="container">
            <div className="navbar-header">
              <p id="application-name" className="navbar-brand">Predicting Financial Performance</p>
            </div>
            <div className="navbar-collapse collapse" id="navbar-main">
              <ul className="nav navbar-nav">
                <li>
                  <Link className="button-color nav-text" to="/">Application</Link>
                </li>
                <li>
                  <Link className="button-color nav-text" to="/importData">Import Custom Data</Link>
                </li>
                <li>
                  <Link className="button-color nav-text" to="/overview">Overview</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <nav className="navbar navbar-default navbar-fixed-top small-nav base-color no-border shadowed" role="navigation">
          <div className="container">
            <div className="navbar-collapse collapse small-nav" id="navbar-main">
              <ul className="nav navbar-nav small-nav">
                <li>
                  <a href="https://new-console.ng.bluemix.net/" className="h5 button-color" target="_blank">
                    <img src="images/bluemix_icon.png" className="inline-icon" />
                    IBM Bluemix
                  </a>
                </li>
                <li>
                  <a href="https://console.ng.bluemix.net/catalog/services/ibm-watson-machine-learning/" className="h5 button-color" target="_blank">
                    <img src="images/ml_icon.png" className="inline-icon" />
                    Watson Machine Learning
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="container wide-container">
          <div className="small-nav"></div>
          {this.props.children}
        </div>
      </div>
    )
  }
});

let routes = (
  <Route path="/" component={AppLayout}>
    <IndexRoute component={App} />
    <Route path="/overview" component={Overview} />
    <Route path="/importData" component={FileLoader} />
    <Route path="*" component={App} />
  </Route>
);

ReactDOM.render(
      <Router history={browserHistory}>{routes}</Router>,
      document.getElementById('react-mount')
);
