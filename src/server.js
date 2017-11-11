import { createProxyServer, startProxyServer } from './proxy';
import startConfigServer from './config';

createProxyServer();
startProxyServer();
startConfigServer();
