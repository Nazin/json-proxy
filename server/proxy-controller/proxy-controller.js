const request = require('request');
const express = require('express');
const sendError = require('./sendError');
const adjustRequest = require('./adjustRequest');
const adjustResponse = require('./adjustResponse');
const configManager = require('../config-manager');
const rulesManager = require('../rules-manager');

module.exports = () => {
  const router = new express.Router();

  router.all('*', (req, res) => {
    console.log(`Serving: ${req.method} ${req.url}`);

    const configuration = configManager.getSelectedConfig();
    const endpoint = (configuration.endpoints || []).find(singleEndpoint => req.url.match(new RegExp(`^/${singleEndpoint.name}/`)));

    if (endpoint === undefined) {
      sendError({ res, message: 'NO_ENDPOINT_CONFIGURED' });
      return;
    }

    const endpointName = endpoint.name;
    const reqURL = req.url.replace(new RegExp(`^/${endpoint.name}/`), '/');
    const reqMethod = req.method;
    const urlConfiguration = (endpoint.urls || []).find(url => url.enabled && reqMethod === url.method && url.url.match(reqURL.split('?')[0]));
    const proxy = configuration.proxy.enabled ? configuration.proxy.url : undefined;

    const requestBody = req && req.body;
    const rules = (urlConfiguration && urlConfiguration.rules) || [];
    const funcRules = rulesManager.getRulesForEndpoint(endpointName);
    const newRequestBody = adjustRequest({
      requestBody, rules, funcRules, reqURL, reqMethod,
    });

    if (urlConfiguration && !urlConfiguration.sendRQ) {
      const adjustedResponse = adjustResponse({
        response: { statusCode: 200 }, requestBody, rules, endpointName, funcRules, reqURL, reqMethod,
      });

      if (adjustedResponse.responseBody === undefined) {
        console.warn('Ensure your rules are setup correctly, there is no body to return.');
      }

      setTimeout(() => {
        res.writeHead(adjustedResponse.responseStatusCode, adjustedResponse.responseHeaders);
        res.write(adjustedResponse.responseBody || '{}');
        res.end();
      }, urlConfiguration.delay || 0);

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
        response, requestBody, rules, endpointName, funcRules, reqURL, reqMethod,
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
