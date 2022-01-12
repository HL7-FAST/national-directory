
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { get, has } from 'lodash';

import forge from 'node-forge';

let pki = forge.pki;
import jwt from 'jsonwebtoken';

import ndjsonParser from 'ndjson-parse';

import { Endpoints } from 'meteor/clinical:hl7-fhir-data-infrastructure';


Meteor.methods({
    generateCertificate: function(){
        console.log("Generate certificate...")

        let privateKeyPem = get(Meteor, 'settings.private.x509.privateKey');
        let publicKeyPem = get(Meteor, 'settings.private.x509.publicKey');

        let privateKey = pki.privateKeyFromPem(privateKeyPem)
        let publicKey = pki.publicKeyFromPem(publicKeyPem)

        var certificatePem = "";

        if(privateKey){
            console.log('privateKey', privateKey)
            console.log('publicKey', publicKey)

            let cert = pki.createCertificate();

            cert.publicKey = publicKey;
            cert.serialNumber = '01';
            cert.validity.notBefore = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

            var attrs = [{
                name: 'commonName',
                value: 'mitre.org'
                }, {
                name: 'countryName',
                value: 'US'
                }, {
                shortName: 'ST',
                value: 'Illinois'
                }, {
                name: 'localityName',
                value: 'Chicago'
                }, {
                name: 'organizationName',
                value: 'MITRE'
                }, {
                shortName: 'OU',
                value: 'MITRE'
            }];
            // cert.setSubject(attrs);
            cert.setIssuer(attrs);
            cert.sign(privateKey);

            console.log('cert', cert);

            certificatePem = pki.certificateToPem(cert);
            console.log('certificatePem', certificatePem)
        }

        return certificatePem;
    },
    generateAndSignJwt: function(jwtPayload){
        console.log("Signing certificate...")
        console.log('jwtPayload', jwtPayload);

        let result = {};

        let privateKeyPem = get(Meteor, 'settings.private.x509.publicCertPem');
        console.log('privateKeyPem', privateKeyPem)            

        jwt.sign(jwtPayload, privateKeyPem.trim(), {
            algorithm: 'RS256',
        }, function(error, token){
            if(error){
                console.log('error', error)
            }
            if(token){
                console.log('token', token)
                result.token = token;
            }
        });

        return result;
    },
    hasServerKeys: function(){
        let result = {
            x509: {
                privateKey: false,
                publicKey: false,
                publicCert: false,
                publicCertPem: false
            }
        }

        if(get(Meteor, 'settings.private.x509.privateKey')){
            result.x509.privateKey = true;
        }
        if(get(Meteor, 'settings.private.x509.publicKey')){
            result.x509.publicKey = get(Meteor, 'settings.private.x509.publicKey');
        }
        if(get(Meteor, 'settings.private.x509.publicCertPem')){
            result.x509.publicCertPem = get(Meteor, 'settings.private.x509.publicCertPem');
        }

        return result;
    },
    syncLantern: function(){
        console.log("Scanning lantern file...");

        let fileContents = Assets.getText('data/lantern/lantern_out.ndjson');
        console.log('data/lantern/lantern_out.ndjson')
        console.log(fileContents);

        const parsedNdjson = ndjsonParser(fileContents);

        if(Array.isArray(parsedNdjson)){
            parsedNdjson.forEach(function(fhirResource){
                // console.log(get(fhirResource, 'resourceType'));
                if(get(fhirResource, 'resourceType') === "Endpoint"){
                    Endpoints.insert(fhirResource)
                }
            });
        }
        console.log('Upload completed!')
        console.log("Endpoints count: " + Endpoints.find().count())
        
    },
    syncProviderDirectory: function(){
        console.log("Scanning provider directory file...")

        let fileContents = Assets.getText('data/nppes/parsed-npi-records-100k.ndjson');
        console.log('data/nppes/parsed-npi-records-100k.ndjson')
        console.log(fileContents);

        const parsedNdjson = ndjsonParser(fileContents);

        if(Array.isArray(parsedNdjson)){
            parsedNdjson.forEach(function(fhirResource){
                //console.log(get(fhirResource, 'resourceType'));
                if(get(fhirResource, 'resourceType') === "Organization"){
                    if(!Organizations.findOne({"name": get(fhirResource, "name")})){
                        Organizations.insert(fhirResource)
                    }
                } else if(get(fhirResource, 'resourceType') === "Practitioner"){
                    let name = get(fhirResource, 'name[0].text');
                    //console.log(name);
                    if(!Practitioners.findOne({"name.0.text": name})){
                        Practitioners.insert(fhirResource, {filter: false, validate: false})
                    }

                }
            });
        }
    },
    syncUpstreamDirectory: function(){

        let directoryUrl = get(Meteor, 'settings.public.interfaces.upstreamDirectory.channel.endpoint');

        let validationSyncUrl = directoryUrl + '/Endpoint';
        console.log("validationSyncUrl", validationSyncUrl);

        
        HTTP.get(validationSyncUrl, function(error, result){
            if(error){
      
            }
            if(result){
              // console.log('result', result)
              let parsedData = JSON.parse(result.content);
            //   console.log('parsedData', parsedData)
              console.log('Received ' + get(parsedData, 'total') + ' records.')
      
              if(get(parsedData, 'resourceType') === "Bundle"){
                if(Array.isArray(parsedData.entry)){
                  parsedData.entry.forEach(function(entry, index){
                    if(get(entry, 'resourceType') === "Endpoint"){
                      // console.log("Endpoint " + index)
                      if(has(entry, 'id')){
                        if(!Endpoints.findOne({id: entry.id})){
                            Endpoints.insert(entry);
                          }      
                      } else {
                        if(!has(entry, 'id')){
                            entry.id = Random.id();
                          }
                          Endpoints.insert(entry);
                      }
                    }
                  })
                }
              }
            }
          })
    }
})