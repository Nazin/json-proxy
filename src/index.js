import path from 'path';
import { createProxyServer, startProxyServer } from './server';

process.env.ROOT = path.join(__dirname, '/../');

createProxyServer();
startProxyServer();
