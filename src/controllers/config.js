import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import express from 'express';

export default () => {
  const router = new express.Router();
  const configJSONLocation = path.join(process.env.ROOT, 'src', 'config.json');

  router.use(express.static(path.join(process.env.ROOT, 'public')));

  router.get('/config.json', (req, res) => {
    res.sendFile(configJSONLocation);
  });

  router.post('/', (req, res) => {
    const form = new formidable.IncomingForm();
    let success = true;

    form.uploadDir = path.join(process.env.ROOT, '/uploads');

    form.on('file', (field, file) => {
      try {
        if (file.type === 'application/octet-stream') {
          const newConfig = fs.readFileSync(file.path, 'utf8');
          fs.writeFileSync(configJSONLocation, newConfig, 'utf8');
        } else {
          success = false;
        }
      } catch (e) {
        success = false;
      }
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
    fs.writeFileSync(configJSONLocation, JSON.stringify(req.body, null, 2), 'utf8');
    res.send({ status: 'success' });
  });

  return router;
};
