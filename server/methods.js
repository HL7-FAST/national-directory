
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { HTTP } from 'meteor/http';
import { get, has } from 'lodash';

import forge from 'node-forge';

let pki = forge.pki;
import jwt from 'jsonwebtoken';

import ndjsonParser from 'ndjson-parse';

import { CodeSystems, Endpoints, Organizations, SearchParameters, StructureDefinitions, ValueSets } from 'meteor/clinical:hl7-fhir-data-infrastructure';
import { UsCoreMethods } from 'meteor/clinical:uscore';


Meteor.methods({
    initUsCore: function(){
        console.log("Initializing US Core...");
        UsCoreMethods.initializeValueSets();
    },
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

        let privateKeyPem = get(Meteor, 'settings.private.x509.privateKey');
        console.log('privateKeyPem')   
        console.log(privateKeyPem)            

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
                    if(!has(fhirResource, 'id')){
                        fhirResource.id = Random.id();
                      }
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
    syncUpstreamDirectory: function(options){
        console.log("Syncing upstream directory....");

        let directoryUrl = get(Meteor, 'settings.public.interfaces.upstreamDirectory.channel.endpoint');


        let responseUrl = Meteor.absoluteUrl() + 'baseR4/Subscription';
        console.log("responseUrl", responseUrl);


        let subscriptionQuery = {};
        console.log('subscriptionQuery', subscriptionQuery);

        let payload = {
            "resourceType" : "Subscription",
            "id" : Random.id(),
            "status" : "active",
            "reason" : "Back-end subscription to updates in the Organization collection for the HL7 connectathon federated directory demo.",
            "criteria" : JSON.stringify(subscriptionQuery),
            "channel" : {
              "type" : "rest-hook",
              "endpoint" : responseUrl
            }
        };

        console.log('payload', payload);

        let subscriptionUrl = directoryUrl + '/Subscription/' + get(payload, 'id');
        console.log("subscriptionUrl", subscriptionUrl);


        HTTP.put(subscriptionUrl , {
            data: payload
        }, function(error, result){
            if(error) { console.log('error', error)}
            if(result) { console.log('result', result)}
        })
        
        // HTTP.get(endpointUrl, function(error, result){
        //     if(error){
      
        //     }
        //     if(result){
        //       // console.log('result', result)
        //       let parsedData = JSON.parse(result.content);
        //     //   console.log('parsedData', parsedData)
        //       console.log('Received ' + get(parsedData, 'total') + ' records.')
      
        //       if(get(parsedData, 'resourceType') === "Bundle"){
        //         if(Array.isArray(parsedData.entry)){
        //           parsedData.entry.forEach(function(entry, index){
        //             if(get(entry, 'resourceType') === "Endpoint"){
        //               // console.log("Endpoint " + index)
        //               if(has(entry, 'id')){
        //                 if(!Endpoints.findOne({id: entry.id})){
        //                     Endpoints.insert(entry);
        //                   }      
        //               } else {
        //                 if(!has(entry, 'id')){
        //                     entry.id = Random.id();
        //                   }
        //                   Endpoints.insert(entry);
        //               }
        //             }
        //           })
        //         }
        //       }
        //     }
        // })


    },
    initCodeSystems: function(){
        console.log("Initializing code systems....");

        let accessibility = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-accessibility.json'));
        let consent = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-consent.json'));
        let credentialstatus = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-credentialstatus.json'));
        let digitalcertificate = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-digitalcertificate.json'));
        let ehrcharacteristics = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-ehrcharacteristics.json'));
        let healthcareServiceCharacteristic = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-healthcareservice-characteristic.json'));
        let healthcareServiceEligibility = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-healthcareservice-eligibility.json'));
        let insuranceplan = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-insuranceplan.json'));
        let languageproficiency = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-languageproficiency.json'));
        let networkType = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-network-type.json'));
        let organizationDemographics = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-organizationdemographics.json'));
        let payerCharacteristics = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-payercharacteristics.json'));
        let primarySource = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-primarysource.json'));
        let usecase = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-usecase.json'));
        let validation = JSON.parse(Assets.getText('data/vhdir-definitions/CodeSystem-validation.json'));
        
        let codeSystemsArray = [
            accessibility,
            consent,
            credentialstatus,
            digitalcertificate,
            ehrcharacteristics,
            healthcareServiceCharacteristic,
            healthcareServiceEligibility,
            insuranceplan,
            languageproficiency,
            networkType,
            organizationDemographics,
            payerCharacteristics,
            primarySource,
            usecase,
            validation
        ];

        codeSystemsArray.forEach(function(codeSystem){
            if(get(codeSystem, 'resourceType') === "CodeSystem"){
                if(!CodeSystems.findOne({id: get(codeSystem, 'id')})){
                    CodeSystems.insert(codeSystem)
                }
            }
        })

    },
    initSearchParameters: function(){
        console.log("Init search parameters....");

        let careteamCategory = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-category.json'));
        let careteamEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-endpoint.json'));
        let careteamIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-identifier-assigner.json'));
        let careteamIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-identifier.json'));
        let careteamLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-location.json'));
        let careteamName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-name.json'));
        let careteamOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-organization.json'));
        let careteamParticipant = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-participant.json'));
        let careteamService = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-service.json'));
        let careteamStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-status.json'));
        let careteamIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-careteam-via-intermediary.json'));
        
        let endpointConnectionType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-connection-type.json'));
        let endpointIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-identifier-assigner.json'));
        let endpointIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-identifier.json'));
        let endpointMimeType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-mime-type.json'));
        let endpointOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-organization.json'));
        let endpointPayloadType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-payload-type.json'));
        let endpointStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-status.json'));
        let endpointUsecaseStandard = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-usecase-standard.json'));
        let endpointUsecaseType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-usecase-type.json'));
        let endpointViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-endpoint-via-intermediary.json'));

        let healthcareServiceCharacteristic = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-characteristic.json'));
        let healthcareServiceCoverageArea = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-coverage-area.json'));
        let healthcareServiceEligibility = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-eligibility.json'));
        let healthcareServiceEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-endpoint.json'));
        let healthcareServiceIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-identifier-assigner.json'));
        let healthcareServiceIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-identifier.json'));
        let healthcareServiceLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-location.json'));
        let healthcareServiceName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-name.json'));
        let healthcareServiceNewPatientNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-new-patient-network.json'));
        let healthcareServiceOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-new-patient.json'));
        let healthcareServiceServiceCategory = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-organization.json'));
        let healthcareServiceServiceType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-service-category.json'));
        let healthcareServiceSpecialty = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-service-type.json'));
        let healthcareServiceViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-healthcareservice-specialty.json'));
        
        let insurancePlanAdministeredBy = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-administered-by.json'));
        let insurancePlanCoverageArea = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-coverage-area.json'));
        let insurancePlanCoverageBenefitType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-coverage-benefit-type.json'));
        let insurancePlanCoverageLimitValue = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-coverage-limit-value.json'));
        let insurancePlanCoverageNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-coverage-network.json'));
        let insurancePlanCoverageType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-coverage-type.json'));
        let insurancePlanEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-endpoint.json'));
        let insurancePlanGeneralCostGroupSize = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-general-cost-groupsize.json'));
        let insurancePlanGeneralCostType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-general-cost-type.json'));
        let insurancePlanGeneralCostValue = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-general-cost-value.json'));
        let insurancePlanIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-identifier.json'));
        let insurancePlanName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-name.json'));
        let insurancePlanNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-network.json'));
        let insurancePlanOwnedBy = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-owned-by.json'));
        let insurancePlanPlanCoverageArea = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-plan-coverage-area.json'));
        let insurancePlanPlanIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-plan-identifier.json'));
        let insurancePlanPlanNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-plan-network.json'));
        let insurancePlanPlanType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-plan-type.json'));
        let insurancePlanSpecificCostBenefitType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-specific-cost-benefit-type.json'));
        let insurancePlanSpecificCostCategory = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-specific-cost-category.json'));
        let insurancePlanSpecificCostCostType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-specific-cost-cost-type.json'));
        let insurancePlanSpecificCostCostValue = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-specific-cost-value.json'));
        let insurancePlanStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-status.json'));
        let insurancePlanType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-insuranceplan-type.json'));

        let locationAccessibility = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-accessibility.json'));
        let locationAddress = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-address.json'));
        let locationContains = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-contains.json'));
        let locationEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-endpoint.json'));
        let locationIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-identifier-assigner.json'));
        let locationIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-identifier.json'));
        let locationNewPatientNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-new-patient-network.json'));
        let locationNewPatient = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-new-patient.json'));
        let locationOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-organization.json'));
        let locationPartOf = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-partof.json'));
        let locationStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-status.json'));
        let locationType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-type.json'));
        let locationViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-location-via-intermediary.json'));

        let organizationAddressCity = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-address-city.json'));
        let organizationAddressCountry = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-address-country.json'));
        let organizationAddressPostalCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-address-postalcode.json'));
        let organizationAddressState = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-address-state.json'));
        let organizationAddress = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-address.json'));
        let organizationCoverageArea = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-coverage-area.json'));
        let organizationEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-endpoint.json'));
        let organizationIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-identifier-assigner.json'));
        let organizationIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-identifier.json'));
        let organizationName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-name.json'));
        let organizationPartOf = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-partof.json'));
        let organizationQualificationCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-qualification-code.json'));
        let organizationQualificaitonIssuer = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-qualification-issuer.json'));
        let organizationQualificationStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-qualification-status.json'));
        let organizationQualificationWhereValidCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-qualification-wherevalid-code.json'));
        let organizationQualificationWhereValidLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-qualification-wherevalid-location.json'));
        let organizationType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-type.json'));
        let organizationViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organization-via-intermediary.json'));

        let organizationAffiliationEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-endpoint.json'));
        let organizationAffiliationIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-identifier-assigner.json'));
        let organizationAffiliationIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-identifier.json'));
        let organizationAffiliationLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-location.json'));
        let organizationAffiliationNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-network.json'));
        let organizationAffiliationParticipatingOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-participating-organization.json'));
        let organizationAffiliationPrimaryOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-primary-organization.json'));
        let organizationAffiliationRole = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-role.json'));
        let organizationAffiliationService = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-service.json'));
        let organizationAffiliationSpecialty = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-specialty.json'));
        let organizationAffiliationViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-organizationaffiliation-via-intermediary.json'));

        let practitionerEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-endpoint.json'));
        let practitionerFamilyName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-family-name.json'));
        let practitionerGivenName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-given-name.json'));
        let practitionerIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-identifier-assigner.json'));
        let practitionerIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-identifier.json'));
        let practitionerName = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-name.json'));
        let practitionerPhonetic = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-phonetic.json'));
        let practitionerQualificationCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-qualification-code.json'));
        let practitionerQualificationIssuer = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-qualification-issuer.json'));
        let practitionerQualificationPeriod = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-qualification-period.json'));
        let practitionerQualificaitonStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-qualification-status.json'));
        let practitionerQualificationWhereValidCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-qualification-wherevalid-code.json'));
        let practitionerQualificationWhereValidLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-qualification-wherevalid-location.json'));
        let practitionerViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitioner-via-intermediary.json'));

        let practitionerRoleEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-endpoint.json'));
        let practitionerRoleIdentifierAssigner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-identifier-assigner.json'));
        let practitionerRoleIdentifier = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-identifier.json'));
        let practitionerRoleLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-location.json'));
        let practitionerRoleNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-network.json'));
        let practitionerRoleNewPatientNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-new-patient-network.json'));
        let practitionerRoleNewPatient = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-new-patient.json'));
        let practitionerRoleOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-organization.json'));
        let practitionerRolePractitioner = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-practitioner.json'));
        let practitionerRoleQualificationCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-qualification-code.json'));
        let practitionerRoleQualificationIssuer = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-qualification-issuer.json'));
        let practitionerRoleQualificationStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-qualification-status.json'));
        let practitionerRoleQualificationWhereValidCode = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-qualification-wherevalid-code.json'));
        let practitionerRoleQualificationWhereValidLocation = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-qualification-wherevalid-location.json'));
        let practitionerRoleRole = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-role.json'));
        let practitionerRoleService = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-service.json'));
        let practitionerRoleSpecialty = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-specialty.json'));
        let practitionerRoleViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-practitionerrole-via-intermediary.json'));
        
        let verificationResultAttestationMethod = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-attestation-method.json'));
        let verificationResultAttestationOnBehalfOf = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-attestation-onbehalfof.json'));
        let verificationResultWho = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-attestation-who.json'));
        let verificationResultPrimarySourceDate = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-primarysource-date.json'));
        let verificationResultPrimarySourceType = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-primarysource-type.json'));
        let verificationResultPrimarySourceWho = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-primarysource-who.json'));
        let verificationResultStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-status-date.json'));
        let verificationResultTarget = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-target.json'));
        let verificationResultValidationStatus = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-validation-status.json'));
        let verificationResultValidatorOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/SearchParameter-verificationresult-validator-organization.json'));
        
        let searchParametersArray = [
            careteamCategory,
            careteamEndpoint,
            careteamIdentifierAssigner,
            careteamIdentifier,
            careteamLocation,
            careteamName,
            careteamOrganization,
            careteamParticipant,
            careteamService,
            careteamStatus,
            careteamIntermediary,
        
            endpointConnectionType,
            endpointIdentifierAssigner,
            endpointIdentifier,
            endpointMimeType,
            endpointOrganization,
            endpointPayloadType,
            endpointStatus,
            endpointUsecaseStandard,
            endpointUsecaseType,
            endpointViaIntermediary,

            healthcareServiceCharacteristic,
            healthcareServiceCoverageArea,
            healthcareServiceEligibility,
            healthcareServiceEndpoint,
            healthcareServiceIdentifierAssigner,
            healthcareServiceIdentifier,
            healthcareServiceLocation,
            healthcareServiceName,
            healthcareServiceNewPatientNetwork,
            healthcareServiceOrganization,
            healthcareServiceServiceCategory,
            healthcareServiceServiceType,
            healthcareServiceSpecialty,
            healthcareServiceViaIntermediary,
        
            insurancePlanAdministeredBy,
            insurancePlanCoverageArea,
            insurancePlanCoverageBenefitType,
            insurancePlanCoverageLimitValue,
            insurancePlanCoverageNetwork,
            insurancePlanCoverageType,
            insurancePlanEndpoint,
            insurancePlanGeneralCostGroupSize,
            insurancePlanGeneralCostType,
            insurancePlanGeneralCostValue,
            insurancePlanIdentifier,
            insurancePlanName,
            insurancePlanNetwork,
            insurancePlanOwnedBy,
            insurancePlanPlanCoverageArea,
            insurancePlanPlanIdentifier,
            insurancePlanPlanNetwork,
            insurancePlanPlanType,
            insurancePlanSpecificCostBenefitType,
            insurancePlanSpecificCostCategory,
            insurancePlanSpecificCostCostType,
            insurancePlanSpecificCostCostValue,
            insurancePlanStatus,
            insurancePlanType,

            locationAccessibility,
            locationAddress,
            locationContains,
            locationEndpoint,
            locationIdentifierAssigner,
            locationIdentifier,
            locationNewPatientNetwork,
            locationNewPatient,
            locationOrganization,
            locationPartOf,
            locationStatus,
            locationType,
            locationViaIntermediary,

            organizationAddressCity,
            organizationAddressCountry,
            organizationAddressPostalCode,
            organizationAddressState,
            organizationAddress,
            organizationCoverageArea,
            organizationEndpoint,
            organizationIdentifierAssigner,
            organizationIdentifier,
            organizationName,
            organizationPartOf,
            organizationQualificationCode,
            organizationQualificaitonIssuer,
            organizationQualificationStatus,
            organizationQualificationWhereValidCode,
            organizationQualificationWhereValidLocation,
            organizationType,
            organizationViaIntermediary,

            organizationAffiliationEndpoint,
            organizationAffiliationIdentifierAssigner,
            organizationAffiliationIdentifier,
            organizationAffiliationLocation,
            organizationAffiliationNetwork,
            organizationAffiliationParticipatingOrganization,
            organizationAffiliationPrimaryOrganization,
            organizationAffiliationRole,
            organizationAffiliationService,
            organizationAffiliationSpecialty,
            organizationAffiliationViaIntermediary,

            practitionerEndpoint,
            practitionerFamilyName,
            practitionerGivenName,
            practitionerIdentifierAssigner,
            practitionerIdentifier,
            practitionerName,
            practitionerPhonetic,
            practitionerQualificationCode,
            practitionerQualificationIssuer,
            practitionerQualificationPeriod,
            practitionerQualificaitonStatus,
            practitionerQualificationWhereValidCode,
            practitionerQualificationWhereValidLocation,
            practitionerViaIntermediary,

            practitionerRoleEndpoint,
            practitionerRoleIdentifierAssigner,
            practitionerRoleIdentifier,
            practitionerRoleLocation,
            practitionerRoleNetwork,
            practitionerRoleNewPatientNetwork,
            practitionerRoleNewPatient,
            practitionerRoleOrganization,
            practitionerRolePractitioner,
            practitionerRoleQualificationCode,
            practitionerRoleQualificationIssuer,
            practitionerRoleQualificationStatus,
            practitionerRoleQualificationWhereValidCode,
            practitionerRoleQualificationWhereValidLocation,
            practitionerRoleRole,
            practitionerRoleService,
            practitionerRoleSpecialty,
            practitionerRoleViaIntermediary,
        
            verificationResultAttestationMethod,
            verificationResultAttestationOnBehalfOf,
            verificationResultWho,
            verificationResultPrimarySourceDate,
            verificationResultPrimarySourceType,
            verificationResultPrimarySourceWho,
            verificationResultStatus,
            verificationResultTarget,
            verificationResultValidationStatus,
            verificationResultValidatorOrganization        
        ]


        searchParametersArray.forEach(function(searchParameter){
            if(get(searchParameter, 'resourceType') === "SearchParameter"){
                if(!SearchParameters.findOne({id: get(searchParameter, 'id')})){
                    SearchParameters.insert(searchParameter, {filter: false, validate: false})
                }
            }
        })
    },
    initStructureDefinitions: function(){
        console.log("Init structure definitions....");

        let structureDefinitionAccessibility = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-accessibility.json'));
        let structureDefinitionCareTeamAlias = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-careteam-alias.json'));
        let structureDefinitionCommunicationProficiency = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-communication-proficiency.json'));
        let structureDefinitionContactPointAvailableTime = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-contactpoint-availabletime.json'));
        let structureDefinitionContactPointViaIntermediary = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-contactpoint-viaintermediary.json'));
        let structureDefinitionDigitalCertificate = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-digitalcertificate.json'));
        let structureDefinitionEhr = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-ehr.json'));
        let structureDefinitionEndpointRank = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-endpoint-rank.json'));
        let structureDefinitionEndpointReference = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-endpoint-reference.json'));
        let structureDefinitionEndpointUseCase = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-endpoint-usecase.json'));
        let structureDefinitionHealthcareServiceReference = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-healthcareservice-reference.json'));
        let structureDefinitionIdentifierStatus = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-identifier-status.json'));
        let structureDefinitionInsurancePlanReference = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-insuranceplan-reference.json'));
        let structureDefinitionLocationReference = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-location-reference.json'));
        let structureDefinitionNetworkReference = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-network-reference.json'));
        let structureDefinitionNewPatientProfile = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-newpatientprofile.json'));
        let structureDefinitionNewPatients = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-newpatients.json'));
        let structureDefinitionOrgAliasPeriod = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-org-alias-period.json'));
        let structureDefinitionOrgAliasType = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-org-alias-type.json'));
        let structureDefinitionOrgDescription = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-org-description.json'));
        let structureDefinitionPractitionerQualification = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-practitioner-qualification.json'));
        let structureDefinitionQualification = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-qualification.json'));
        let structureDefinitionUsageRestriction = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-usage-restriction.json'));
        let structureDefinitionVhdirCareTeam = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-careteam.json'));
        let structureDefinitionVhdirEndpoint = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-endpoint.json'));
        let structureDefinitionVhdirHealthcareService = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-healthcareservice.json'));
        let structureDefinitionVhdirInsurancePlan = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-insuranceplan.json'));
        let structureDefinitionVhdirLocation = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-location.json'));
        let structureDefinitionVhdirNetwork = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-network.json'));
        let structureDefinitionVhdirOrganization = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-organization.json'));
        let structureDefinitionVhdirOrganizationAffiliation = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-organizationaffiliation.json'));
        let structureDefinitionVhdirPractitioner = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-practitioner.json'));
        let structureDefinitionVhdirPractitionerRole = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-practitionerrole.json'));
        let structureDefinitionVhdirRestriction = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-restriction.json'));
        let structureDefinitionVhdirValidation = JSON.parse(Assets.getText('data/vhdir-definitions/StructureDefinition-vhdir-validation.json'));

        let structureDefinitionsArray = [
            structureDefinitionAccessibility,
            structureDefinitionCareTeamAlias,
            structureDefinitionCommunicationProficiency,
            structureDefinitionContactPointAvailableTime,
            structureDefinitionContactPointViaIntermediary,
            structureDefinitionDigitalCertificate,
            structureDefinitionEhr,
            structureDefinitionEndpointRank,
            structureDefinitionEndpointReference,
            structureDefinitionEndpointUseCase,
            structureDefinitionHealthcareServiceReference,
            structureDefinitionIdentifierStatus,
            structureDefinitionInsurancePlanReference,
            structureDefinitionLocationReference,
            structureDefinitionNetworkReference,
            structureDefinitionNewPatientProfile,
            structureDefinitionNewPatients,
            structureDefinitionOrgAliasPeriod,
            structureDefinitionOrgAliasType,
            structureDefinitionOrgDescription,
            structureDefinitionPractitionerQualification,
            structureDefinitionQualification,
            structureDefinitionUsageRestriction,
            structureDefinitionVhdirCareTeam,
            structureDefinitionVhdirEndpoint,
            structureDefinitionVhdirHealthcareService,
            structureDefinitionVhdirInsurancePlan,
            structureDefinitionVhdirLocation,
            structureDefinitionVhdirNetwork,
            structureDefinitionVhdirOrganization,
            structureDefinitionVhdirOrganizationAffiliation,
            structureDefinitionVhdirPractitioner,
            structureDefinitionVhdirPractitionerRole,
            structureDefinitionVhdirRestriction,
            structureDefinitionVhdirValidation
        ];        

        structureDefinitionsArray.forEach(function(structureDefinition){
            if(get(structureDefinition, 'resourceType') === "StructureDefinition"){
                if(!StructureDefinitions.findOne({id: get(structureDefinition, 'id')})){
                    StructureDefinitions.insert(structureDefinition)
                }
            }
        })
    },
    initValueSets: function(){
        console.log("Init value sets....");

        let valueSetAccessibility = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-accessibility.json'));
        let valueSetAliasType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-aliastype.json'));
        let valueSetAttestationMethod = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-attestationmethod.json'));
        let valueSetBenefitType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-benefit-type.json'));
        let valueSetCertificationEdition = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-certificationedition.json'));
        let valueSetConsent = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-consent.json'));
        let valueSetCoverageType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-coverage-type.json'));
        let valueSetDigitalCertificateStandard = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-digitalcertificatestandard.json'));
        let valueSetDigitalCertificateTrustFramework = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-digitalcertificatetrustframework.json'));
        let valueSetDigitalCertificateType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-digitalcertificatetype.json'));
        let valueSetDigitalCertificateUse = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-digitalcertificateuse.json'));
        let valueSetExternalValidationType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-externalvalidationtype.json'));
        let valueSetFailureAction = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-failureaction.json'));
        let valueSetHealthcareServiceCharacteristic = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-healthcareservice-characteristic.json'));
        let valueSetHealthcareServiceEligibility = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-healthcareservice-eligibility.json'));
        let valueSetIdentifierType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-identifier-type.json'));
        let valueSetIdentifierStatus = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-identifierstatus.json'));
        let valueSetInsurancePlanType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplan-type.json'));
        let valueSetInsurancePlanBenefitCostType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplanbenefitcosttype.json'));
        let valueSetInsurancePlanBenefitType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplanbenefittype.json'));
        let valueSetInsurancePlanCostCategory = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplancostcategory.json'));
        let valueSetInsurancePlanCostQualifier = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplancostqualifier.json'));
        let valueSetInsurancePlanCostType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplancosttype.json'));
        let valueSetInsurancePlanGroupSize = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-insuranceplangroupsize.json'));
        let valueSetLanguageProficiency = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-languageproficiency.json'));
        let valueSetLimitUnit = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-limit-unit.json'));
        let valueSetNetworkType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-network-type.json'));
        let valueSetPatientAccess = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-patientaccess.json'));
        let valueSetPlanType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-plan-type.json'));
        let valueSetPrimarySourceFailureAction = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-primarysourcefailureaction.json'));
        let valueSetPrimarySourcePush = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-primarysourcepush.json'));
        let valueSetPrimarySourcePushType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-primarysourcepushtype.json'));
        let valueSetPrimarySourceType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-primarysourcetype.json'));
        let valueSetPrimarySourceValidationProcess = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-primarysourcevalidationprocess.json'));
        let valueSetPrimarySourceValidationStatus = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-primarysourcevalidationstatus.json'));
        let valueSetQualificationStatus = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-qualificationstatus.json'));
        let valueSetUseCaseType = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-usecasetype.json'));
        let valueSetValidationNeed = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-validationneed.json'));
        let valueSetValidationProcess = JSON.parse(Assets.getText('data/vhdir-definitions/ValueSet-validationprocess.json'));

        let valueSetsArray = [
            valueSetAccessibility,
            valueSetAliasType,
            valueSetAttestationMethod,
            valueSetBenefitType,
            valueSetCertificationEdition,
            valueSetConsent,
            valueSetCoverageType,
            valueSetDigitalCertificateStandard,
            valueSetDigitalCertificateTrustFramework,
            valueSetDigitalCertificateType,
            valueSetDigitalCertificateUse,
            valueSetExternalValidationType,
            valueSetFailureAction,
            valueSetHealthcareServiceCharacteristic,
            valueSetHealthcareServiceEligibility,
            valueSetIdentifierType,
            valueSetIdentifierStatus,
            valueSetInsurancePlanType,
            valueSetInsurancePlanBenefitCostType,
            valueSetInsurancePlanBenefitType,
            valueSetInsurancePlanCostCategory,
            valueSetInsurancePlanCostQualifier,
            valueSetInsurancePlanCostType,
            valueSetInsurancePlanGroupSize,
            valueSetLanguageProficiency,
            valueSetLimitUnit,
            valueSetNetworkType,
            valueSetPatientAccess,
            valueSetPlanType,
            valueSetPrimarySourceFailureAction,
            valueSetPrimarySourcePush,
            valueSetPrimarySourcePushType,
            valueSetPrimarySourceType,
            valueSetPrimarySourceValidationProcess,
            valueSetPrimarySourceValidationStatus,
            valueSetQualificationStatus,
            valueSetUseCaseType,
            valueSetValidationNeed,
            valueSetValidationProcess    
        ];
        
        valueSetsArray.forEach(function(valueSet){
            if(get(valueSet, 'resourceType') === "ValueSet"){
                if(!ValueSets.findOne({id: get(valueSet, 'id')})){
                    ValueSets.insert(valueSet, {filter: false, validate: false})
                }
            }
        })
    },
    fetchValueSetFromNlm: async function(options){
        console.log('fetchValueSetFromNlm', options);

        let valueSetId = "2.16.840.1.114222.4.11.1066";
        let methodResult = null;

        let nlmApiKey = get(Meteor, 'settings.private.nationalLibraryOfMedicine.apiKey', '')

        return await HTTP.get("https://cts.nlm.nih.gov/fhir/ValueSet/" + valueSetId + "/$expand", {
            header: {},
            auth: "apikey:" + nlmApiKey
          })

        // return methodResult;
    },
    fetchWellKnownUdap: async function(wellKnownUdapUrl){
        console.log('fetchWellKnownUdap', wellKnownUdapUrl);

        return await HTTP.get(wellKnownUdapUrl)
    },
    sendSoftwareStatement: async function(options){
        console.log('fetchWellKnownUdap', options);

        return await HTTP.post(options.url, {
            data: options.data
        })
    }
})