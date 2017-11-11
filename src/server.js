import path from 'path';
import { createProxyServer, startProxyServer } from './proxy';
import startConfigServer from './config';

process.env.ROOT = path.join(__dirname, '/../');

createProxyServer();
startProxyServer();
startConfigServer();
