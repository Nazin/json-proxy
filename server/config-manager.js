import fs from 'fs';
import path from 'path';

const CONFIGS_DIR = () => path.join(process.env.ROOT, 'configs');

const selectedConfigName = 'proxy-config.json';

export function updateSelectedConfig(config) {
  fs.writeFileSync(path.join(CONFIGS_DIR(), selectedConfigName), JSON.stringify(config, null, 2), 'utf8');
}

export function getSelectedConfig() {
  return JSON.parse(fs.readFileSync(path.join(CONFIGS_DIR(), selectedConfigName), 'utf8'));
}
