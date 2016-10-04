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

'use strict';

var numbers = require('numbers');
var colorUtil = require('./color-util');

function _json2plotly(data, dataPart) {
  return data.map(function (tickerData) {
    var partialResult = {};
    partialResult.ticker = tickerData.ticker;
    partialResult.source = tickerData.source;
    partialResult.header = tickerData[dataPart][0] ? Object.keys(tickerData[dataPart][0]) : [];
    partialResult[dataPart] = {};

    partialResult.header.forEach(function (columnName) {
      partialResult[dataPart][columnName] = tickerData[dataPart].map(function (dataPiece) {
        return dataPiece[columnName];
      });
    });

    return partialResult;
  });
}

function _basicChart(data, dataPart, type) {
  var plotlyData = _json2plotly(data, dataPart);
  var lineChartData = plotlyData.map(function (tickerData, index) {
    return {
      x: tickerData[dataPart].Date,
      y: tickerData[dataPart].Value,
      type: type,
      name: tickerData.ticker,
      mode: 'lines',
      line: {
        color: colorUtil.getColorByIndex(index)
      }
    };
  });

  return lineChartData;
}

function _histogram(data, dataPart) {
  var plotlyData = _json2plotly(data, dataPart);
  var lineChartData = plotlyData.map(function (tickerData, index) {
    var lowerBound = Math.min(...tickerData[dataPart].Value);
    var upperBound = Math.max(...tickerData[dataPart].Value);

    return {
      x: tickerData[dataPart].Value,
      type: 'histogram',
      name: tickerData.ticker,
      opacity: 0.75,
      autobinx: false,
      xbins: {
        start: lowerBound,
        end: upperBound,
        size: (upperBound - lowerBound) / Math.pow(tickerData[dataPart].Value.length, 1 / 3)
      },
      marker: {color: colorUtil.getColorByIndex(index)}
    };
  });

  return lineChartData;
}

function _scatterplotMatrix(data, dataPart, space = 0.17) {
  console.log('json2plotly', data);
  var plotlyData = _json2plotly(data, dataPart);
  var scatterplotMatrixData = [];
  var layout = {
    legend: {
      x: 100,
      y: 0.95,
      xref: 'paper',
      yref: 'paper'
    },
    annotations: [
      {
        x: 1.2,
        y: 1.0,
        xref: 'paper',
        yref: 'paper',
        text: '<b>Correlation</b>',
        showarrow: false
      }
    ]
  };
  for (var i = 0; i < plotlyData.length; ++i) {
    for (var j = 0; j < plotlyData.length; ++j) {
      var rChartIndex = (plotlyData.length - 1 - j) * plotlyData.length + i;
      var chartIndex = j * plotlyData.length + i;
      layout['xaxis' + (chartIndex > 0 ? chartIndex + 1 : '')] = {
        domain: [(i + space) / plotlyData.length, (i + 1 - space) / plotlyData.length],
        title: (j === 0 ? plotlyData[i].ticker : ''),
        anchor: 'y' + (chartIndex > 0 ? chartIndex + 1 : ''),
        showgrid: false,
        showline: true,
        linecolor: 'white',
        tickfont: {
          size: 8
        }
      };
      layout['yaxis' + (chartIndex > 0 ? chartIndex + 1 : '')] = {
        domain: [(j + space) / plotlyData.length, (j + 1 - space) / plotlyData.length],
        title: (i === 0 ? plotlyData[plotlyData.length - j - 1].ticker : ''),
        anchor: 'x' + (chartIndex > 0 ? chartIndex + 1 : ''),
        showgrid: false,
        showline: true,
        linecolor: 'white',
        tickfont: {
          size: 8
        }
      };
      if (i === j) {
        var lowerBound = Math.min(...plotlyData[i][dataPart].Value);
        var upperBound = Math.max(...plotlyData[i][dataPart].Value);

        scatterplotMatrixData.push({
          x: plotlyData[i][dataPart].Value,
          type: 'histogram',
          xaxis: 'x' + (rChartIndex > 0 ? rChartIndex + 1 : ''),
          yaxis: 'y' + (rChartIndex > 0 ? rChartIndex + 1 : ''),
          name: '',
          autobinx: false,
          xbins: {
            start: lowerBound,
            end: upperBound,
            size: (upperBound - lowerBound) / Math.pow(plotlyData[i][dataPart].Value.length, 1 / 3)
          },
          marker: {color: colorUtil.getColorByIndex(i)},
          showlegend: false
        });
      } else {
        var x = plotlyData[i][dataPart].Value;
        var y = plotlyData[j][dataPart].Value;

        var minLen = Math.min(
          plotlyData[i][dataPart].Value.length,
          plotlyData[j][dataPart].Value.length
        );

        x = x.slice(0, minLen);
        y = y.slice(0, minLen);

        scatterplotMatrixData.push({
          x: x,
          y: y,
          type: 'scatter',
          mode: 'markers',
          marker: {
            color: colorUtil.getMatrixColor(Math.min(i, j), Math.max(i, j))
          },
          xaxis: 'x' + (rChartIndex > 0 ? rChartIndex + 1 : ''),
          yaxis: 'y' + (rChartIndex > 0 ? rChartIndex + 1 : ''),
          name: parseFloat(numbers.statistic.correlation(x, y).toFixed(2)),
          showlegend: (i > j)
        });
      }
    }
  }

  return {data: scatterplotMatrixData, layout: layout};
}

function _scoringLineChart(data, headers, translationMap) {
  var tableOfNames = [];

  var i = 0;
  while (data.data[i + 1] && data.data[i + 1]['VALUE'] !== '$null$') {
    i++;
  }

  if (data.data[i])
    var endDate = data.data[i]['DATE'];

  if (translationMap) {
    tableOfNames = headers.map(function (header) {
      return translationMap[header];
    });
  } else {
    tableOfNames = headers;
  }

  var plotlyData = _json2plotly([data], 'data')[0];
  var x = plotlyData.data['$TI_TimeLabel'] ? plotlyData.data['$TI_TimeLabel'] : plotlyData.data['DATE'];

  var result = headers.map(function (header, index) {
    return {
      x: x,
      y: plotlyData.data[header],
      type: 'scatter',
      name: tableOfNames[index],
      mode: 'lines',
      line: {
        color: colorUtil.getMatrixColor(index, 0)
      }
    };
  });

  var layout = {
    title: 'Forecast'
  };

  if (endDate)
    layout.shapes = [
      {
        type: 'line',
        xref: 'x',
        yref: 'paper',
        x0: endDate,
        y0: 0,
        x1: endDate,
        y1: 1,
        opacity: 0.2,
        line: {
          color: 'white'
        }
      }
    ];

  return {
    data: result,
    layout: layout
  };
}

module.exports = {
  translate: _json2plotly,
  basicChart: _basicChart,
  scoringLineChart: _scoringLineChart,
  histogram: _histogram,
  scatterplotMatrix: _scatterplotMatrix
};
