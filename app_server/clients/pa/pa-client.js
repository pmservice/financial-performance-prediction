/* eslint-env node

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

const request = require('request');
const fs = require('fs');
const paHelper = require('./pa-helper');
const log4js = require('../../utils/log4js-log-util');
const logger = log4js.getLogger('clients/pa/pa-client');
/**
 * @class PAService
 * @constructor
 * @param {Object} credenials part for Predictive Analytics service copied from VCAP;
 * should contain access_key and url
 */
var PAService = module.exports = function (pmServiceCredentials) {
  let credentials = pmServiceCredentials;
  if (typeof credentials === 'undefined' && credentials == null) {
    let config = require('../../../config');
    let pmServiceName = process.env.PA_SERVICE_LABEL ? process.env.PA_SERVICE_LABEL : 'pm-20';
    let val = config(pmServiceName);
    if (typeof val !== 'undefined' && val != null) {
      credentials = val.credentials;
    }
  }
  if (credentials) {
    if (credentials.url != null) {
      let {url} = credentials;
      let v1Url = '/pm/v1/';
      this.baseUrl = url.includes(v1Url) ? url : url + v1Url;
      if (!this.baseUrl.endsWith('/')) {
        this.baseUrl += '/';
      }
    } else {
      logger.warn('in PAService definition, url is not defined - setting base url to empty string');
      this.baseUrl = '';
    }

    this.accessKey = credentials.access_key;
  } else {
    logger.warn('PA service not binded');
  }
};

PAService.prototype = {
  _constructUrl: function (url, params) {
    logger.enter('_constructUrl', {url: url, params: params});
    let queryString = '?';
    for (let key in params) {
      queryString += key + '=' + params[key] + '&';
    }
    logger.return('_constructUrl',
      this.baseUrl + url + queryString + 'accesskey=xxx');
    return this.baseUrl + url + queryString + 'accesskey=' + this.accessKey;
  },

  _handleResponse: function (logContext, callback) {
    return function (error, response, body) {
      /*logger.enter('_handleResponse', // Warning! Logging response can cause logging accesskey!
        {
          logContext: logContext,
          error: error,
          response: response,
          body: body
        }
      );*/


      if (typeof response === 'string') {
        try {
          response = JSON.parse(response);
        } catch (err) {
          if (!error && !body)
            return callback(null, response);
        }
      }

      if (!error && ((response.statusCode >= 200 && response.statusCode < 300) || response.flag)) {
        return callback(null, body);
      }
      if (error) {
        logger.error(error);
        return callback(error);
      } else if (response.statusCode < 200 || response.status >= 300) {
        logger.error(`Error occured. Error code: ${response.statusCode}`);
        return callback(response.statusCode);
      } else if (!response.flag && response.message) {
        logger.error(response.message);
        return callback(response.message);
      } else {
        var errorMsg = `Undefined error occured, logContext: ${JSON.stringify(logContext)}, error: ${error}, response: ${JSON.stringify(response)}, body: ${body}`;
        logger.error(errorMsg);
        return callback(errorMsg);
      }
    };
  },

  getAccessKey: function () {
    return this.accessKey;
  },

  get: function (url, params, callback) {
    logger.enter('get()', url);

    if (typeof params === 'function') {
      callback = params;
      params = {};
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    let requestUrl = this._constructUrl(url, params);

    request
      .get({url: requestUrl}, this._handleResponse(url, callback));
    logger.return('get()');
  },

  put: function (params, callback) {
    var paramsCopy = JSON.parse(JSON.stringify(params));
    if (paramsCopy.url) {
      paramsCopy.url = paramsCopy.url.replace(this.getAccessKey(), 'xxx');
    }
    logger.enter('put()', paramsCopy);

    if (typeof params === 'function') {
      callback = params;
      params = {};
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    request
      .put(params, this._handleResponse(params, callback));
    logger.return('put()');
  },

  getModel: function (contextId, callback) {
    logger.enter('getModel()', contextId);

    this.get('metadata/' + contextId, function (error, body) {
      if (error) {
        return callback(error);
      } else {
        var metadata = JSON.parse(body);
        var flag = metadata.flag;
        var message = metadata.message;
        if (flag) {
          paHelper.parseModelMetadata(message, function (error, model) {
            if (error) {
              return callback(error);
            } else {
              model.id = contextId;
              logger.return('getModel()', 'model description for contextId=' +
                    contextId + ' with info about following tables: ' +
                    Object.keys(model.tableData));
              return callback(null, model);
            }
          });
        } else {
          error = new Error('PA service error: ' + message);
          logger.error(`error in function getModel() for stream with \
            id= ${contextId}, msg: ${message}`);
          return callback(error);
        }
      }
    });
  },

  getModels: function (callback) {
    logger.enter('getModels()');
    var client = this;
    var errors = [];
    var result = [];

    this.get('model', (error, body) => {
      if (error) {
        return callback(error);
      } else {
        var models = JSON.parse(body);
        var count = models.length;
        if (count === 0) {
          logger.return('getModels()', '0 models');
          return callback(null, []);
        }
        models.forEach(function (model) {
          client.getModel(model.id, function (error, modelMetadata) {
            if (error) {
              logger.error('error in getModels(), msg: ' + error);
              errors.push(error.message);
              count -= 1;
            } else {
              model.tableData = modelMetadata.tableData;
              result.push(model);
              count -= 1;
            }
            if (count <= 0) {
              logger.return('getModels()', result.length + ' model(s) and ' + errors.length + ' error(s)');
              return callback(errors, result);
            }
          });
        });
      }
    });
  },

  getScore: function (contextId, scoreParam, callback) {
    logger.enter('getScore()');

    let scoreUri = this._constructUrl('/score/' + contextId);
    var body = JSON.stringify(scoreParam);
    logger.debug(`url: ${scoreUri}, body: ${body}`);

    request
      .post({
        headers: {'content-type': 'application/json'},
        url: scoreUri,
        body: body
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var scoreResponse = JSON.parse(body);
          if (scoreResponse.flag === false) {
            logger.error('error in getScore() during scoring stream \
with contextId=' + contextId + ', msg: ' +
scoreResponse.message.substring(0, scoreResponse.message.indexOf('\n')));
            return callback('PA service error: ' + scoreResponse.message);
          } else {
            logger.info('getScore() - successfully finished scoring for \
stream with contextId=' + contextId);
            logger.return('getScore()',
              scoreResponse.length + ' row(s) of result');
            return callback(null, scoreResponse);
          }
        } else if (error) {
          logger.error(error);
          return callback(error);
        } else {
          error = new Error('Service error code: ' + response.statusCode);
          logger.error('error in getScore() during scoring stream \
with contextId=' + contextId + ', msg: ' + error);
          return callback(error);
        }
      });
  },

  uploadModel: function (fileId, filePath, callback) {
    logger.enter('uploadModel()', {fileId: fileId, filePath: filePath});

    let url = this._constructUrl('model/' + fileId);
    let params = {
      headers: {'content-type': 'multipart/form-data'},
      url: url,
      formData: {
        'model_file': fs.createReadStream(filePath)
      }
    };
    this.put(params, this._handleResponse(url, callback));
    logger.return('uploadModel()');
  },

  downloadModel: function (modelId, filePath, callback) {
    logger.enter('downloadModel()', {modelId: modelId, filePath: filePath});
    var writeStream = fs.createWriteStream(filePath);
    let url = this._constructUrl('model/' + modelId);

    writeStream.on('open', function () {
      request(
        url,
        function (err) {
          if (err) {
            logger.error(err);
            return callback(err);
          }
        }
      ).pipe(writeStream).on('finish', function () {
        logger.return('downloadModel()');
        return callback();
      });
    });
  },

  deleteModel: function (fileId, callback) {
    logger.enter('deleteModel()', fileId);

    let url = this._constructUrl('model/' + fileId);
    request
      .delete(url, this._handleResponse(url, callback));

    logger.return('deleteModel()');
  },

  deleteFile: function (fileId, callback) {
    logger.enter('deleteFile()', fileId);

    let url = this._constructUrl('file/' + fileId);
    request
      .delete(url, this._handleResponse(url, callback));

    logger.return('deleteFile()');
  },

  uploadFile: function (fileId, filePath, callback) {
    logger.enter('uploadFile()', {fileId: fileId, filePath: filePath});

    let url = this._constructUrl('file/' + fileId);
    let params = {
      headers: {'content-type': 'multipart/form-data'},
      url: url,
      formData: {
        'model_file': fs.createReadStream(filePath)
      }
    };
    this.put(params, this._handleResponse(url, callback));
    logger.return('uploadFile()');
  },

  deleteJob: function (fileId, callback) {
    logger.enter('deleteJob()', fileId);

    let url = this._constructUrl('jobs/' + fileId);
    request
      .delete(url, this._handleResponse(url, callback));

    logger.return('deleteJob()');
  },

  // TODO should be these info given this way?
  createJob: function (action, jobId, modelId, modelName, tableName, inputsNode, callback) {
    logger.enter('createJob()');

    let url = this._constructUrl('jobs/' + jobId);
    let params = {
      headers: {'content-type': 'application/json'},
      url: url,
      body: paHelper.getJobJson(action, modelId, modelName, tableName, inputsNode)
    };
    this.put(params, function (error, response, body) {
      if (error) {
        logger.error(error);
        return callback(error);
      } else {
        return callback(null, JSON.parse(response));
      }
    });
    logger.return('createJob()');
  },

  getJobStatus: function (jobId, callback) {
    logger.enter('getJobStatus()');

    let url = 'jobs/' + jobId + '/status';
    this.get(url, function (error, response, body) {
      if (error) {
        logger.error(error);
        return callback(error);
      } else {
        return callback(null, JSON.parse(response));
      }
    });

    logger.return('getJobStatus()');
  }
};
