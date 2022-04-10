## VhDir  


#### Installation  

```bash
# fetch boilerplate
git clone https://github.com/clinical-meteor/node-on-fhir

cd packages
git clone https://github.com/clinical-meteor/national-directory
cd ..

# install dependencies
meteor npm install

# run the app; make sure it compiles
meteor run 

# run the FHIR server without the National Directory module
meteor add clinical:vault-server
meteor run --settings packages/vault-server/configs/settings.fhir.server.json

# test API endpoints
curl http://localhost:3000/baseR4/metadata
curl http://localhost:3000/baseR4/Patient

# run the app with custom settings file
meteor add mitre:national-directory   
meteor run --settings packages/national-directory/configs/settings.vhdir.json
```