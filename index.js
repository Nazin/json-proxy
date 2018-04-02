import path from 'path';
import spdy from 'spdy';
import http from 'http';
import fs from 'fs';
import Server from './server/server';
import serverConfig from './server-config.json';

const options = {
  key: fs.readFileSync(path.join('.', 'certificates', 'server.key')),
  cert: fs.readFileSync(path.join('.', 'certificates', 'server.crt')),
};

const httpServer = serverConfig.https ? spdy.createServer(options, Server) : http.createServer(Server);

httpServer.listen(process.env.PORT || serverConfig.port, (error) => {
  if (error) {
    return console.error(error);
  }
  const protocol = serverConfig.https ? 'https' : 'http';
  const configurationInfo = serverConfig.configUI.enabled ? `Configuration UI available at ${protocol}://localhost:${process.env.PORT || serverConfig.port}${serverConfig.configUI.endpoint}.` : '';
  return console.log(`Proxy server started, listening at ${protocol}://localhost:${process.env.PORT || serverConfig.port}. ${configurationInfo}`);
});
