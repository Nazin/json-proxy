class ControllersManager {
  constructor() {
    this.controllers = {};
  }

  addController(path, controller) {
    this.controllers[path] = controller;
  }

  getControllers() {
    return this.controllers;
  }
}

module.exports = new ControllersManager();
