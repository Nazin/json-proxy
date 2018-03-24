import express from 'express';
import configController from './config';
import proxyController from './proxy';
import config from '../../server-config.json';

export default () => {
  const router = new express.Router();

  if (config.configUI.enabled) {
    router.use(config.configUI.endpoint, configController());
  }

  router.use('/favicon.ico', express.static('./public/images/favicon.ico'));
  router.use('/', proxyController());

  return router;
};
