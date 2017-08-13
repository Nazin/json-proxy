import http from 'http';
import request from 'request';
import fs from 'fs';

let server;

export function createProxyServer() {
  server = http.createServer((req, res) => {
    console.log(`Serving: ${req.method} ${req.url}`);

    const configuration = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    const rules = (configuration.rules || []).filter(rule => rule.enabled && req.method === rule.method && req.url.match(rule.url));
    const proxy = configuration.proxy.enabled ? configuration.proxy.url : undefined;

    let requestBody = '';

    req.on('data', (data) => {
      requestBody += data;
    });

    req.on('end', () => {
      const adjustingRQRules = rules.filter(rule => rule.adjust === 'RQ');

      let newRequestBody;

      try {
        newRequestBody = requestBody ? JSON.parse(requestBody) : requestBody;
        const tmp = adjustBody(newRequestBody, undefined, adjustingRQRules);
        newRequestBody = tmp[0];
        newRequestBody = newRequestBody ? JSON.stringify(newRequestBody) : newRequestBody;
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
        headers,
        body: newRequestBody,
        proxy,
      };

      request(options, (error, response) => {
        const adjustingRSRules = rules.filter(rule => rule.adjust === 'RS');

        if (error) {
          console.log(error);
        }

        let responseBody;
        let responseStatusCode = response && response.statusCode || 500;

        try {
          responseBody = response.body ? JSON.parse(response.body) : response.body;
          const tmp = adjustBody(requestBody ? JSON.parse(requestBody) : requestBody, responseBody, adjustingRSRules, responseStatusCode);
          responseBody = tmp[1];
          responseStatusCode = tmp[2];
          responseBody = responseBody ? JSON.stringify(responseBody) : responseBody;
        } catch (e) {
          console.log('Problem with adjusting the response');
          responseBody = response && response.body || JSON.stringify({status: 'ERROR'});
        }

        const responseHeaders = JSON.parse(JSON.stringify(response && response.headers || {"Content-Type": "application/json"}));
        if (responseHeaders['set-cookie']) {
          responseHeaders['set-cookie'] = responseHeaders['set-cookie'].map(cookie => cookie.replace('Secure; HttpOnly', ''));
        }
        delete responseHeaders['content-length'];

        res.writeHead(responseStatusCode, responseHeaders);
        res.write(responseBody);
        res.end();
      });
    });
  });
}

export function startProxyServer() {
  server.listen(3005, (error) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log('Proxy server started, listening at http://localhost:3005');
  });
}

export function stopProxyServer() {
  server.close();
}

function adjustBody(requestBody, responseBody, rules, responseStatusCode) {
  rules.forEach((rule) => {
    rule.rules.forEach((detailedRule) => {
      try {
        if (eval(detailedRule.condition)) {
          console.log(`Condition "${detailedRule.condition}" valid`);
          detailedRule.actions.forEach((action) => {
            console.log(`Applying rule: ${action}`);
            try {
              eval(action);
            } catch (e) {
              console.log('invalid rule');
            }
          });
        }
      } catch (e) {
        console.log(`invalid condition: "${detailedRule.condition}"`);
      }
    });
  });
  return [requestBody, responseBody, responseStatusCode];
}
