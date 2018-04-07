const express = require('express');
const configController = require('./config-controller/config-controller');
const proxyController = require('./proxy-controller/proxy-controller');
const controllersManager = require('./controllers-manager');
const configManager = require('./config-manager');
const proxyConfigSchema = require('../proxy-config.schema.json');

module.exports = (serverConfig) => {
  const router = new express.Router();

  if (serverConfig.configUI.enabled) {
    router.use(serverConfig.configUI.endpoint, configController());
  }

  const additionalControllers = controllersManager.getControllers();

  Object.keys(additionalControllers).forEach((path) => {
    router.use(path, additionalControllers[path](configManager, proxyConfigSchema));
  });

  router.use('/favicon.ico', express.static('./public/images/favicon.ico'));
  router.use('/', proxyController());

  return router;
};
