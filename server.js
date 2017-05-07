const http = require('http');
const request = require('request');
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

    requestBody = requestBody ? JSON.parse(requestBody) : requestBody;
    //TODO logic to adjust the requestBody

    const headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = configuration.endpoint.replace('https://', '');
    delete headers['accept-encoding'];

    const options = {
      url: configuration.endpoint + req.url,
      method: req.method,
      headers: headers,
      body: requestBody ? JSON.stringify(requestBody) : requestBody,
    };

    request(options, (error, response) => {

      const adjustingRSRules = rules.filter((rule) => {
        return rule.adjust === 'RS';
      });

      if (error) {
        console.log(error);
      }

      let responseBody = response.body ? JSON.parse(response.body) : response.body;

      adjustingRSRules.some((rule) => {
        if (rule.replaceWith) {
          console.log('Replacing entire RS');
          responseBody = rule.replaceWith;
          return true;
        }
        rule.rules.forEach((rule) => {
          if (eval(rule.condition)) {
            console.log('Condition "' + rule.condition + '" valid');
            rule.actions.forEach((action) => {
              console.log('Applying rule: ' + action);
              eval(action);
            });
          }
        })
      });

      responseBody = responseBody ? JSON.stringify(responseBody) : responseBody;
      const headers = JSON.parse(JSON.stringify(response.headers));
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie'].map((cookie) => cookie.replace('Secure; HttpOnly', ''));
      }
      delete headers['content-length'];

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
