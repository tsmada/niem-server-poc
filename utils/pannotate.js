const XLSX = require('xlsx');
const _ = require('lodash');

const facets = XLSX.readFile('Facet.xlsx');
const namespaces = XLSX.readFile('Namespace.xlsx');

const wb = XLSX.utils.book_new();

const facetcollection = XLSX.utils.sheet_to_json(facets.Sheets.Sheet1);
const namespacecollection = XLSX.utils.sheet_to_json(namespaces.Sheets.Sheet1);

const rootDomain = {
  Domain: 'NIEM',
  Description: 'National Information Exchange Model',
  ParentDomain: '',
};

const codesetDomain = {
  Domain: 'NIEM/External Codesets',
  Description: 'National Information Exchange Model Codesets',
  ParentDomain: 'NIEM',
};

const rootGeoDomain = {
  Domain: 'Geography',
};

const countryGeoDomain = {
  Domain: 'Geography/Country',
  ParentDomain: 'Geography',
};

// Filter out all facets that are not of /type/ enumeration
// Cleanse /TypeName/ and delete CodeSimpleType suffix
function cleanseSourceData(data) {
  const cleansed = data.filter((val) => {
    if (val.FacetName === 'enumeration') {
      val.TypeName = val.TypeName.replace('CodeSimpleType', '');
      return val;
    }
  });

  return cleansed;
}

function buildDomain(data, pivot) {
  const domain = _.uniqBy(data, (v) => v.TypeNamespacePrefix);
  const outdomain = domain.map((dom) => {
    const item = pivot.filter((val) => val.NamespacePrefix === dom.TypeNamespacePrefix)[0];

    dom.Definition = item.Definition;
    dom.Domain = `NIEM/External Codesets/${dom.Definition}`;
    dom.ParentDomain = 'NIEM/External Codesets';

    delete dom.TypeNamespacePrefix;
    delete dom.TypeName;
    delete dom.QualifiedType;
    delete dom.FacetName;
    delete dom.FacetValue;
    delete dom.Definition;

    return dom;
  });

  outdomain.push(rootDomain, codesetDomain, rootGeoDomain, countryGeoDomain);
  return outdomain;
}

function buildDomainCodeSet(data, pivot) {
  let domaincodeset;
  const unique = _.uniqBy(cleanseSourceData(data), (v) => [v.TypeNamespacePrefix, v.TypeName].join());

  domaincodeset = unique.map((domain) => {
    domain.DomainCodeSet = domain.TypeName;
    const item = pivot.filter((val1) => domain.TypeNamespacePrefix === val1.NamespacePrefix)[0];
    domain.Domain = `NIEM/External Codesets/${item.Definition}`;

    delete domain.TypeNamespacePrefix;
    delete domain.TypeName;
    delete domain.FacetValue;
    delete domain.QualifiedType;
    delete domain.FacetName;
    delete domain.Definition;
    return domain;
  });
  return domaincodeset;
}

function buildDomainCodeSetValue(data, pivot) {
  const domaincodesetvalue = cleanseSourceData(data).map((domain) => {
    const item = pivot.filter((val1) => domain.TypeNamespacePrefix === val1.NamespacePrefix)[0];
    // console.log('item: ', item)
    if (item) {
      domain.Domain = `NIEM/External Codesets/${item.Definition}`;
    }
    domain.DomainCodeSet = domain.TypeName;
    domain.DomainCodeValue = domain.FacetValue;
    domain.Description = domain.Definition;

    delete domain.Definition;
    delete domain.TypeNamespacePrefix;
    delete domain.ParentDomain;
    delete domain.QualifiedType;
    delete domain.FacetName;
    delete domain.FacetValue;
    delete domain.TypeName;

    return domain;
  });
  return domaincodesetvalue;
}

function buildMasterValue() {
  return mastervalue;
}

function truncateDescription(desc) {
  const truncated = desc;
  return truncated;
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map((word) => (word.charAt(0).toUpperCase() + word.slice(1))).join(' ');
}

function buildCountryMasterValues(data, pivot) {
  const domaincodeset = data;
  let returndomaincodeset = domaincodeset.filter((code) => {
    if (code.TypeName === 'CountryAlpha3' || code.TypeName === 'CountryAlpha2' || code.TypeName === 'CountryNumeric') {
      return code;
    }
  });

  const unique = _.uniqBy(returndomaincodeset, (v) => (v.FacetValue));
  returndomaincodeset = unique.map((val) => {
    val.Domain = 'Geography/Country';
    val.DomainCodeSet = val.TypeName;
    val.DomainCodeValue = val.FacetValue;
    val.MasterValue = titleCase(val.Definition);
    val.MasterValueDomain = 'Geography/Country';
    val.ActiveDate = '1801-01-01';
    val.ExpiryDate = '2999-12-12';
    val.isPrimary = 'Yes';

    delete val.TypeNamespacePrefix;
    delete val.TypeName;
    delete val.QualifiedType;
    delete val.FacetName;
    delete val.FacetValue;
    delete val.Definition;

    return val;
  });

  return returndomaincodeset;
}

const domain = buildDomain(facetcollection, namespacecollection);
const domainsheet = XLSX.utils.json_to_sheet(domain);
XLSX.utils.book_append_sheet(wb, domainsheet, 'Domain');

const domaincodeset = buildDomainCodeSet(facetcollection, namespacecollection);
const domaincodesetsheet = XLSX.utils.json_to_sheet(domaincodeset);
XLSX.utils.book_append_sheet(wb, domaincodesetsheet, 'DomainCodeSet');

const domaincodesetvalue = buildDomainCodeSetValue(facetcollection, namespacecollection);
const domaincodesetvaluesheet = XLSX.utils.json_to_sheet(domaincodesetvalue);
XLSX.utils.book_append_sheet(wb, domaincodesetvaluesheet, 'DomainCodeSetValue');

const fc1 = XLSX.utils.sheet_to_json(facets.Sheets.Sheet1);

const mastervalues = buildCountryMasterValues(cleanseSourceData(fc1), namespacecollection);
const mastervaluessheet = XLSX.utils.json_to_sheet(mastervalues);
XLSX.utils.book_append_sheet(wb, mastervaluessheet, 'MasterValue');

XLSX.writeFile(wb, 'out.xlsx');
