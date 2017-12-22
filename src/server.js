import express from 'express';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import controllers from './controllers';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.set('trust proxy', true);
app.use(compression());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: (ignored, callback) => callback(null, true),
  credentials: true,
}));

app.use(controllers());

export default app;
