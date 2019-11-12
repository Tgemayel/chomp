const stringify = require('csv-stringify');
const fs = require('fs');
const axios = require('axios').default;

const domainFilePath = 'domains.csv';
const resultPath = 'result.csv';

let domainIndex = 0;


let domainsArray = fs.readFileSync(domainFilePath).toString().split("\r\n");
// let domainData = [];
// domainsArray = ['writeleelawrite.com'];
loadDomainInfo();

function loadDomainInfo() {
  statusLog();
  const domain = domainsArray[domainIndex];
  axios.get('https://company.clearbit.com/v2/companies/find?domain='+domain, {auth: {
    username: '',
    password: ''
  }})
  .then(function (response) {
    // handle success
    // console.log(response);
    // console.log('response.data:', response.data);
    console.log('api success:', domain);
    const name = response.data.name;
    const tags = response.data.tags;
    const description = processString(response.data.description);
    const facebook_handle = response.data.facebook.handle;
    const employees = response.data.metrics.employees;
    const type = response.data.type;
    const entry = { domain, name, tags: tags.join(','), description, facebook_handle, employees, type };
    // domainData.push(entry);
    console.log('entry:', entry);
    stringify([entry], {header:false}, function(err, data) {
      if (!err) {
        fs.writeFileSync(resultPath, data, {flag: 'a+'});
      } else {
        console.log('stringify fail:', domain);
        fs.writeFileSync(resultPath, domain+"\n", {flag: 'a+'});
      }
      domainIndex++;
      if (domainIndex === domainsArray.length) {
        exitApp();
      }
      loadDomainInfo();
    });
  })
  .catch(function (error) {
    // const entry = {domain};
    // domainData.push(entry);
    fs.writeFileSync(resultPath, domain+"\n", {flag: 'a+'});
    domainIndex++;
    if (domainIndex === domainsArray.length) {
      exitApp();
    }
    loadDomainInfo();
    console.log('api error:', error);
  })
}

function statusLog() {
  console.log('domainIndex:', domainIndex);
  console.log('domain:', domainsArray[domainIndex]);
}

function processString(str) {
  let s = str.replace(/\r\n/g, ',');
  s = s.replace(/\r/g, ',');
  s = s.replace(/\n/g, ',');
  // str.replace(/blue/g, "red");
  return s;
}

function exitApp() {
  console.log('Done!!!!!');
  process.exit(1);
}
