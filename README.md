[pa]: https://console.ng.bluemix.net/catalog/services/predictive-analytics/  "PA"
[ml]: https://console.ng.bluemix.net/catalog/services/ibm-watson-machine-learning/  "ML"
[bm]: https://console.ng.bluemix.net/
[general]: https://github.com/pmservice/drug-selection/blob/master/documentation/IBM%20Watson%20Machine%20Learning%20for%20Bluemix%20-%20General.pdf
[pa-api]: https://console.ng.bluemix.net/docs/services/PredictiveModeling/index-gentopic1.html#pm_service_api

# About
This sample application demonstrates the [IBM Watson Machine Learning][ml] [Bluemix][bm] offering. It's an extension of the Big Data University [Predicting Financial Performance of a Company](https://courses.bigdatauniversity.com/courses/course-v1:BigDataUniversity+PA0107EN+2016/courseware/da924c023b9b4009972ea7f973a572b8/) course. While participation in this course is recommended, it's not required.

This application is based on the Node.js and Express framework. It uses the [Watson Machine Learning service API][pa-api] to integrate with IBM SPSS Modeler analytics.

The application delivers an analytics-driven environment where one can explore time series from various perspectives and use the most suitable forecasting methods to forecast the future. With this sample application, you can:

* Download financial and economical time series from open data sources and explore them to observe general characteristics such as trend, seasonality, return distributions, and correlation between time series.
* Perform near-future forecasting based on historical data with a level of confidence so that we can use time series analysis and forecasting to solve our specific business problem.

For details, see [this section](#how-to-use-the-application).

![Application screenshot](/doc/app-scr.png)
![Application screenshot](/doc/app-forecast.png)

# Requirements
* [IBM ID](https://www.ibm.com/account/profile/us?page=reg) to log in to [Bluemix][bm]. See [free trial](http://www.ibm.com/developerworks/cloud/library/cl-bluemix-fundamentals-start-your-free-trial/index.html) if you don't yet have an ID.
* [Cloud Foundry command line interface](https://github.com/cloudfoundry/cli/releases) (only if you want to manually deploy to Bluemix)
* [IBM SPSS Modeler](http://ibm.com/tryspss) (only if you want to modify stream or create new ones)
* [Node.js 6.3.1 or higher](https://nodejs.org) runtime (only if you want to modify the source code)

### Preparing the Bluemix ecosystem
The general, high-level steps are described below. Refer to [IBM Watson Machine Learning Service for Bluemix - General][general] for complete details.

1. From the Bluemix catalog, choose the [Watson Machine Learning][ml] and [dashDB](https://console.ng.bluemix.net/catalog/services/dashdb/) services, which will later bind to a Node.js application created from this sample. From this point, note that the [service][pa] itself offers a set of samples (this particular one among them) that can be automatically deployed and bound, which is the simplest way to see the sample in action.
2. Upload an SPSS Modeler stream file to your instance of the *Watson Machine Learning* service. This sample application comes with an SPSS Modeler stream (*stream/financial-performance-prediction.str*) that can be used for this purpose. The stream can also be created from scratch (see [Preparing an SPSS Modeler stream](#prepare-spss-modeler-stream)).


# Deploying the prebuilt app
For a fast start, you can deploy the prebuilt app to Bluemix by clicking the following button:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/pmservice/financial-performance-prediction&appName=predicting-financial&branch=master)

Note that the application is fully functional only if bound to instances of the *Watson Machine Learning* and *dashDB* services, which must be done manually. See the [instructions](#binding-services-in-bluemix).

### Manually deploying to Bluemix
As an alternative to the button, you can manually deploy the application to Bluemix by pushing it with Cloud Foundry commands, as described in the [next section](#push-to-bluemix). Manual deployment is required when you want to deploy [modified source code](#source-code-changes). Manual deployment consists of [pushing](#push-to-bluemix) the application to Bluemix followed by [binding](#binding-services-in-bluemix) the *Watson Machine Learning* service to the deployed application.

##### Pushing to Bluemix
To push an application to Bluemix, open a shell, change to the directory of your application, and run the following:

* `cf api <region>` where <*region*> part may be https://api.ng.bluemix.net or https://api.eu-gb.bluemix.net depending on the Bluemix region you want to work with (US or Europe, respectively)
* `cf login` which is interactive; provide all required data
* `cf push <app-name>` where <*app-name*> is the application name of your choice

`cf push` can also read the manifest file (see [Cloud Foundry Documentation](http://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html)). If you decide to use manifest, you can hardcode the names of your Watson Machine Learning and dashDB service instances instead of binding them manually. See the *services* section of the [manifest.yml.template](manifest.yml.template) file.

If this is your first Bluemix Node.js application, see the [node-helloworld project documentation](https://github.com/IBM-Bluemix/node-helloworld) to gain general experience.

##### Binding the Watson Machine Learning service
See the [instructions](#binding-services-in-bluemix).

### Deploying locally
Running the application locally is useful when you want to test your changes before deploying them to Bluemix. For information about working with source code, see [Source code changes](#source-code-changes).

When the changes are ready, open a shell, change the directory to your cloned repository, and run `npm start` to start the application. The running application is available in a browser at *http://localhost:4000*. In develompent mode, the hot reloading feature is available at port 4010.

Applications that run locally can also use the Watson Machine Learning and dashDB Bluemix services. See the [instructions](#link-local-application-with-the-bluemix-environment).

## Rebuilding the app after modifying source code
The repository comes with prebuilt application. If you want to rebuild the app after modifying the sources:

* Follow steps listed in the [Requirements](#requirements) section
* Change to the directory containing the downloaded source code or the cloned git repo
* Run `npm install`
* Run `./node_modules/.bin/webpack`


# Watson Machine Learning service (classic service with SPSS streams)
To add the power of IBM SPSS Modeler analytics to any application, use the [Watson Machine Learning service API][pa-api].

This particular application involves:

* Retrieving all models currently deployed to the Watson Machine Learning service (model API)
* Uploading a stream file to use in jobs (file API)
* Submitting TRAINING and BATCH_SCORE jobs against an uploaded Modeler stream file (service batch job API)
* Checking the status of a job (service batch job API)
* Deleting jobs (service batch job API)
* Deleting files (file API)

The code placed in the [pa](app_server/clients/pa) folder provides an example of how to use this [API][pa-api].

## Binding services in Bluemix
As stated in the [Requirements](#requirements) section, from the Bluemix catalog you must order an instance of the *Watson Machine Learning* and *dashDB* services if you don't yet have them. The next step is to connect your deployed application to those services, which is called *binding*. There are a few ways to achieve this in the Bluemix environment. [This document](https://console.ng.bluemix.net/docs/cfapps/ee.html) describes binding either via the Bluemix user interface or by using cf cli.

## Linking a local application with the Bluemix environment
The application running locally can use Bluemix services if the credentials for the *Watson Machine Learning* and *dashDB* services are appropriately pasted into the *./config/local.json* file. Complete the following steps:

1. Deploy the application to Bluemix and bind it to the [Watson Machine Learning service][ml].
2. Go to the application overview pane, choose bound Watson Machine Learning service, and click **Show Credentials**. Copy the (pm-20) *credentials* json portion (url, access_key).
3. Create the *./config/local.json* file by copying the *./config/local.json.template* file. Edit the *local.json* file and paste the pm-20 credentials you obtained in the previous step.
4. Perform similar steps for the *dashDB* service and its credentials.
5. Start your local application. You should now be able to interact with the Watson Machine Learning service (for example, by listing the uploaded streams).


# Using the application

### Preparing input data  
##### 1. Downloading data from Yahoo Finance
  * Go to *finance.yahoo.com*.
  * Type any company name or symbol of your interest. In this example, we'll type **IBM** in the search box and select **IBM** from the search results.

![Search screenshot](/doc/search-tkr-scr.png)

  * Go to the **Historical Data** tab.

![Result screenshot](/doc/search-result-scr.png)

  * Select a time range, click **Apply**, and click **Download** to save the dataset to your local machine.

![Download screenshot](/doc/search-download-scr.png)

  * The saved file format is as follows:

![Result format screenshot](/doc/search-format-scr.png)

  * Open your application and click **Import Custom Data**.

![Import Custom Data screenshot](/doc/import-custom-data-scr.png)

  * Browse to the file you downloaded from Yahoo Finance. Add a **Company name** and **Symbol** and click **Import & Save Data**.

  The **Symbol** should be short and descriptive because the application will use it for chart legends.

##### 2. Preparing your own data
As an alternative to downloading Yahoo Finance data, you can also import other data files. See the following guidelines.

  * Your data must be in comma separated format (.csv), meaning that values should be separated by “,” in the file, as shown below:

![Result format screenshot](/doc/search-format-scr.png)

  *	The data file must have at least two columns named **Date** and **Adj Close**. These columns will be filtered during import and used as the final dataset.

### Preparing an SPSS Modeler stream
  * Create a new stream.
  * From the **Source** palette, add a **Var. File** node.

![Var. File node screenshot](/doc/var-node-scr.png)

  * Browse to the *table.csv* file.

![Browse table.csv file screenshot](/doc/spss-browse-file.png)

  * On the **Annotations** tab, rename the **Var. File** node to "**in**" and click **OK**.

![Rename node screenshot](/doc/spss-rename.png)

  * From the **Field Ops** palette, add a **Type** node.

![Rename node screenshot](/doc/spss-type-node.png)

  *	Set the **VALUE** field’s role to **Both**.

![Rename node screenshot](/doc/spss-set-both.png)

  * Click **Read Values** and click **OK**.
  * From the **Modeling** palette, add a **Time Series** node.

![Time Series node screenshot](/doc/spss-time-series-node.png)

  * Double-click the **Time Series** node, go to the **Data Specifications** tab, and set the **Date/time** field to **DATE** and set the **Time interval** to **Months**.

![Data Specifications screenshot](/doc/spss-data-specs.png)

  * Go to the **Build Options** tab and adjust the settings as follows:

![Build Options screenshot](/doc/spss-build-options.png)

  * Go to the **Model Options** tab and select **Extend records into the future**.

![Model Options screenshot](/doc/spss-model-options.png)

  * Click **Run** to run stream.

![Run a stream screenshot](/doc/spss-stream-run.png)

  * From the **Output** palette, add a **Table** node to the stream.

![Add Table node screenshot](/doc/spss-add-table-output.png)

  * Right-click the **Table**node and select **Use as Scoring Branch**.

![Use as scoring branch screenshot](/doc/spss-scoring-branch.png)

  * The final stream is finished as shown below.

![Final stream screenshot](/doc/spss-final-stream.png)


# License
The code is available under the Apache License, Version 2.0.
