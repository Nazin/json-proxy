import express from 'express';
import configController from './controllers/config';
import proxyController from './proxy-controller/proxy-controller';
import config from '../server-config.json';

export default () => {
  const router = new express.Router();

  if (config.configUI.enabled) {
    router.use(config.configUI.endpoint, configController());
  }

  router.use('/favicon.ico', express.static('./public/images/favicon.ico'));
  router.use('/', proxyController());

  return router;
};
