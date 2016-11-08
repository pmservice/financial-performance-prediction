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

class Overview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="well base-color2">
        <h3>Documentation</h3>
        <hr />
        Github link: <a href="https://github.com/pmservice/financial-performance-prediction" target="_blank">https://github.com/pmservice/financial-performance-prediction</a>
        <hr />
        <p>Time Series sample application gives you ability to work with financial and economic time series data to gain powerful insights into the future.</p>
        <p>Application delivers analytics-driven environment where you can explore time series from various perspectives and forecast future by using most suitable forecasting methods.</p>
        <p>Application deployed on Watson Machine Learning Service consists of two parts.</p>
        <ol>
          <li>First part is about downloading financial and economical time series from open data sources and exploring them to see general characteristics such as trend, seasonality, return distributions and correlation between time series.</li>
          <li>Second part helps us to forecast near-future based on historical data with a level of confidence so that we can use time series analysis and forecast to solve our specific business problem.</li>
        </ol>
        <p>In practice, time series modeling is ambitious undertaking and it is used in many different fields to produce forecasts for different types of time series data, especially used today for many economic variables such as weekly sales figures, monthly returns of a stocks, inflation or gross domestic product.</p>
        <p>Time series sample application is using IBM Watson Machine Learning and IBM SPSS Modeler together to provide functionalities mentioned above.</p>
        <p>Time Series Modeling node in IBM SPSS Modeler provides us methods such as exponential smoothing, univariate Autoregressive Integrated Moving Average (ARIMA), and multivariate ARIMA (or transfer function) models for time series.</p>
        <p>One of the greatest features of Time Series Modeling node is Expert Modeler. Expert Modeler, which automatically identifies and estimates the best-fitting ARIMA or exponential smoothing model for one or more target variables, thus eliminating the need to identify an appropriate model through trial and error.</p>
        <p>IBM Watson Machine Learning takes things even further and allows us to deploy streams that we develop in IBM SPSS Modeler to cloud environment to turn our data models into fully fledged business applications.</p>
        <p>In the context of this application, IBM Watson Machine Learning Service provides useful framework to gather, explore and forecast financial and economical time series in iterative nature without requiring repetitive manual steps and automating the whole end-to-end process.</p>
        <p>One can see how powerful it can be to use IBM SPSS Modeler and IBM Watson Machine Learning Service together to work with financial and economical time series and how IBM Watson Machine Learning puts all these capabilities into the hands of its users.</p>

        <hr />
        <h4>Guidelines regarding preparation of stream</h4>
        <hr />
        In order for your stream to run without any problems, you should follow below guidelines to prepare your stream.
        <ol>
          <li>
            Input file node should be renamed as <b>“in”</b> using annotations.<br />
            <a href="images/guidelines_1.png"><img src="images/guidelines_1.png" className="guideline-img" width="50%" /></a>
          </li>
          <li>
            Input file should have fields named DATE and VALUE with types “Date” and “Real”<br />
            <a href="images/guidelines_2.png"><img src="images/guidelines_2.png" className="guideline-img" width="50%" /></a><br />
            <a href="images/guidelines_3.png"><img src="images/guidelines_3.png" className="guideline-img" width="50%" /></a>
          </li>
          <li>
            You should use only one scoring branch which is “Table” node in this case.<br />
            <a href="images/guidelines_4.png"><img src="images/guidelines_4.png" className="guideline-img" width="50%" /></a><br />
            <a href="images/guidelines_5.png"><img src="images/guidelines_5.png" className="guideline-img" width="50%" /></a>
          </li>
          <li>
            “Table” node should include fields below after running the stream.<br />
            <a href="images/guidelines_6.png"><img src="images/guidelines_6.png" className="guideline-img" width="50%" /></a>
          </li>
        </ol>
      </div>
    );
  }
}

module.exports = Overview;
