const fs = require('fs');
const path = require('path');

const CONFIGS_DIR = () => path.join(process.env.ROOT, 'configs');

class ConfigManager {

  constructor() {
    this.selectedConfigName = 'proxy-config.json';
  }

  getSelectedConfigName() {
    return this.selectedConfigName;
  }

  updateSelectedConfigName(configName) {
    this.selectedConfigName = configName;
  }

  getSelectedConfig() {
    return JSON.parse(fs.readFileSync(path.join(CONFIGS_DIR(), this.selectedConfigName), 'utf8'));
  }

  updateSelectedConfig(config, configName) {
    this.updateSelectedConfigName(configName);
    fs.writeFileSync(path.join(CONFIGS_DIR(), this.selectedConfigName), JSON.stringify(config, null, 2), 'utf8');
  }

  getAvailableConfigs() {
    return fs.readdirSync(CONFIGS_DIR()) || [];
  }
}

module.exports = new ConfigManager;
