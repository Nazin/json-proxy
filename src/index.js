import http from 'http';
import Server from './server';
import config from '../config.json';

const httpServer = http.createServer(Server);

httpServer.listen(config.port, (error) => {
  if (error) {
    return console.error(error);
  }
  const configurationInfo = config.configUI.enabled ? `Configuration UI available at http://localhost:${config.port}${config.configUI.endpoint}.` : '';
  return console.log(`Proxy server started, listening at http://localhost:${config.port}. ${configurationInfo}`);
});
