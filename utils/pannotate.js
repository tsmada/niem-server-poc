const XLSX = require('xlsx');
const _ = require('lodash');

const facets = XLSX.readFile('Facet.xlsx');
const namespaces = XLSX.readFile('Namespace.xlsx');
const iso = XLSX.readFile('ISO_MR.xlsx');

const wb = XLSX.utils.book_new();

const facetcollection = XLSX.utils.sheet_to_json(facets.Sheets.Sheet1);
const namespacecollection = XLSX.utils.sheet_to_json(namespaces.Sheets.Sheet1);
const isocodes = XLSX.utils.sheet_to_json(iso.Sheets.CodeSetsDefinition);
const isovalues = XLSX.utils.sheet_to_json(iso.Sheets.AllCodeSets);

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

const isoRoot = {
  Domain: 'International Standards Organization',
  ParentDomain: '',
  Description: 'ISO is an independent, non-governmental international organization with a membership of 164 national standards bodies.  Through its members, it brings together experts to share knowledge and develop voluntary, consensus-based, market relevant International Standards that support innovation and provide solutions to global challenges.',
};

const isoCodesDomain = {
  Domain: 'International Standards Organization/Universal Financial Industry Message Scheme',
  ParentDomain: 'International Standards Organization',
};

// Filter out all facets that are not of /type/ enumeration
// Cleanse /TypeName/ and delete CodeSimpleType suffix
// NIEM Specific normalization
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

  outdomain.push(rootDomain, codesetDomain, rootGeoDomain, countryGeoDomain, isoRoot, isoCodesDomain);
  return outdomain;
}

function buildDomainCodeSet(data, pivot, format='NIEM') {
  let domaincodeset = [];
  if (format === 'NIEM') {
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
  else if (format === 'ISO') {
    domaincodeset = data.map((domain) => {
      domain.DomainCodeSet = domain['Code Set'];
      domain.Domain = `International Standards Organization/Universal Financial Industry Message Scheme/${domain['Code Set']}`;
      domain.Description = domain['Code Set Definition']

      delete domain['Code Set']
      delete domain['Code Set Definition']
      delete domain['Status']
      return domain;
    });
    return domaincodeset;
  }
}

function buildDomainCodeSetValue(data, pivot, format='NIEM') {
  if (format === 'NIEM') {
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
  } else if (format === 'ISO') {
    const domaincodesetvalue = data.map((domain) => {
      // console.log('item: ', item)
      domain.Domain = `International Standards Organization/Universal Financial Industry Message Scheme/${domain['Code Set']}`;
      domain.DomainCodeSet = domain['Code Set'];
      domain.DomainCodeValue = domain['Code Value'];
      domain.Description = domain['Code Definition'];

      delete domain['Code Set'];
      delete domain['Code Value'];
      delete domain['Code Name'];
      delete domain['Code Defintiion'];
      delete domain['Requester'];
      delete domain['Status'];
      delete domain['Last Update'];
      delete domain['Creation Date'];
      delete domain['Replaced By'];
      delete domain['MappingStandards 1']
      delete domain['MappingValue 1']
      delete domain['Additional Information']

      return domain;
    });
    return domaincodesetvalue;
  }
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

function buildNiemMasterValues(data) {
  const domaincodeset = data;
  let returndomaincodeset = domaincodeset.filter((code) => {
    if (code.TypeName !== 'CountryAlpha3' || code.TypeName !== 'CountryAlpha2' || code.TypeName !== 'CountryNumeric') {
      return code;
    }
  });

  let ds = returndomaincodeset.map((val) => {
    val.Domain = 'NIEM/External Codesets';
    val.DomainCodeSet = val.TypeName;
    val.DomainCodeValue = val.FacetValue;
    val.MasterValue = titleCase(val.Definition);
    val.MasterValueDomain = 'NIEM/External Codesets';
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

  return ds;
}

function buildISOMasterValues(data) {
  const ds = data.map((val) => {
    // console.log('item: ', item)
    val.Domain = 'International Standards Organization/Universal Financial Industry Message Scheme';
    val.DomainCodeSet = val['Code Set']
    val.DomainCodeValue = val['Code Value']
    val.MasterValue = val['Code Definition']
    val.MasterValueDomain = 'International Standards Organization/Universal Financial Industry Message Scheme';
    val.ActiveDate = '1801-01-01';
    val.ExpiryDate = '2999-12-12';
    val.isPrimary = 'Yes';

    delete val['Code Set'];
    delete val['Code Value'];
    delete val['Code Name'];
    delete val['Code Defintiion'];
    delete val['Requester'];
    delete val['Status'];
    delete val['Last Update'];
    delete val['Creation Date'];
    delete val['Replaced By'];
    delete val['MappingStandards 1']
    delete val['MappingValue 1']
    delete val['Additional Information']

    return val;
  });

  return ds;
}

// NIEM Workbook operations
// Main driver code
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

// ISO Driver Code
const isodomaincodeset = buildDomainCodeSet(isocodes, null, 'ISO');
const isodomaincodesetsheet = XLSX.utils.json_to_sheet(isodomaincodeset);
XLSX.utils.book_append_sheet(wb, isodomaincodesetsheet, 'DomainCodeSet-1');

const isodomaincodesetvalue = buildDomainCodeSetValue(isovalues, null, 'ISO');
const isodomaincodesetvaluesheet = XLSX.utils.json_to_sheet(isodomaincodesetvalue);
XLSX.utils.book_append_sheet(wb, isodomaincodesetvaluesheet, 'DomainCodeSetValue-1');

const fc2 = XLSX.utils.sheet_to_json(facets.Sheets.Sheet1);
const nmastervalues = buildNiemMasterValues(cleanseSourceData(fc2));
const nmastervaluessheet = XLSX.utils.json_to_sheet(nmastervalues);
XLSX.utils.book_append_sheet(wb, nmastervaluessheet, 'MasterValue-1');

const isovalues2 = XLSX.utils.sheet_to_json(iso.Sheets.AllCodeSets);
const imastervalues = buildISOMasterValues(isovalues2);
const imastervaluessheet = XLSX.utils.json_to_sheet(imastervalues);
XLSX.utils.book_append_sheet(wb, imastervaluessheet, 'MasterValue-2');

XLSX.writeFile(wb, 'out.xlsx');
