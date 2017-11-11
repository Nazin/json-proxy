import express from 'express';
import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json({limit: '50mb'}));

export default function startConfigServer() {
  app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
  });

  app.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm();
    let success = true;

    form.uploadDir = path.join(__dirname, '/uploads');

    form.on('file', (field, file) => {
      try {
        if (file.type === 'application/octet-stream') {
          const newConfig = fs.readFileSync(file.path, 'utf8');
          fs.writeFileSync('./config.json', newConfig, 'utf8');
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
      res.redirect(`/?success=${success}`);
    });

    form.parse(req);
  });

  app.post('/update', (req, res) => {
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(req.body, null, 2), 'utf8');
    res.send({status: 'success'});
  });

  app.listen(3006, () => {
    console.log('Proxy config server started, listening at http://localhost:3006');
  });
}
