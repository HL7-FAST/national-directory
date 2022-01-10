Package.describe({
  name: 'mitre:vhdir-core',
  version: '0.11.1',
  summary: 'Validated Care Coordination Directory',
  // git: 'http://github.com/mitre/vhdir-core',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');

  api.use('meteor@1.9.3');
  api.use('webapp@1.10.0');
  api.use('ddp@1.4.0');
  api.use('livedata@1.0.18');
  api.use('es5-shim@4.8.0');
  api.use('ecmascript@0.15.0');

  api.use('react-meteor-data@2.1.2');
  api.use('session');

  api.use('clinical:hl7-resource-datatypes');
  api.use('clinical:hl7-fhir-data-infrastructure');
  api.use('clinical:vault-server@8.0.1');

  api.addFiles('server/methods.js');
  api.addFiles('server/https.js', 'server');

  api.addAssets('data/nppes/parsed-npi-records-100k.ndjson', 'server');
  api.addAssets('data/lantern/lantern_out.ndjson', 'server');

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  "ndjson-parse": "1.0.4"
})