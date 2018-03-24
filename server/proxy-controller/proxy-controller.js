import fs from 'fs';
import path from 'path';
import request from 'request';
import { Router } from 'express';
import sendError from './sendError';
import adjustRequest from './adjustRequest';
import adjustResponse from './adjustResponse';

export default () => {
  const router = new Router();

  router.all('*', (req, res) => {
    console.log(`Serving: ${req.method} ${req.url}`);

    const configuration = JSON.parse(fs.readFileSync(path.join(process.env.ROOT, 'configs', 'proxy-config.json'), 'utf8'));
    const endpoint = (configuration.endpoints || []).find(singleEndpoint => req.url.match(new RegExp(`^/${singleEndpoint.name}/`)));

    if (endpoint === undefined) {
      sendError({ res, message: 'NO_ENDPOINT_CONFIGURED' });
      return;
    }

    const endpointName = endpoint.name;
    const reqURL = req.url.replace(new RegExp(`^/${endpoint.name}/`), '/');
    const urlConfiguration = (endpoint.urls || []).find(url => url.enabled && req.method === url.method && url.url.match(reqURL.split('?')[0]));
    const proxy = configuration.proxy.enabled ? configuration.proxy.url : undefined;

    const requestBody = req && req.body;
    const rules = (urlConfiguration && urlConfiguration.rules) || [];
    const newRequestBody = adjustRequest({ requestBody, rules });

    if (urlConfiguration && !urlConfiguration.sendRQ) {
      const adjustedResponse = adjustResponse({
        response: { statusCode: 200 }, requestBody, rules, endpointName,
      });

      setTimeout(() => {
        res.writeHead(adjustedResponse.responseStatusCode, adjustedResponse.responseHeaders);
        res.write(adjustedResponse.responseBody);
        res.end();
      }, (urlConfiguration && urlConfiguration.delay) || 0);

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
      console.log('Forwarding call to ', options.url);
      if (error) {
        console.log(error);
      }

      const adjustedResponse = adjustResponse({
        response, requestBody, rules, endpointName,
      });

      setTimeout(() => {
        res.writeHead(adjustedResponse.responseStatusCode, adjustedResponse.responseHeaders);
        res.write(adjustedResponse.responseBody);
        res.end();
      }, (urlConfiguration && urlConfiguration.delay) || 0);
    });
  });

  return router;
};
