const fs = require('fs');
const path = require('path');

const CONFIGS_DIR = () => path.join(process.env.ROOT, 'configs');

const selectedConfigName = 'proxy-config.json';

module.exports.updateSelectedConfig = (config) => {
  fs.writeFileSync(path.join(CONFIGS_DIR(), selectedConfigName), JSON.stringify(config, null, 2), 'utf8');
};

module.exports.getSelectedConfig = () => {
  return JSON.parse(fs.readFileSync(path.join(CONFIGS_DIR(), selectedConfigName), 'utf8'));
};
