const path = require('path');
const spdy = require('spdy');
const http = require('http');
const fs = require('fs');
const Server = require('./server/server');
const defaultServerConfig = require('./server-config.json');
const controllersManager = require('./server/controllers-manager');

class JsonProxy {

  constructor(serverConfig = {}) {
    this.serverConfig = Object.assign({}, defaultServerConfig, serverConfig);
    this.controllersManager = controllersManager;
  }

  createServer() {
    const httpsOptions = {
      key: fs.readFileSync(path.resolve(this.serverConfig.https.key)),
      cert: fs.readFileSync(path.resolve(this.serverConfig.https.cert)),
    };
    this.httpServer = this.serverConfig.https.enabled ? spdy.createServer(httpsOptions, Server()) : http.createServer(Server());
  }

  addController(path, controller) {
    this.controllersManager.addController(path, controller);
  }

  start() {
    this.httpServer || this.createServer();
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
