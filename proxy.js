import http from 'http';
import request from 'request';
import fs from 'fs';

let server;

export function createProxyServer() {
  server = http.createServer((req, res) => {
    console.log(`Serving: ${req.method} ${req.url}`);

    const configuration = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    const matchingURLs = (configuration.urls || []).filter(url => url.enabled && req.method === url.method && req.url.match(url.url));
    const urlConfiguration = matchingURLs.length !== 0 ? matchingURLs[0] : undefined;
    const proxy = configuration.proxy.enabled ? configuration.proxy.url : undefined;

    let requestBody = '';

    req.on('data', (data) => {
      requestBody += data;
    });

    req.on('end', () => {
      let newRequestBody;

      try {
        newRequestBody = requestBody ? JSON.parse(requestBody) : requestBody;
        const tmp = adjustBody(newRequestBody, undefined, urlConfiguration && urlConfiguration.rules || []);
        newRequestBody = tmp[0];
        newRequestBody = newRequestBody ? JSON.stringify(newRequestBody) : newRequestBody;
      } catch (e) {
        console.log('Problem with adjusting the request');
        newRequestBody = requestBody;
      }

      const headers = JSON.parse(JSON.stringify(req.headers));
      headers.host = configuration.endpoint.replace('https://', '');
      delete headers['accept-encoding'];

      if (urlConfiguration && !urlConfiguration.sendRQ) {
        adjustAndSendResponse(res, {statusCode: 200}, requestBody, urlConfiguration);
        return;
      }

      const options = {
        url: configuration.endpoint + req.url,
        method: req.method,
        headers,
        body: newRequestBody,
        proxy,
      };

      request(options, (error, response) => {
        if (error) {
          console.log(error);
        }
        adjustAndSendResponse(res, response, requestBody, urlConfiguration);
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
  rules.forEach((detailedRule) => {
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
  return [requestBody, responseBody, responseStatusCode];
}

function adjustAndSendResponse(res, response, requestBody, urlConfiguration) {

  let responseBody;
  let responseStatusCode = response && response.statusCode || 500;

  try {
    responseBody = response.body ? JSON.parse(response.body) : response.body;
    const tmp = adjustBody(requestBody ? JSON.parse(requestBody) : requestBody, responseBody, urlConfiguration && urlConfiguration.rules || [], responseStatusCode);
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
}
