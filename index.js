import path from 'path';
import spdy from 'spdy';
import http from 'http';
import fs from 'fs';
import Server from './server/server';
import defaultServerConfig from './server-config.json';

class JsonProxy {

  constructor(serverConfig = {}) {
    this.serverConfig = Object.assign({}, defaultServerConfig, serverConfig);
    this.createServer();
  }

  createServer() {
    const httpsOptions = {
      key: fs.readFileSync(path.resolve(this.serverConfig.https.key)),
      cert: fs.readFileSync(path.resolve(this.serverConfig.https.cert)),
    };
    this.httpServer = this.serverConfig.https.enabled ? spdy.createServer(httpsOptions, Server) : http.createServer(Server);
  }

  start() {
    this.httpServer.listen(process.env.PORT || this.serverConfig.port, (error) => {
      if (error) {
        return console.error(error);
      }
      const protocol = this.serverConfig.https.enabled ? 'https' : 'http';
      const configurationInfo = this.serverConfig.configUI.enabled ? `Configuration UI available at ${protocol}://localhost:${process.env.PORT || this.serverConfig.port}${this.serverConfig.configUI.endpoint}.` : '';
      return console.log(`Proxy server started, listening at ${protocol}://localhost:${process.env.PORT || this.serverConfig.port}. ${configurationInfo}`);
    });
  }
}

module.exports = JsonProxy;
