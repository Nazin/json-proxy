import path from 'path';
import http from 'http';
import Server from './server';

process.env.ROOT = path.join(__dirname, '/../');

const httpServer = http.createServer(Server);

httpServer.listen(3005, (error) => {
  if (error) {
    return console.error(error);
  }
  return console.log('Proxy server started, listening at http://localhost:3005. Configuration UI available at http://localhost:3005/config.');
});
