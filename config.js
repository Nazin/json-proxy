const express = require('express');
const app = express();
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

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
        let newConfig = fs.readFileSync(file.path, 'utf8');
        JSON.parse(newConfig);
        fs.writeFileSync('./config.json', newConfig, 'utf8');
      } else {
        success = false;
      }
    } catch (e) {
      success = false;
    }
  });

  form.on('error', (err) => {
    console.log('An error has occured: \n' + err);
    success = false;
  });

  form.on('end', () => {
    res.redirect('/?success=' + success);
  });

  form.parse(req);
});

app.listen(3006, () => {
  console.log('Server listening on port 3006');
});
