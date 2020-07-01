import fs from 'fs';

let rawdata = fs.readFileSync('./models/crash/crash.json');
const Crash = JSON.parse(rawdata)
Crash.validate = function(model) {
  console.log('Model: ', model);
  return model
}
export default Crash;
