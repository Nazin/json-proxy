import http from 'http';
import Server from './server/server';
import serverConfig from './server-config.json';

const httpServer = http.createServer(Server);

httpServer.listen(serverConfig.port, (error) => {
  if (error) {
    return console.error(error);
  }
  const configurationInfo = serverConfig.configUI.enabled ? `Configuration UI available at http://localhost:${serverConfig.port}${serverConfig.configUI.endpoint}.` : '';
  return console.log(`Proxy server started, listening at http://localhost:${serverConfig.port}. ${configurationInfo}`);
});
