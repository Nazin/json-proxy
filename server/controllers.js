import express from 'express';
import configController from './config-controller/config-controller';
import proxyController from './proxy-controller/proxy-controller';
import serverConfig from '../server-config.json';

export default () => {
  const router = new express.Router();

  if (serverConfig.configUI.enabled) {
    router.use(serverConfig.configUI.endpoint, configController());
  }

  router.use('/favicon.ico', express.static('./public/images/favicon.ico'));
  router.use('/', proxyController());

  return router;
};
