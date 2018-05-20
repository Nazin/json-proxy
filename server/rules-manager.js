class RulesManager {
  constructor() {
    this.rules = {};
  }

  addRule(endpointName, func) {
    this.rules[endpointName] = this.rules[endpointName] || [];
    this.rules[endpointName].push(func);
  }

  getRulesForEndpoint(endpointName) {
    return this.rules[endpointName];
  }
}

module.exports = new RulesManager();
