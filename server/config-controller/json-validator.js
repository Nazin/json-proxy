const Ajv = require('ajv');

const ajv = new Ajv();

module.exports = function isProperJSON(data, schema) {
  try {
    return ajv.validate(schema, data);
  } catch (e) {
    return false;
  }
};
