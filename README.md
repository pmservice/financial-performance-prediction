[pa]: https://console.ng.bluemix.net/catalog/services/predictive-analytics/  "PA"
[ml]: https://console.ng.bluemix.net/catalog/services/ibm-watson-machine-learning/  "ML"
[bm]: https://console.ng.bluemix.net/
[general]: https://github.com/pmservice/drug-selection/blob/master/documentation/IBM%20Watson%20Machine%20Learning%20for%20Bluemix%20-%20General.pdf
[pa-api]: https://console.ng.bluemix.net/docs/services/PredictiveModeling/index-gentopic1.html#pm_service_api

# About
The application demonstrates usage of [IBM Watson Machine Learning][ml] [Bluemix][bm] offering. This is also an extension of Big Data University [Predicting Financial Performance of a Company](https://courses.bigdatauniversity.com/courses/course-v1:BigDataUniversity+PA0107EN+2016/courseware/da924c023b9b4009972ea7f973a572b8/) course; while participation in this course helps, it is not obligatory.

Application is based on Node.js and Express framework. It uses [Watson Machine Learning service API][pa-api] to integrate with IBM SPSS Modeler analytics.

Application delivers analytics-driven environment where one can explore time series from various perspectives and forecast future by using most suitable forecasting methods.It consists of two parts. First part is about downloading financial and economical time series from open data sources and exploring them to see general characteristics such as trend, seasonality, return distributions and correlation between time series. Second part helps to forecast near-future based on historical data with a level of confidence so that we can use time series analysis and forecast to solve our specific business problem. For more details see [this section](#how-to-use-the-application).

![Application screenshot](/doc/app-scr.png)
![Application screenshot](/doc/app-forecast.png)

# Requirements
* [IBM ID](https://www.ibm.com/account/profile/us?page=reg) to login to [Bluemix][bm]; see [free trial](http://www.ibm.com/developerworks/cloud/library/cl-bluemix-fundamentals-start-your-free-trial/index.html) article if you don't yet have it
* [Cloud Foundry command line interface](https://github.com/cloudfoundry/cli/releases) (only if you want to manually deploy to Bluemix)
* [IBM SPSS Modeler](http://ibm.com/tryspss) (only if you want to modify the stream or create a new one)
* [Node.js 6.3.1 or higher](https://nodejs.org) runtime (only if you want to modify the source code)

### Prepare Bluemix ecosystem
Whole preparation is described in details in [IBM Watson Machine Learning Service for Bluemix - General][general] document, below steps are rather concise. In case of doubts refer to the document mentioned.

1. From Bluemix catalog choose [Watson Machine Learning][ml] and [dashDB](https://console.ng.bluemix.net/catalog/services/dashdb/) services, which will later be binded to a Node.js application created from this sample. From this point note that the [service][pa] itself offers a set of samples (this particular one among them) which can be automatically deployed and binded and that is the simplest way to see the sample in action.
2. Upload the SPSS Modeler stream to your instance of *Watson Machine Learning* service. This sample application comes with SPSS Modeler stream (stream/financial-performance-prediction.str) which can be used for that. The stream can also be created from scratch and this process is described in  [Prepare SPSS Modeler stream](#prepare-spss-modeler-stream) section.


# Deployment
For a fast start, you can deploy the pre-built app to Bluemix by clicking the button

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/pmservice/financial-performance-prediction)

Note the application is fully functional only if binded with instances of *Watson Machine Learning* and *dashDB* services, which need to be done manually. Check [instructions](#binding-services-in-bluemix) how to do it.

### Manual Bluemix deployment
As an alternative to the button, the application can be manually deployed to Bluemix by pushing it with Cloud Foundry commands, as described in next [section](#push-to-bluemix). Manual deployment is also required when you want to deploy [modified source code](#source-code-changes). Manual deployment consists of [pushing](#push-to-bluemix) the application to Bluemix followed by [binding](#binding-services-in-bluemix) *Watson Machine Learning* service to deployed application.

##### Push to Bluemix
To push an application to Bluemix, open a shell, change to directory of your application and execute:
  * `cf api <region>` where <*region*> part may be https://api.ng.bluemix.net or https://api.eu-gb.bluemix.net depending on the Bluemix region you want to work with (US or Europe, respectively)
  * `cf login` which is interactive; provide all required data
  * `cf push <app-name>` where <*app-name*> is the application name of your choice

`cf push` can also read the manifest file, see [Cloud Foundry Documentation](http://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html). If you decide to use manifest, you can hardcode the name of your instance of Watson Machine Learning and dashDB services instead of binding them manually, see *services* section of  [manifest.yml.template](manifest.yml.template) file.

If this is your first Bluemix Node.js application, refer [documentation of node-helloworld project](https://github.com/IBM-Bluemix/node-helloworld) to gain general experience.

##### Bind Watson Machine Learning service
See [instructions](#binding-services-in-bluemix)

### Local deployment
Running the application locally is useful when you want to test your changes before deploying them to Bluemix. To see how to work with source code, see [Source code changes](#source-code-changes).

When the changes are ready, open a shell, change directory to your cloned repository and execute `npm start` to start the application. The running application is available in a browser at http://localhost:4000 url. In develompent mode the hot reloading feature is available at port 4010.

Application run locally can also use Bluemix Watson Machine Learning and dashDB services, see [instructions](#link-local-application-with-the-bluemix-environment) how to link it.

## Source code changes
The repository comes with pre-build app. If you want to rebuild application after modifying the sources:
  * Follow steps listed in [Requirements](#requirements) section
  * Change to directory with downloaded source code or cloned git repo
  * Execute `npm install`
  * Execute `./node_modules/.bin/webpack`


# Watson Machine Learning service (classic service with SPSS streams)
To empower any application with IBM SPSS Modeler analytics use [Watson Machine Learning service API][pa-api].

This particular application deals with:
  * Retrieval of all models currently deployed to Watson Machine Learning service (model API)
  * Uploading a stream file to use in jobs (file API)
  * Submitting TRAINING and BATCH_SCORE jobs against uploaded Modeler stream file (service batch job API)
  * Checking the status of a job (service batch job API)
  * Deleting jobs (service batch job API)
  * Deleting files (file API)

The code placed in [pa](app_server/clients/pa) folder is an example of how to employ this [API][pa-api].

## Binding services in Bluemix
As stated in [Requirements](#requirements) section, from Bluemix catalog order an instance of *Watson Machine Learning* and *dashDB* service if you don't yet have them. Next step is to connect your deployed application with those services, which is called *binding*. There are a few options to achieve that in Bluemix environment, [link](https://console.ng.bluemix.net/docs/cfapps/ee.html) describes binding either by Bluemix user interface or by using cf cli.

## Link local application with the Bluemix environment
The application running locally can use Bluemix services if only credentials for *Watson Machine Learning* and *dashDB* services are appropriately pasted to *./config/local.json* file. These can be achieved using below steps.

1. Deploy application to Bluemix and bind it to [Watson Machine Learning service][ml].
2. Go to the application overview pane, choose binded Watson Machine Learning service and press 'Show Credentials'. Copy the (pm-20) *credentials* json part (url, access_key).
3. Create *./config/local.json* file by copying *./config/local.json.template* file. Edit the *local.json* file and paste obtained pm-20 credentials.
4. Perform similar steps for *dashDB* service and its credentials.
5. Start your local application. You should be able to interact with the Watson Machine Learning service e.g. by listing the streams uploaded.


# How to use the application

### Prepare input data  
##### 1. Download data from Yahoo Finance
  * Navigate to finance.yahoo.com
  * Type any company name of symbol of your interest. In this case, we will type “IBM” in search box and select IBM from search results.

![Search screenshot](/doc/search-tkr-scr.png)

  * Click “Historical Data” tab.

![Result screenshot](/doc/search-result-scr.png)

  * Select time range and click “Apply” and click “Download” to save dataset to your local hard drive.

![Download screenshot](/doc/search-download-scr.png)

  * Saved file format will be as following

![Result format screenshot](/doc/search-format-scr.png)

  * Open your application and click on “Import Custom Data”

![Import Custom Data screenshot](/doc/import-custom-data-scr.png)

  * Browse to the file that you have downloaded from Yahoo Finance. Add “Company name” and “Symbol” and click “Import & Save Data”.

  “Symbol” should be short and descriptive as application use this for chart legends.

##### 2. Prepare own data
As an alternative to Yahoo data download, you can also import other files on your own by following below guidelines

  * Your data should be in comma separated format (.csv) meaning that values should be separated by “,” in the file, as shown below

![Result format screenshot](/doc/search-format-scr.png)

  *	Data file should at least have 2 columns named as “Date” and “Adj Close” and these columns will be filtered in the import stage and used as final dataset.

### Prepare SPSS Modeler stream
  * Create a new stream.
  * Add a “Var. File” node from “Source” palette.

![Var. File node screenshot](/doc/var-node-scr.png)

  * Browse “table.csv” file.

![Browse table.csv file screenshot](/doc/spss-browse-file.png)

  * **Rename** “Var. File” node **as** "**in**" using annotations and click “OK”.

![Rename node screenshot](/doc/spss-rename.png)

  * Add “Type” node from “Field Ops” palette.

![Rename node screenshot](/doc/spss-type-node.png)

  *	Set “VALUE” field’s role to “Both”

![Rename node screenshot](/doc/spss-set-both.png)

  * Click “Read Values” and click “OK”.
  * Add “Time Series” node from “Modeling” palette.

![Time Series node screenshot](/doc/spss-time-series-node.png)

  * Once you double click on “Time Series” node, navigate to “Data Specifications” tab and set “Date/time field” to “DATE” field and set “Time interval” to “Months”.

![Data Specifications screenshot](/doc/spss-data-specs.png)

  * Open “Build Options” tab and adjust settings as shown below.

![Build Options screenshot](/doc/spss-build-options.png)

  * Open “Model Options” tab and check “Extend records into the future” box.

![Model Options screenshot](/doc/spss-model-options.png)

  * Click “Run” to run stream.

![Run a stream screenshot](/doc/spss-stream-run.png)

  * Add “Table” node from “Output” palette to stream.

![Add Table node screenshot](/doc/spss-add-table-output.png)

  * Right-click on “Table” node and select “Use as Scoring Branch”

![Use as scoring branch screenshot](/doc/spss-scoring-branch.png)

  * You will have your final stream as shown below.

![Final stream screenshot](/doc/spss-final-stream.png)


# License
The code is available under the Apache License, Version 2.0.
