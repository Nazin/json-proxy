const fs = require('fs');
const path = require('path');
const os = require('os');
const formidable = require('formidable');
const express = require('express');
const _ = require('lodash');
const isProperJSON = require('./json-validator');
const configManager = require('../config-manager');
const proxyConfigSchema = require('../../proxy-config.schema.json');

module.exports = () => {
  const router = new express.Router();

  router.use(express.static(path.join(process.env.ROOT, 'public')));
  router.use(express.static(path.join(process.env.ROOT, process.env.ROOT.match('node_modules') === null ? 'node_modules' : '..', 'jsoneditor', 'dist')));

  router.get('/config.json', (req, res) => {
    res.send(configManager.getSelectedConfig());
  });

  router.get('/config.schema.json', (req, res) => {
    res.send(proxyConfigSchema);
  });

  router.get('/configs', (req, res) => {
    res.status(200).send({ files: configManager.getAvailableConfigs(), selectedConfig: configManager.getSelectedConfigName() });
  });

  router.post('/configs', (req, res) => {
    configManager.updateSelectedConfigName(req.body.selectedConfig);
    res.send(configManager.getSelectedConfig());
  });

  router.post('/', (req, res) => {
    const form = new formidable.IncomingForm();
    let success = true;

    form.uploadDir = os.tmpdir();

    form.on('file', (field, file) => {
      try {
        if (file.type === 'application/octet-stream') {
          const newConfig = fs.readFileSync(file.path, 'utf8');
          if (isProperJSON(JSON.parse(newConfig), proxyConfigSchema)) {
            configManager.updateSelectedConfig(newConfig, file.name.includes('.json') ? _.snakeCase(file.name) : `${_.snakeCase(_.first(_.split(file.name, '.')))}.json`);
          } else {
            success = false;
          }
        } else {
          success = false;
        }
      } catch (e) {
        success = false;
      }
      fs.unlinkSync(file.path);
    });

    form.on('error', (err) => {
      console.log(`An error has occured: \n${err}`);
      success = false;
    });

    form.on('end', () => {
      res.redirect(`?success=${success}`);
    });

    form.parse(req);
  });

  router.put('/', (req, res) => {
    if (isProperJSON(req.body, proxyConfigSchema)) {
      configManager.updateSelectedConfig(req.body, configManager.getSelectedConfigName());
      res.send({ status: 'success' });
    } else {
      res.send({ status: 'failure' });
    }
  });

  return router;
};
