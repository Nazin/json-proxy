import Ajv from 'ajv';

const ajv = new Ajv();

export default function isProperJSON(data, schema) {
  try {
    return ajv.validate(schema, data);
  } catch (e) {
    return false;
  }
}
