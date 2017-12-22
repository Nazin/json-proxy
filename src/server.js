import path from 'path';
import { createProxyServer, startProxyServer } from './proxy';

process.env.ROOT = path.join(__dirname, '/../');

createProxyServer();
startProxyServer();
