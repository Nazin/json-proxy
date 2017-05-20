const http = require('http');
const request = require('request');
const fs = require('fs');

http.createServer((req, res) => {
  console.log('Serving: ' + req.method + ' ' + req.url);

  const configuration = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const rules = (configuration.rules || []).filter((rule) => {
    return rule.enabled && req.method === rule.method && req.url.match(rule.url);
  });

  let requestBody = '';

  req.on('data', (data) => {
    requestBody += data;
  });

  req.on('end', () => {

    const adjustingRQRules = rules.filter((rule) => {
      return rule.adjust === 'RQ';
    });

    let newRequestBody;

    try {
      newRequestBody = requestBody ? JSON.parse(requestBody) : requestBody;
      let tmp = adjustBody(newRequestBody, undefined, adjustingRQRules);
      newRequestBody = tmp[0];
      newRequestBody = newRequestBody ? JSON.stringify(newRequestBody) : newRequestBody
    } catch (e) {
      console.log('Problem with adjusting the request');
      newRequestBody = requestBody;
    }

    const headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = configuration.endpoint.replace('https://', '');
    delete headers['accept-encoding'];

    const options = {
      url: configuration.endpoint + req.url,
      method: req.method,
      headers: headers,
      body: newRequestBody,
    };

    request(options, (error, response) => {

      const adjustingRSRules = rules.filter((rule) => {
        return rule.adjust === 'RS';
      });

      if (error) {
        console.log(error);
      }

      let responseBody;
      let responseStatusCode = response.statusCode;

      try {
        responseBody = response.body ? JSON.parse(response.body) : response.body;
        let tmp = adjustBody(requestBody ? JSON.parse(requestBody) : requestBody, responseBody, adjustingRSRules, responseStatusCode);
        responseBody = tmp[1];
        responseStatusCode = tmp[2];
        responseBody = responseBody ? JSON.stringify(responseBody) : responseBody;
      } catch (e) {
        console.log('Problem with adjusting the response');
        responseBody = response.body;
      }

      const headers = JSON.parse(JSON.stringify(response.headers));
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie'].map((cookie) => cookie.replace('Secure; HttpOnly', ''));
      }
      delete headers['content-length'];

      res.writeHead(responseStatusCode, headers);
      res.write(responseBody);
      res.end();
    });
  });
}).listen(3005, (error) => {
  if (error) {
    console.log(error);
  }
});

function adjustBody(requestBody, responseBody, rules, responseStatusCode) {
  rules.forEach((rule) => {
    rule.rules.forEach((rule) => {
      try {
        if (eval(rule.condition)) {
          console.log('Condition "' + rule.condition + '" valid');
          rule.actions.forEach((action) => {
            console.log('Applying rule: ' + action);
            try {
              eval(action);
            } catch (e) {
              console.log('invalid rule');
            }
          });
        }
      } catch (e) {
        console.log('invalid condition: "' + rule.condition + '"');
      }
    })
  });
  return [requestBody, responseBody, responseStatusCode];
}
