const fs = require('fs');
const path = require('path');

class ConfigManager {
  getSelectedConfigName() {
    return this.selectedConfigName;
  }

  updateSelectedConfigName(configName) {
    this.selectedConfigName = configName;
  }

  getSelectedConfig() {
    return JSON.parse(fs.readFileSync(path.join(this.directory, this.selectedConfigName), 'utf8'));
  }

  updateSelectedConfig(config, configName) {
    this.updateSelectedConfigName(configName);
    fs.writeFileSync(path.join(this.directory, this.selectedConfigName), JSON.stringify(config, null, 2), 'utf8');
  }

  getAvailableConfigs() {
    return fs.readdirSync(this.directory) || [];
  }

  setDirectory(directory) {
    this.directory = directory;
  }
}

module.exports = new ConfigManager;
