import { Router } from 'express';
import configController from './config';
import proxyController from './proxy';
import config from '../../config.json';

export default () => {
  const router = new Router();

  if (config.configUI.enabled) {
    router.use(config.configUI.endpoint, configController());
  }
  router.use('/', proxyController());

  return router;
};
