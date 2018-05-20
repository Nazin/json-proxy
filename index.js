const path = require('path');
const spdy = require('spdy');
const http = require('http');
const fs = require('fs');
const Server = require('./server/server');
const defaultServerConfig = require('./server-config.json');
const controllersManager = require('./server/controllers-manager');
const configManager = require('./server/config-manager');
const rulesManager = require('./server/rules-manager');

class JsonProxy {

  constructor(serverConfig = {}) {
    this.serverConfig = Object.assign({}, defaultServerConfig, serverConfig);
    this.controllersManager = controllersManager;
    this.rulesManager = rulesManager;
    handleProxyConfigurations.call(this);
  }

  addController(path, controller) {
    this.controllersManager.addController(path, controller);
  }

  addDynamicRule(endpointName, func) {
    this.rulesManager.addRule(endpointName, func);
  }

  start() {
    this.httpServer || createServer.call(this);
    this.httpServer.listen(process.env.PORT || this.serverConfig.port, (error) => {
      if (error) {
        return console.error(error);
      }
      const protocol = this.serverConfig.https ? 'https' : 'http';
      const configurationInfo = this.serverConfig.configUI.enabled ? `Configuration UI available at ${protocol}://localhost:${process.env.PORT || this.serverConfig.port}${this.serverConfig.configUI.endpoint}.` : '';
      return console.info(`Proxy server started, listening at ${protocol}://localhost:${process.env.PORT || this.serverConfig.port}. ${configurationInfo}`);
    });
  }
}

function createServer() {
  const certificateKeyPath = path.resolve(this.serverConfig.certificates.key);
  const certificatePath = path.resolve(this.serverConfig.certificates.cert);
  const httpsOptions = {
    key: fs.readFileSync(fs.existsSync(certificateKeyPath) ? certificateKeyPath : path.resolve(__dirname, this.serverConfig.certificates.key)),
    cert: fs.readFileSync(fs.existsSync(certificatePath) ? certificatePath : path.resolve(__dirname, this.serverConfig.certificates.cert))
  };
  this.httpServer = this.serverConfig.https ? spdy.createServer(httpsOptions, Server(this.serverConfig)) : http.createServer(Server(this.serverConfig));
}

function handleProxyConfigurations() {
  const configsDirectory = path.resolve(this.serverConfig.configsDirectory);
  configManager.setDirectory(fs.existsSync(configsDirectory) ? configsDirectory : path.resolve(__dirname, this.serverConfig.configsDirectory));
  configManager.updateSelectedConfigName(this.serverConfig.defaultConfigName);
  if (!fs.existsSync(path.join(configManager.directory, this.serverConfig.defaultConfigName))) {
    console.error(`Default proxy configuration file (${this.serverConfig.defaultConfigName}) does not exist!`)
  }
  console.info(`Serving proxy configurations from: ${configManager.directory}`);
}

module.exports = JsonProxy;
