const path = require('path');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const controllers = require('./controllers');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.ROOT = path.join('.');

module.exports = (serverConfig) => {
  const app = express();

  const corsConfig = Object.assign({}, serverConfig.cors, {
    origin: (ignored, callback) => callback(null, true),
  });

  app.set('trust proxy', true);
  app.use(compression());

  app.use(bodyParser.json({ limit: serverConfig.bodyParserLimit }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors(corsConfig));

  app.use(controllers(serverConfig));

  return app;
};
