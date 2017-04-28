const http = require('http');
const request = require('request');
const qs = require('querystring');
const fs = require('fs');

http.createServer((req, res) => {
  console.log('Serving: ' + req.method + ' ' + req.url);

  const configuration = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  let requestBody = '';

  req.on('data', (data) => {
    requestBody += data;
  });

  req.on('end', () => {
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
      if (error) {
        console.log(error);
      }
      const headers = JSON.parse(JSON.stringify(response.headers));
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie'].map((cookie) => cookie.replace('Secure; HttpOnly', ''));
      }
      res.writeHead(response.statusCode, headers);
      res.write(response.body);//TODO logic to adjust response
      res.end();
    });
  });
}).listen(3005, (error) => {
  if (error) {
    console.log(error);
  }
});
