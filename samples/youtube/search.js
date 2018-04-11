// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {google} = require('googleapis');
const sampleClient = require('../sampleclient');
var fs = require("fs");

// initialize the Youtube API library
const youtube = google.youtube({
  version: 'v3',
  auth: sampleClient.oAuth2Client
});
console.log("credentials = " + oAuth2Client.credentials);

// a very simple example of searching for youtube videos
async function runSample () {
  console.log("credentials in run sample = " + oAuth2Client.credentials);
  const res = youtube.search.list({
    part: 'id,snippet',
    q: 'Node.js on Google Cloud'
  });
  // 為什麼不能直接用res.data來show?
  res.then((value) => {
    var s = JSON.stringify(value.data, null, 2);
    fs.writeFile("../search_result.json", s, function(err) {
        console.log("write finish.")
    });
    console.log(s);
});
}

const scopes = [
  'https://www.googleapis.com/auth/youtube'
];

sampleClient.authenticate(scopes)
  .then(c => runSample())
  .catch(console.error);
