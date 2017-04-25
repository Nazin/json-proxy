const http = require('http');
const request = require('request');
const qs = require('querystring');

const HOST = 'https://graph.facebook.com';//TODO needs to be taken from the configuration

http.createServer((req, res) => {
  console.log('Serving: ' + req.method + ' ' + req.url);

  let requestBody = '';

  req.on('data', (data) => {
    requestBody += data;
  });

  req.on('end', () => {
    let parsedRequest = qs.parse(requestBody);//TODO logic to adjust the requests

    const headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = HOST.replace('https://', '');
    delete headers['accept-encoding'];

    const options = {
      url: HOST + req.url,
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
