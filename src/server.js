import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import controllers from './controllers';

let server;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export function createProxyServer() {
  const app = express();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors({
    origin: (ignored, callback) => callback(null, true),
    credentials: true,
  }));

  server = http.createServer(app);

  app.use(controllers());
}

export function startProxyServer() {
  server.listen(3005, (error) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log('Proxy server started, listening at http://localhost:3005');
    console.log('Configuration UI available at http://localhost:3005/config');
  });
}

export function stopProxyServer() {
  server.close();
}
