import { Router } from 'express';
import configController from './config';
import proxyController from './proxy';

export default () => {
  const router = new Router();

  router.use('/config', configController());
  router.use('/', proxyController());

  return router;
};
