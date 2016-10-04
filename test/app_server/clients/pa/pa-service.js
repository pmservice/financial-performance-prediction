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

const fs = require('fs');
const path = require('path');
const topDir = path.join(__dirname, '../../../../');
const helper = require(`${topDir}test/test-utils/helper`);
const chai   = require('chai');
const expect = chai.expect;
// const assert = chai.assert;
const request = require('request');
const dashDBUtil = require(`${topDir}app_server/clients/dashDB-client`);

var credentials = helper.extractPACredentials();
var dashDBCredentials = helper.extractDashDBCredentials();
var basicUrl = credentials.url;
var accessKey = credentials.access_key;
var testStreamsPath = `${topDir}test/test-utils/testStreams`;

const cleanPAServiceBeforeUse = false;

var handleUncleanModelApi = function (callback) {
  request({
    url: `${basicUrl}/model?accesskey=${accessKey}`,
    method: 'GET'
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    body = JSON.parse(body);

    if (body.length !== 0) {
      console.log('Warning! Model API of PA service has still some files loaded.');

      if (cleanPAServiceBeforeUse) {
        console.log('Model API of PA service is cleaned:');
      } else {
        console.log('Model API of PA service has following files loaded:');
      }
      body.forEach(function (modelObject, index) {
        if (cleanPAServiceBeforeUse) {
          console.log(`Removing ${modelObject.id}...`);
          request({
            url: `${basicUrl}/model/${modelObject.id}?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            if (index === body.length - 1) {
              return callback();
            }
          });
        } else {
          console.log(`${modelObject.id}`);
        }
      });
    } else {
      return callback();
    }
  });
};

var handleUncleanFileApi = function (callback) {
  request({
    url: `${basicUrl}/file?accesskey=${accessKey}`,
    method: 'GET'
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    body = JSON.parse(body);

    if (body.length !== 0) {
      console.log('Warning! File API of PA service has still some files loaded.');

      if (cleanPAServiceBeforeUse) {
        console.log('File API of PA service is cleaned:');
      } else {
        console.log('File API of PA service has following files loaded:');
      }
      body.forEach(function (jobObject, index) {
        if (cleanPAServiceBeforeUse) {
          console.log(`Removing ${jobObject}...`);
          request({
            url: `${basicUrl}/file/${jobObject}?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            if (index === body.length - 1) {
              return callback();
            }
          });
        } else {
          console.log(`${jobObject.id}`);
        }
      });
    } else {
      return callback();
    }
  });
};

var handleUncleanJobsApi = function (callback) {
  request({
    url: `${basicUrl}/jobs?accesskey=${accessKey}`,
    method: 'GET'
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    body = JSON.parse(body);

    if (body.length !== 0) {
      console.log('Warning! Jobs API of PA service has still some files loaded.');

      if (cleanPAServiceBeforeUse) {
        console.log('Jobs API of PA service is cleaned:');
      } else {
        console.log('Jobs API of PA service has following files loaded:');
      }
      body.forEach(function (modelObject, index) {
        if (cleanPAServiceBeforeUse) {
          console.log(`Removing ${modelObject.id}...`);
          request({
            url: `${basicUrl}/jobs/${modelObject.id}?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            if (index === body.length - 1) {
              return callback();
            }
          });
        } else {
          console.log(`${modelObject.id}`);
        }
      });
    } else {
      return callback();
    }
  });
};

describe('during PA service tests', function () {
  this.timeout(90000);

  before(function (done) {
    handleUncleanModelApi(function (error) {
      if (error)
        console.log(error);
      handleUncleanFileApi(function (error) {
        if (error)
          console.log(error);
        handleUncleanJobsApi(function (error) {
          if (error)
            console.log(error);
          dashDBUtil.connect(dashDBCredentials, function (error, connector) {
            if (error) {
              console.log('ERROR!!! ' + error);
              return;
            } else {
              connector.initTable('JOB_API_TEST', function (error) {
                if (error) {
                  console.log('ERROR!!! ' + error);
                  return;
                } else {
                  connector.insertData('JOB_API_TEST', ['DATE', 'VALUE'], [
                    ['2012-01-01', '12.2'],
                    ['2012-02-01', '12.5'],
                    ['2012-03-01', '13.8']
                  ], null, function (error) {
                    if (error) {
                      console.log('ERROR!!! ' + error);
                    }
                    connector.close(function () {
                      done();
                    });
                  });
                }
              });
            }
          });
        });
      });
    });
  });

  after(function (done) {
    dashDBUtil.connect(dashDBCredentials, function (error, connector) {
      if (error) {
        console.log('ERROR!!! ' + error);
        return;
      } else {
        connector.deleteTable('JOB_API_TEST', function (error) {
          if (error) {
            console.log('ERROR!!! ' + error);
          }
          connector.close(function () {
            done();
          });
        });
      }
    });
  });

  describe('of Model API', function () {
    var url = `${basicUrl}/model`;
    describe('using method PUT', function () {
      describe('uploading valid model v17.1', function () {
        after(function (done) {
          request({
            url: `${url}/valid-17-1?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200, flag=true and body.message', function (done) {
          request({
            url: `${url}/valid-17-1?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(true);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('uploading valid model v18.0', function () {
        after(function (done) {
          request({
            url: `${url}/valid-18-0?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200, flag=true and existing body.message', function (done) {
          request({
            url: `${url}/valid-18-0?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-18-0.str`)
            }
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(true);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('trying to upload invalid file', function () {
        after(function (done) {
          // after unsuccessful upload of file there shouldn't be anything to remove from pa service
          request({
            url: `${url}/invalid?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200, flag=false and existing body.message', function (done) {
          request({
            url: `${url}/invalid?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/invalid.str`)
            }
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(false);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });

    describe('using method GET /:id', function () {
      before(function (done) {
        request({
          url: `${url}/valid-17-1?accesskey=${accessKey}`,
          method: 'PUT',
          headers: {'content-type': 'multipart/form-data'},
          formData: {
            'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
          }
        }, function (error, response, body) {
          done();
        });
      });

      after(function (done) {
        request({
          url: `${url}/valid-17-1?accesskey=${accessKey}`,
          method: 'DELETE'
        }, function (error, response, body) {
          done();
        });
      });

      it('results with and statusCode=200 while getting valid model by valid id', function (done) {
        request({
          url: `${url}/valid-17-1?accesskey=${accessKey}`,
          method: 'GET'
        }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(error).to.equal(null);
          done();
        });
      });

      it('results with statusCode=200, flag=false and existing body.message while using nonexisting id', function (done) {
        request({
          url: `${url}/nonexisting?accesskey=${accessKey}`,
          method: 'GET'
        }, function (error, response, body) {
          expect(response.statusCode).to.equal(404);
          expect(error).to.equal(null);
          body = JSON.parse(body);
          expect(body.flag).to.equal(false);
          expect(body.message).to.exist;
          done();
        });
      });
    });

    describe('using method GET', function () {
      describe('when models are loaded', function () {
        before(function (done) {
          request({
            url: `${url}/get-all-test?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        after(function (done) {
          request({
            url: `${url}/get-all-test?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and body.length=1', function (done) {
          request({
            url: `${url}?accesskey=${accessKey}`,
            method: 'GET'
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(error).to.equal(null);
            expect(body.length).to.equal(1);
            done();
          });
        });
      });

      describe('when no models are loaded', function () {
        it('results with statusCode=200 and body.length=0', function (done) {
          request({
            url: `${url}?accesskey=${accessKey}`,
            method: 'GET'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(error).to.equal(null);
            body = JSON.parse(body);
            expect(body.length).to.equal(0);
            done();
          });
        });
      });
    });

    describe('using method DELETE', function () {
      describe('when model exists', function () {
        before(function (done) {
          request({
            url: `${url}/delete-test?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200, flag=true and existing body.message', function (done) {
          request({
            url: `${url}/delete-test?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(true);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('when model doesn\'t exist', function () {
        it('results with and statusCode=404', function (done) {
          request({
            url: `${url}/delete-test-nonexisting?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(404);
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });
  });

  describe('of Score API', function () {
    var url = `${basicUrl}/score`;

    describe('using method POST', function () {
      describe('when model exists', function () {
        before(function (done) {
          request({
            url: `${basicUrl}/model/score-test?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        after(function (done) {
          request({
            url: `${basicUrl}/model/score-test?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and existing data in body when body is valid', function (done) {
          request({
            url: `${url}/score-test?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            },
            body: JSON.stringify({
              'tablename': 'in',
              'header': ['DATE', 'VALUE'],
              'data': [
                ['2012-01-01', '2.31'],
                ['2012-02-01', '3.45'],
                ['2012-03-01', '2.56'],
                ['2012-04-01', '2.15']
              ]
            })
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body[0].header).to.exist;
            expect(body[0].data).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with statusCode=200, flag=false and existing body.message when incorrect tablename', function (done) {
          request({
            url: `${url}/score-test?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            },
            body: JSON.stringify({
              'tablename': 'incorrect_name',
              'header': ['DATE', 'VALUE'],
              'data': [
                ['2012-01-01', '2.31'],
                ['2012-02-01', '3.45'],
                ['2012-03-01', '2.56'],
                ['2012-04-01', '2.15']
              ]
            })
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(false);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with statusCode=200, flag=false and existing body.message when incorrect header', function (done) {
          request({
            url: `${url}/score-test?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            },
            body: JSON.stringify({
              'tablename': 'in',
              'header': ['incorrect', 'header'],
              'data': [
                ['2012-01-01', '2.31'],
                ['2012-02-01', '3.45'],
                ['2012-03-01', '2.56'],
                ['2012-04-01', '2.15']
              ]
            })
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(false);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with statusCode=200, flag=false and existing body.message when incorrect data', function (done) {
          request({
            url: `${url}/score-test?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            },
            body: JSON.stringify({
              'tablename': 'in',
              'header': ['DATE', 'VALUE'],
              'data': [
                ['2012-01-01'],
                ['2012-02-01', '3.45', 'incorrect_body'],
                ['2012-03-01', '2.56'],
                ['2012-04-01', '2.15']
              ]
            })
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body.flag).to.equal(false);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with statusCode=200 and data in body when empty data', function (done) {
          request({
            url: `${url}/score-test?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            },
            body: JSON.stringify({
              'tablename': 'in',
              'header': ['DATE', 'VALUE'],
              'data': []
            })
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(body[0].header).to.exist;
            expect(body[0].data).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with statusCode=500 when without body', function (done) {
          request({
            url: `${url}/score-test?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            }
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(500);
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('when model doesn\'t exist', function () {
        it('results with statusCode=200, flag=false and existing body.message', function (done) {
          request({
            url: `${url}/nonexisting?accesskey=${accessKey}`,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'charset': 'UTF-8'
            },
            body: JSON.stringify({
              'tablename': 'DRUG1n.sav',
              'header': ['Age', 'Sex', 'BP', 'Cholesterol', 'Na', 'K', 'Drug'],
              'data': [[43.0, 'M', 'LOW', 'NORMAL', 0.526102, 0.027164, 'drugY']]
            })
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.flag).to.equal(false);
            expect(body.message).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });
  });

  describe('of Metadata API', function () {
    var url = `${basicUrl}/metadata`;

    before(function (done) {
      request({
        url: `${basicUrl}/model/metadata-test?accesskey=${accessKey}`,
        method: 'PUT',
        headers: {'content-type': 'multipart/form-data'},
        formData: {
          'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
        }
      }, function (error, response, body) {
        done();
      });
    });

    after(function (done) {
      request({
        url: `${basicUrl}/model/metadata-test?accesskey=${accessKey}`,
        method: 'DELETE'
      }, function (error, response, body) {
        done();
      });
    });

    it('results with statusCode=200, flag=true and existing body.message when valid model exist', function (done) {
      request({
        url: `${url}/metadata-test?accesskey=${accessKey}&metadatatype=score`,
        method: 'GET'
      }, function (error, response, body) {
        // metadata is in strange format
        body = JSON.parse(body);
        expect(response.statusCode).to.equal(200);
        expect(body.flag).to.equal(true);
        expect(body.message).to.exist;
        expect(error).to.equal(null);
        done();
      });
    });

    it('results with statusCode=200, flag=false and existing body.message when model doesn\'t exist', function (done) {
      request({
        url: `${url}/nonexisting?accesskey=${accessKey}&metadatatype=score`,
        method: 'GET'
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).to.equal(200);
        expect(body.flag).to.equal(false);
        expect(body.message).to.exist;
        expect(error).to.equal(null);
        done();
      });
    });
  });

  describe('of File API', function () {
    var url = `${basicUrl}/file`;
    describe('using method PUT', function () {
      describe('uploading valid file', function () {
        after(function (done) {
          request({
            url: `${url}/put-file-api?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and existing body with url in content', function (done) {
          request({
            url: `${url}/put-file-api?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('https://palbyp.pmservice.ibmcloud.com/pm/v1/file/put-file-api');
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('trying to upload file with empty content', function () {
        after(function (done) {
          request({
            url: `${url}/empty-content-put-file-api?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and existing body with url in content', function (done) {
          request({
            url: `${url}/empty-content-put-file-api?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': ''
            }
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('https://palbyp.pmservice.ibmcloud.com/pm/v1/file/empty-content-put-file-api');
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('trying to upload file without formData', function () {
        after(function (done) {
          request({
            url: `${url}/no-form-data-file-api?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=500 and existing body', function (done) {
          request({
            url: `${url}/no-form-data-file-api?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'}
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(500);
            expect(body).to.exist;
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });

    describe('using method GET /:id', function () {
      before(function (done) {
        request({
          url: `${url}/get-file-api?accesskey=${accessKey}`,
          method: 'PUT',
          headers: {'content-type': 'multipart/form-data'},
          formData: {
            'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
          }
        }, function (error, response, body) {
          done();
        });
      });

      after(function (done) {
        request({
          url: `${url}/get-file-api?accesskey=${accessKey}`,
          method: 'DELETE'
        }, function (error, response, body) {
          done();
        });
      });

      it('results with and statusCode=200 while trying to upload valid file', function (done) {
        request({
          url: `${url}/get-file-api?accesskey=${accessKey}`,
          method: 'GET'
        }, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body).to.exist;
          expect(error).to.equal(null);
          done();
        });
      });

      it('results with and statusCode=404 while using nonexisting id', function (done) {
        request({
          url: `${url}/nonexisting?accesskey=${accessKey}`,
          method: 'GET'
        }, function (error, response, body) {
          expect(response.statusCode).to.equal(404);
          expect(error).to.equal(null);
          done();
        });
      });
    });

    describe('using method GET', function () {
      describe('when models are loaded', function () {
        before(function (done) {
          request({
            url: `${url}/get-all-file-test?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        after(function (done) {
          request({
            url: `${url}/get-all-file-test?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and body.length=1', function (done) {
          request({
            url: `${url}?accesskey=${accessKey}`,
            method: 'GET'
          }, function (error, response, body) {
            body = JSON.parse(body);
            expect(response.statusCode).to.equal(200);
            expect(error).to.equal(null);
            expect(body.length).to.equal(1);
            done();
          });
        });
      });

      describe('when no models are loaded', function () {
        it('results with statusCode=200 and body.length=0', function (done) {
          request({
            url: `${url}?accesskey=${accessKey}`,
            method: 'GET'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(error).to.equal(null);
            body = JSON.parse(body);
            expect(body.length).to.equal(0);
            done();
          });
        });
      });
    });

    describe('using method DELETE', function () {
      describe('when model exists', function () {
        before(function (done) {
          request({
            url: `${url}/delete-test?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and body=1', function (done) {
          request({
            url: `${url}/delete-test?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('1');
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('when model doesn\'t exist', function () {
        it('results with statusCode=404', function (done) {
          request({
            url: `${url}/delete-test-nonexisting?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(404);
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });
  });

  describe('of Jobs API', function () {
    var url = `${basicUrl}/jobs`;

    describe('using method POST', function () {
      describe('when model in v17.1 is loaded', function () {
        before(function (done) {
          request({
            url: `${basicUrl}/file/job-test-post-17-1?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        after(function (done) {
          request({
            url: `${basicUrl}/file/job-test-post-17-1?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            request({
              url: `${basicUrl}/jobs/job-test-post-17-1?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              request({
                url: `${basicUrl}/jobs/job-test-post-17-1-no-table?accesskey=${accessKey}`,
                method: 'DELETE'
              }, function (error, response, body) {
                done();
              });
            });
          });
        });

        it('results with statusCode=200 and body containing data when table exist and json is valid', function (done) {
          request({
            url: `${url}/job-test-post-17-1?accesskey=${accessKey}`,
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              'action': 'TRAINING',
              'model': {
                'id': 'job-test-post-17-1',
                'name': 'stream.str'
              },
              'dbDefinitions': {
                'db': {
                  'type': 'DashDB',
                  'host': dashDBCredentials.hostname,
                  'port': dashDBCredentials.port,
                  'db': dashDBCredentials.db,
                  'username': dashDBCredentials.username,
                  'password': dashDBCredentials.password,
                  'options': 'Security=SSL'
                }
              },
              'setting': {
                'inputs': [
                  {
                    'odbc': {
                      'dbRef': 'db',
                      'table': 'JOB_API_TEST'
                    },
                    'node': 'in',
                    'attributes': []
                  }
                ]
              }
            })
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.id).to.equal('job-test-post-17-1');
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with and statusCode=500 when table exists but body is empty', function (done) {
          request({
            url: `${url}/job-test-post-17-1-empty-body?accesskey=${accessKey}`,
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: ''
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(500);
            expect(error).to.equal(null);
            done();
          });
        });

        it('results with statusCode=200 and existing body.id when table doesn\'t exist but json is valid', function (done) {
          request({
            url: `${url}/job-test-post-17-1-no-table?accesskey=${accessKey}`,
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              'action': 'TRAINING',
              'model': {
                'id': 'job-test-post-17-1',
                'name': 'stream.str'
              },
              'dbDefinitions': {
                'db': {
                  'type': 'DashDB',
                  'host': dashDBCredentials.hostname,
                  'port': dashDBCredentials.port,
                  'db': dashDBCredentials.db,
                  'username': dashDBCredentials.username,
                  'password': dashDBCredentials.password,
                  'options': 'Security=SSL'
                }
              },
              'setting': {
                'inputs': [
                  {
                    'odbc': {
                      'dbRef': 'db',
                      'table': 'NONEXISTING'
                    },
                    'node': 'in',
                    'attributes': []
                  }
                ]
              }
            })
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.id).to.equal('job-test-post-17-1-no-table');
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('when model in v18.0 is loaded', function () {
        before(function (done) {
          request({
            url: `${basicUrl}/file/job-test-post-18-0?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-18-0.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        after(function (done) {
          request({
            url: `${basicUrl}/file/job-test-post-18-0?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            request({
              url: `${basicUrl}/jobs/job-test-post-18-0?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              done();
            });
          });
        });

        it('results with statusCode=200 and existing body.id when table exist and json is valid', function (done) {
          request({
            url: `${url}/job-test-post-18-0?accesskey=${accessKey}`,
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              'action': 'TRAINING',
              'model': {
                'id': 'job-test-post-18-0',
                'name': 'stream.str'
              },
              'dbDefinitions': {
                'db': {
                  'type': 'DashDB',
                  'host': dashDBCredentials.hostname,
                  'port': dashDBCredentials.port,
                  'db': dashDBCredentials.db,
                  'username': dashDBCredentials.username,
                  'password': dashDBCredentials.password,
                  'options': 'Security=SSL'
                }
              },
              'setting': {
                'inputs': [
                  {
                    'odbc': {
                      'dbRef': 'db',
                      'table': 'JOB_API_TEST'
                    },
                    'node': 'in',
                    'attributes': []
                  }
                ]
              }
            })
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.id).to.equal('job-test-post-18-0');
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('when no model is loaded', function () {
        after(function (done) {
          request({
            url: `${basicUrl}/jobs/job-test-post-18-0-no-model?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            done();
          });
        });

        it('results with statusCode=200 and existing body.id when table exist and json is valid', function (done) {
          request({
            url: `${url}/job-test-post-18-0-no-model?accesskey=${accessKey}`,
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              'action': 'TRAINING',
              'model': {
                'id': 'nonexisting',
                'name': 'stream.str'
              },
              'dbDefinitions': {
                'db': {
                  'type': 'DashDB',
                  'host': dashDBCredentials.hostname,
                  'port': dashDBCredentials.port,
                  'db': dashDBCredentials.db,
                  'username': dashDBCredentials.username,
                  'password': dashDBCredentials.password,
                  'options': 'Security=SSL'
                }
              },
              'setting': {
                'inputs': [
                  {
                    'odbc': {
                      'dbRef': 'db',
                      'table': 'JOB_API_TEST'
                    },
                    'node': 'in',
                    'attributes': []
                  }
                ]
              }
            })
          }, function (error, response, body) {
            // no error when there is no stream with this id
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.id).to.equal('job-test-post-18-0-no-model');
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });

    describe('using method PUT', function () {
      // method PUT works differently depending on what happen in pa service
      /* describe('when exists job with this id before', function (done) {
        before(function (done) {
          request({
            url: `${basicUrl}/file/job-test-put-17-1?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            done();
          });
        });

        after(function (done) {
          request({
            url: `${basicUrl}/file/job-test-put-17-1?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            request({
              url: `${basicUrl}/jobs/job-test-put-17-1?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              done();
            });
          });
        });

        describe('when model in v17.1 is loaded', function () {
          before(function (done) {
            request({
              url: `${basicUrl}/file/job-test-put-17-1?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'multipart/form-data'},
              formData: {
                'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
              }
            }, function (error, response, body) {
              done();
            });
          });

          after(function (done) {
            request({
              url: `${basicUrl}/file/job-test-put-17-1?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              done();
            });
          });

          it('results with statusCode=201 and existing body.id when table exist and json is valid', function (done) {
            request({
              url: `${url}/job-test-put-17-1?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'job-test-put-17-1',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'JOB_API_TEST'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              assert(response.statusCode == 200 || response.statusCode == 201, `statusCode=${response.statusCode}, not 200 or 201`);
              body = JSON.parse(body);
              expect(body.id).to.equal('job-test-put-17-1');
              expect(error).to.equal(null);
              done();
            });
          });

          it('results with and statusCode=500 when table exists but body is empty', function (done) {
            request({
              url: `${url}/job-test-put-17-1?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: ''
            }, function (error, response, body) {
              expect(response.statusCode).to.equal(500);
              expect(error).to.equal(null);
              done();
            });
          });

          it('results with statusCode=200 and existing body.id when table doesn\'t exist but json is valid', function (done) {
            request({
              url: `${url}/job-test-put-17-1?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'job-test-put-17-1',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'NONEXISTING'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              expect(response.statusCode).to.equal(200);
              body = JSON.parse(body);
              expect(body.id).to.equal('job-test-put-17-1');
              expect(error).to.equal(null);
              done();
            });
          });
        });
      });*/

      /*describe('when doesn\'t exist job with this id before', function (done) {
        describe('when model in v17.1 is loaded', function () {
          before(function (done) {
            request({
              url: `${basicUrl}/file/job-test-put-17-1-clear?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'multipart/form-data'},
              formData: {
                'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
              }
            }, function (error, response, body) {
              done();
            });
          });

          after(function (done) {
            request({
              url: `${basicUrl}/file/job-test-put-17-1-clear?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              request({
                url: `${basicUrl}/jobs/job-test-put-17-1-clear?accesskey=${accessKey}`,
                method: 'DELETE'
              }, function (error, response, body) {
                request({
                  url: `${basicUrl}/jobs/job-test-put-17-1-clear-no-table?accesskey=${accessKey}`,
                  method: 'DELETE'
                }, function (error, response, body) {
                  done();
                });
              });
            });
          });

          it('results with statusCode=201 and existing body.id when table exist and json is valid', function (done) {
            request({
              url: `${url}/job-test-put-17-1-clear?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'job-test-17-1',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'JOB_API_TEST'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              assert(response.statusCode == 200 || response.statusCode == 201, `statusCode=${response.statusCode}, not 200 or 201`);
              body = JSON.parse(body);
              expect(body.id).to.equal('job-test-put-17-1-clear');
              expect(error).to.equal(null);
              done();
            });
          });

          it('results with and statusCode=500 when table exists but body is empty', function (done) {
            request({
              url: `${url}/job-api?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: ''
            }, function (error, response, body) {
              expect(response.statusCode).to.equal(500);
              expect(error).to.equal(null);
              done();
            });
          });

          it('results with statusCode=200 and existing body.id when table doesn\'t exist but json is valid', function (done) {
            request({
              url: `${url}/job-test-put-17-1-clear-no-table?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'job-test-put-17-1-clear',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'NONEXISTING'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              assert(response.statusCode == 200 || response.statusCode == 201, `statusCode=${response.statusCode}, not 200 or 201`);
              body = JSON.parse(body);
              expect(body.id).to.equal('job-test-put-17-1-clear-no-table');
              expect(error).to.equal(null);
              done();
            });
          });
        });

        describe('when model in v18.0 is loaded', function () {
          before(function (done) {
            request({
              url: `${basicUrl}/file/job-test-put-18-0-clear?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'multipart/form-data'},
              formData: {
                'model_file': fs.createReadStream(`${testStreamsPath}/valid-18-0.str`)
              }
            }, function (error, response, body) {
              done();
            });
          });

          after(function (done) {
            request({
              url: `${basicUrl}/file/job-test-put-18-0-clear?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              request({
                url: `${basicUrl}/jobs/job-test-put-18-0-clear?accesskey=${accessKey}`,
                method: 'DELETE'
              }, function (error, response, body) {
                done();
              });
            });
          });

          it('results with statusCode=200 and existing body.id when table exist and json is valid', function (done) {
            request({
              url: `${url}/job-test-put-18-0-clear?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'job-test-put-18-0-clear',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'JOB_API_TEST'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              assert(response.statusCode == 200 || response.statusCode == 201, `statusCode=${response.statusCode}, not 200 or 201`);
              body = JSON.parse(body);
              expect(body.id).to.equal('job-test-put-18-0-clear');
              expect(error).to.equal(null);
              done();
            });
          });
        });

        describe('when no model is loaded', function () {
          after(function (done) {
            request({
              url: `${basicUrl}/jobs/job-test-put-no-model-clear?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              done();
            });
          });

          it('results with statusCode=201 and existing body.id when table exist and json is valid', function (done) {
            request({
              url: `${url}/job-test-put-no-model-clear?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'nonexisting',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'JOB_API_TEST'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              // passing without model
              assert(response.statusCode == 200 || response.statusCode == 201, `statusCode=${response.statusCode}, not 200 or 201`);
              body = JSON.parse(body);
              expect(body.id).to.equal('job-test-put-no-model-clear');
              expect(error).to.equal(null);
              done();
            });
          });
        });
      });*/
    });

    describe('using method GET', function () {
      describe('when job exists', function () {
        before(function (done) {
          request({
            url: `${basicUrl}/file/job-test-17-1?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'multipart/form-data'},
            formData: {
              'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
            }
          }, function (error, response, body) {
            request({
              url: `${url}/job-test-17-1?accesskey=${accessKey}`,
              method: 'PUT',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({
                'action': 'TRAINING',
                'model': {
                  'id': 'job-test-17-1',
                  'name': 'stream.str'
                },
                'dbDefinitions': {
                  'db': {
                    'type': 'DashDB',
                    'host': dashDBCredentials.hostname,
                    'port': dashDBCredentials.port,
                    'db': dashDBCredentials.db,
                    'username': dashDBCredentials.username,
                    'password': dashDBCredentials.password,
                    'options': 'Security=SSL'
                  }
                },
                'setting': {
                  'inputs': [
                    {
                      'odbc': {
                        'dbRef': 'db',
                        'table': 'JOB_API_TEST'
                      },
                      'node': 'in',
                      'attributes': []
                    }
                  ]
                }
              })
            }, function (error, response, body) {
              done();
            });
          });
        });

        after(function (done) {
          request({
            url: `${basicUrl}/jobs/job-test-17-1?accesskey=${accessKey}`,
            method: 'DELETE'
          }, function (error, response, body) {
            request({
              url: `${basicUrl}/file/job-test-17-1?accesskey=${accessKey}`,
              method: 'DELETE'
            }, function (error, response, body) {
              done();
            });
          });
        });

        it('results with statusCode=200 and body.length=1', function (done) {
          request({
            url: `${url}?accesskey=${accessKey}`,
            method: 'GET'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.length).to.equal(1);
            expect(error).to.equal(null);
            done();
          });
        });
      });

      describe('when job doesn\'t exist', function () {
        it('results with statusCode=200 and body.length=0', function (done) {
          request({
            url: `${url}?accesskey=${accessKey}`,
            method: 'GET'
          }, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            body = JSON.parse(body);
            expect(body.length).to.equal(0);
            expect(error).to.equal(null);
            done();
          });
        });
      });
    });

    describe('using method DELETE', function () {
      before(function (done) {
        request({
          url: `${basicUrl}/file/job-test-17-1?accesskey=${accessKey}`,
          method: 'PUT',
          headers: {'content-type': 'multipart/form-data'},
          formData: {
            'model_file': fs.createReadStream(`${testStreamsPath}/valid-17-1.str`)
          }
        }, function (error, response, body) {
          request({
            url: `${url}/job-test-17-1?accesskey=${accessKey}`,
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
              'action': 'TRAINING',
              'model': {
                'id': 'job-test-17-1',
                'name': 'stream.str'
              },
              'dbDefinitions': {
                'db': {
                  'type': 'DashDB',
                  'host': dashDBCredentials.hostname,
                  'port': dashDBCredentials.port,
                  'db': dashDBCredentials.db,
                  'username': dashDBCredentials.username,
                  'password': dashDBCredentials.password,
                  'options': 'Security=SSL'
                }
              },
              'setting': {
                'inputs': [
                  {
                    'odbc': {
                      'dbRef': 'db',
                      'table': 'JOB_API_TEST'
                    },
                    'node': 'in',
                    'attributes': []
                  }
                ]
              }
            })
          }, function (error, response, body) {
            done();
          });
        });
      });

      after(function (done) {
        request({
          url: `${basicUrl}/file/job-test-17-1?accesskey=${accessKey}`,
          method: 'DELETE'
        }, function (error, response, body) {
          done();
        });
      });

      it('results with statusCode=200 when job exists', function (done) {
        request({
          url: `${url}/job-test-17-1?accesskey=${accessKey}`,
          method: 'DELETE'
        }, function (error, response, body) {
          expect(body).to.equal('1');
          expect(response.statusCode).to.equal(200);
          expect(error).to.equal(null);
          done();
        });
      });

      it('results with statusCode=200 when job doesn\'t exist', function (done) {
        request({
          url: `${url}/nonexisting?accesskey=${accessKey}`,
          method: 'DELETE'
        }, function (error, response, body) {
          expect(body).to.equal('0');
          expect(response.statusCode).to.equal(200);
          expect(error).to.equal(null);
          done();
        });
      });
    });
  });
});
