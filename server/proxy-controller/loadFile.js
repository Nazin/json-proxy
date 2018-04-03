const fs = require('fs');
const path = require('path');

module.exports = function loadFromFile(filePath) {
  console.log('File path: ', filePath);
  let content;
  if (!filePath) {
    content = { status: 'ERROR', message: 'Missing responseFilePath' };
    return content;
  }
  try {
    const fullFilePath = path.join(process.env.ROOT, filePath);
    content = fs.readFileSync(fullFilePath, { encoding: 'utf8' });
  } catch (e) {
    console.log('Having problem when reading data file', e);
    content = { status: 'ERROR', message: 'Having problem when reading data file' };
    console.log('content type of content', typeof content);
    return content;
  }
  return JSON.parse(content);
};
