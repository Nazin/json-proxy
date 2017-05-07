const http = require('http');
const request = require('request');
const qs = require('querystring');
const fs = require('fs');

http.createServer((req, res) => {
  console.log('Serving: ' + req.method + ' ' + req.url);

  const configuration = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const rules = (configuration.rules || []).filter((rule) => {
    return rule.enabled && req.url.match(rule.url);
  });

  let requestBody = '';

  req.on('data', (data) => {
    requestBody += data;
  });

  req.on('end', () => {

    const adjustingRQRules = rules.filter((rule) => {
      return rule.adjust === 'RQ';
    });

    let parsedRequest = qs.parse(requestBody);//TODO logic to adjust the requests

    const headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = configuration.endpoint.replace('https://', '');
    delete headers['accept-encoding'];

    const options = {
      url: configuration.endpoint + req.url,
      method: req.method,
      headers: headers,
      body: requestBody,
    };

    request(options, (error, response) => {

      const adjustingRSRules = rules.filter((rule) => {
        return rule.adjust === 'RS';
      });

      if (error) {
        console.log(error);
      }

      let responseBody = JSON.parse(response.body);

      adjustingRSRules.some((rule) => {
        if (rule.replaceWith) {
          console.log('Replacing entire RS');
          responseBody = rule.replaceWith;
          return true;
        }
      });

      responseBody = JSON.stringify(responseBody);
      const headers = JSON.parse(JSON.stringify(response.headers));
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie'].map((cookie) => cookie.replace('Secure; HttpOnly', ''));
      }
      headers['content-length'] = responseBody.length;
      res.writeHead(response.statusCode, headers);
      res.write(responseBody);
      res.end();
    });
  });
}).listen(3005, (error) => {
  if (error) {
    console.log(error);
  }
});
