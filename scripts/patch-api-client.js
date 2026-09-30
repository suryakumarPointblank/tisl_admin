// openapi-generator-cli's "javascript" template calls request.end(callback)
// unconditionally inside ApiClient.callApi, even when no callback is passed
// (i.e. every call site in this app, which uses await/.then() instead).
// superagent's Request is thenable and calls its own internal .end() when
// awaited, so the request was being sent twice per call. This patch makes
// callApi only call .end() itself when an explicit callback was given,
// letting await/.then() trigger the single send otherwise.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'api-client', 'src', 'ApiClient.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `        request.end((error, response) => {
            if (callback) {
                var data = null;
                if (!error) {
                    try {
                        data = this.deserialize(response, returnType);
                        if (this.enableCookies && typeof window === 'undefined'){
                            this.agent._saveCookies(response);
                        }
                    } catch (err) {
                        error = err;
                    }
                }

                callback(error, data, response);
            }
        });

        return request;`;

const newBlock = `        if (callback) {
            request.end((error, response) => {
                var data = null;
                if (!error) {
                    try {
                        data = this.deserialize(response, returnType);
                        if (this.enableCookies && typeof window === 'undefined'){
                            this.agent._saveCookies(response);
                        }
                    } catch (err) {
                        error = err;
                    }
                }

                callback(error, data, response);
            });
        }

        return request;`;

if (!content.includes(oldBlock)) {
  throw new Error('patch-api-client: expected callApi block not found — openapi-generator output may have changed, update the patch');
}

fs.writeFileSync(filePath, content.replace(oldBlock, newBlock));
console.log('patch-api-client: patched callApi to avoid double request.end()');
