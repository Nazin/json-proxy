const fs = require('fs');
const path = require('path');

module.exports = function loadFromFile(filePath) {
  let content;
  try {
    const fullFilePath = path.resolve(filePath);
    content = fs.readFileSync(fs.existsSync(fullFilePath) ? fullFilePath : path.resolve(__dirname, filePath), { encoding: 'utf8' });
  } catch (e) {
    console.log('Having problem when reading data file', e);
    content = { status: 'ERROR', message: 'Having problem when reading data file' };
    return content;
  }
  return JSON.parse(content);
};
