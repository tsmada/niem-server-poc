const data = require('data.js');
const XLSX = require('xlsx');
const _ = require('lodash');
const fs = require('fs');

const codesets = ['https://datahub.io/core/airport-codes/datapackage.json',
  'https://datahub.io/core/s-and-p-500-companies/datapackage.json',
  'https://datahub.io/core/country-list/datapackage.json',
  'https://datahub.io/core/language-codes/datapackage.json',
  'https://datahub.io/core/world-cities/datapackage.json',
  'https://datahub.io/core/country-codes/datapackage.json',
  'https://datahub.io/core/smdg-master-terminal-facilities-list/datapackage.json',
  'https://datahub.io/core/imo-imdg-codes/datapackage.json',
  'https://datahub.io/core/geoip2-ipv4/datapackage.json',
  'https://datahub.io/core/top-level-domain-names/datapackage.json',
  'https://datahub.io/core/cofog/datapackage.json',
  'https://datahub.io/core/unece-package-codes/datapackage.json',
  'https://datahub.io/core/unece-units-of-measure/datapackage.json',
  'https://datahub.io/core/un-locode/datapackage.json',
  'https://datahub.io/core/membership-to-copyright-treaties/datapackage.json',
  'https://datahub.io/core/fips-10-4/datapackage.json',
  'https://datahub.io/core/media-types/datapackage.json',
  'https://datahub.io/core/iso-container-codes/datapackage.json',
  'https://datahub.io/core/dac-and-crs-code-lists/datapackage.json',
  'https://datahub.io/core/uk-sic-2007-condensed/datapackage.json',
  'https://datahub.io/core/s-and-p-500-companies-financials/datapackage.json',
  'https://datahub.io/core/nyse-other-listings/datapackage.json',
  'https://datahub.io/core/nasdaq-listings/datapackage.json',
];

function appendSheet(workbook, data, sheetname) {
  XLSX.utils.book_append_sheet(workbook, data, sheetname);
  return workbook;
}

function createWorkbook() {
  const wb = XLSX.utils.book_new();
  return wb;
}

function saveWorkbook(workbook, name) {
  return XLSX.writeFile(workbook, name);
}

async function retrieveData(path) {
  const datas = [];
  const dataset = await data.Dataset.load(codesets[path]);
  // get all tabular data(if exists any)
  for (const id in dataset.resources) {
    if (dataset.resources[id]._descriptor.format === 'csv') {
      const file = dataset.resources[id];
      let { name } = dataset.resources[id]._descriptor;
      const { fields } = dataset.resources[id]._descriptor.schema;

      const buffer = await file.buffer;
      const dir = './tmp';

      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      fs.writeFile(`./tmp/${name}.csv`, buffer, (err) => {
        if (err) return console.log(err);
      });
      if (name.length >= 29) {
        name = name.slice(0, 29);
      }
      datas.push(fields);
    }
  }

  return datas;
}

async function main() {
  const workbook = createWorkbook();
  for (const path in codesets) {
    const datas = await retrieveData(path);
  }
  // appendSheet(workbook, sheet, 'DomainCodeSets');
  // saveWorkbook(workbook, 'workbooktest.xlsx');
}

main();
