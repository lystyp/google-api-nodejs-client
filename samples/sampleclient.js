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

/**
 * This is used by several samples to easily provide an oauth2 workflow.
 */

const {google} = require('googleapis');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const opn = require('opn');
const destroyer = require('server-destroy');
const fs = require('fs');
const path = require('path');

var TOKEN_DIR = '../.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

const keyPath = path.join(__dirname, 'oauth2.keys.json');
let keys = { redirect_uris: [''] };
if (fs.existsSync(keyPath)) {
  keys = require(keyPath).installed;
}

class SampleClient {
  constructor (options) {
    this._options = options || { scopes: [] };

    // create an oAuth client to authorize the API call
    this.oAuth2Client = new google.auth.OAuth2(
      keys.client_id,
      keys.client_secret,
      keys.redirect_uris[1]
    );
  }

  // Open an http server to accept the oauth callback. In this
  // simple example, the only request to our webserver is to
  // /callback?code=<code>
  async authenticate (scopes) {
    var oAuth2Client = this.oAuth2Client;
    return new Promise((resolve, reject) => {
      console.log("This = " + this.constructor.name);
      // grab the url that will be used for authorization
      fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
          var authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' ')
          });
          const server = http.createServer(async (req, res) => {
            try {
              if (req.url.indexOf('/oauth2callback') > -1) {
                // querystring.parse(...) > 用來把 “m=helll&u=jollen” 轉成 { m: 'hello', u: 'jollen' } 
                // url.parse(req.url)用來把 127.0.0.1:3000/abc?a=1&b=2 的req.url(就是/abc?a=1&b=2)部分解析出來，就是abc?a=1&b=2 拆成 abc 部分跟 ? 後面部分
                // 後面部分就是url.parse(req.url).query，前面是.pathname
                console.log("req.url = " + req.url);
                // 這個qs如果外洩了是不是也會不安全啊
                const qs = querystring.parse(url.parse(req.url).query);
                res.end('Authentication successful! Please return to the console.');
                server.destroy();
                // await是什麼?
                const {tokens} = await oAuth2Client.getToken(qs.code);
                oAuth2Client.credentials = tokens;
                storeToken(tokens);
                resolve(oAuth2Client);
              }
            } catch (e) {
              reject(e);
            }
          }).listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
          });
          destroyer(server);
        } else {
          oAuth2Client.credentials = JSON.parse(token);
          resolve(oAuth2Client);
        }
      });
    });
  }
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

module.exports = new SampleClient();
