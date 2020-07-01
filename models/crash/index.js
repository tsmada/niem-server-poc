import fs from 'fs';
import Ajv from 'ajv';

const ajv = new Ajv();
const rawdata = fs.readFileSync('./models/crash/crash.json');
const Crash = JSON.parse(rawdata);
Crash.validate = function (model) {
  let message;
  try {
    message = ajv.addSchema(Crash, 'crash').validate('crash', model);
  } catch (err) {
    console.log('Model invalid...', message);
    return model;
  }
  return model;
};
export default Crash;
