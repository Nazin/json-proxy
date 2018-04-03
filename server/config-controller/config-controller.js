const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const express = require('express');
const isProperJSON = require('./json-validator');
const configManager = require('../config-manager');

module.exports = () => {
  const router = new express.Router();
  const configSchemaJSONLocation = path.join(process.env.ROOT, 'proxy-config.schema.json');
  const configSchema = JSON.parse(fs.readFileSync(configSchemaJSONLocation, 'utf8'));

  router.use(express.static(path.join(process.env.ROOT, 'public')));
  router.use(express.static(path.join(process.env.ROOT, 'node_modules', 'jsoneditor', 'dist')));

  router.get('/config.json', (req, res) => {
    res.send(configManager.getSelectedConfig());
  });

  router.get('/config.schema.json', (req, res) => {
    res.send(configSchema);
  });

  router.post('/', (req, res) => {
    const form = new formidable.IncomingForm();
    let success = true;

    form.uploadDir = path.join(process.env.ROOT, '/uploads');

    form.on('file', (field, file) => {
      try {
        if (file.type === 'application/octet-stream') {
          const newConfig = fs.readFileSync(file.path, 'utf8');
          if (isProperJSON(JSON.parse(newConfig), configSchema)) {
            configManager.updateSelectedConfig(newConfig);
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

  router.post('/update', (req, res) => {
    if (isProperJSON(req.body, configSchema)) {
      configManager.updateSelectedConfig(req.body);
      res.send({ status: 'success' });
    } else {
      res.send({ status: 'failure' });
    }
  });

  return router;
};
