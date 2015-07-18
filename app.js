/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
  app = express(),
  bluemix = require('./config/bluemix'),
  watson = require('watson-developer-cloud'),
  extend = require('util')._extend,
  path = require('path'),
  request = require('request'),
  fs = require('fs'),
  dummy_text = fs.readFileSync('mobydick.txt');


// Bootstrap application settings
require('./config/express')(app);


var personalityInsightsCredentials = extend({
    version: 'v2',
    url: 'https://gateway.watsonplatform.net/personality-insights/api',
    username: 'eb4d3bde-a570-4066-899c-13e4222f3152',
    password: 'BhUYoBG1KCUF'
}, bluemix.getServiceCreds('personality_insights')); // VCAP_SERVICES

var speechToTextCredentials = extend({
      version: 'v1',
      url: 'https://stream.watsonplatform.net/speech-to-text/api',
      username: 'a650bcbc-f5ab-494c-91f8-2794a399c9c9',
      password: 'gLqyOpXi8Vmr'
  }, bluemix.getServiceCreds('speech_to_text'));  // VCAP_SERVICES 

// Create the service wrapper
var personalityInsights = new watson.personality_insights(personalityInsightsCredentials);

// Setup static public directory
app.use(express.static(path.join(__dirname , './public')));

app.post('/', function(req, res) {
  personalityInsights.profile(req.body, function(err, profile) {
    if (err) {
      if (err.message){
        err = { error: err.message };
      }
      return res.status(err.code || 500).json(err || 'Error processing the request');
    }
    else
      return res.json(profile);
  });
});


// Get token from Watson using your credentials
app.get('/token/speech-to-text', function(req, res) {
  request.get({
    url: 'https://stream.watsonplatform.net/authorization/api/v1/token?url=' +
      'https://stream.watsonplatform.net/speech-to-text/api',
    auth: {
      user: speechToTextCredentials.username,
      pass: speechToTextCredentials.password,
      sendImmediately: true
    }
  }, function(err, response, body) {
    res.status(response.statusCode).send(body);
  });
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);