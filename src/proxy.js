import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import request from 'request';
import fs from 'fs';
import sendError from './utils/sendError';
import adjustRequest from './utils/adjustRequest';
import adjustAndSendResponse from './utils/adjustAndSendResponse';

let server;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export function createProxyServer() {
  const app = express();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors({
    origin: (ignored, callback) => callback(null, true),
    credentials: true,
  }));

  server = http.createServer(app);

  app.use('/', (req, res) => {
    console.log(`Serving: ${req.method} ${req.url}`);

    const configuration = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8'));
    const endpoint = (configuration.endpoints || []).find(singleEndpoint => req.url.match(new RegExp(`^/${singleEndpoint.name}/`)));

    if (endpoint === undefined) {
      sendError({ res, message: 'NO_ENDPOINT_CONFIGURED' });
      return;
    }

    const endpointName = endpoint.name;
    const reqURL = req.url.replace(new RegExp(`^/${endpoint.name}/`), '/');
    const urlConfiguration = (endpoint.urls || []).find(url => url.enabled && req.method === url.method && reqURL.match(url.url));
    const proxy = configuration.proxy.enabled ? configuration.proxy.url : undefined;

    const requestBody = req && req.body;
    const rules = (urlConfiguration && urlConfiguration.rules) || [];
    const newRequestBody = adjustRequest({ requestBody, rules });

    if (urlConfiguration && !urlConfiguration.sendRQ) {
      adjustAndSendResponse({ res, response: { statusCode: 200 }, requestBody, rules, endpointName });
      return;
    }

    const headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = endpoint.url.replace('https://', '');
    delete headers['accept-encoding'];

    const options = {
      url: endpoint.url + reqURL,
      method: req.method,
      headers,
      body: newRequestBody,
      proxy,
    };

    request(options, (error, response) => {
      console.log('Forward call to ', options.url);
      if (error) {
        console.log(error);
      }
      adjustAndSendResponse({ res, response, requestBody, rules, endpointName });
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
