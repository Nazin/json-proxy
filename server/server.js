import path from 'path';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import serverConfig from '../server-config.json';
import controllers from './controllers';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.ROOT = path.join(__dirname, '..');

const app = express();

const corsConfig = Object.assign({}, serverConfig.cors, {
  origin: (ignored, callback) => callback(null, true),
});

app.set('trust proxy', true);
app.use(compression());

app.use(bodyParser.json({ limit: serverConfig.bodyParserLimit }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsConfig));

app.use(controllers());

export default app;
