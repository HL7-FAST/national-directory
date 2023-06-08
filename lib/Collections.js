
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { get, has, set } from 'lodash';

import { 
  Bundles,
  CodeSystems,
  Conditions,
  Communications,
  CommunicationRequests,
  Consents,
  Devices,
  Goals,
  Lists,
  Locations,
  HealthcareServices,
  MessageHeaders,
  Observations,
  Organizations,
  Patients,
  Practitioners,
  PractitionerRoles,
  Procedures,
  RelatedPersons,
  Questionnaires,
  QuestionnaireResponses,
  ServiceRequests,
  StructureDefinitions,
  Tasks,
  ValueSets
} from 'meteor/clinical:hl7-fhir-data-infrastructure';

// Questionnaires.allow({
//   insert() { return true; },
//   update() { return true; }
// });
// Tasks.allow({
//   insert() { return true; },
//   update() { return true; }
// });


if(Meteor.isClient){

    if(get(Meteor, 'settings.private.disableDefaultDirectoryPublications') !== true){
        Meteor.subscribe('CodeSystems');
        Meteor.subscribe('StructureDefinitions');
        Meteor.subscribe('ValueSets');
        Meteor.subscribe('Questionnaires');
    
    
        Tracker.autorun(function(){
            
            Meteor.subscribe('Bundles', Session.get("selectedPatientId"));
            Meteor.subscribe('CommunicationRequests', Session.get("selectedPatientId"));
            Meteor.subscribe('Communications', Session.get("selectedPatientId"));
            Meteor.subscribe('HealthcareServices', Session.get("selectedPatientId"));
            Meteor.subscribe('Locations', Session.get("selectedPatientId"));
            Meteor.subscribe('Organizations', Session.get("selectedPatientId"));
            Meteor.subscribe('Practitioners', Session.get("selectedPatientId"));
            Meteor.subscribe('PractitionerRoles', Session.get("selectedPatientId")); 
            Meteor.subscribe('Tasks', Session.get("selectedPatientId"));
        })    
    }
}


if(Meteor.isServer){
  let defaultQuery = {};
  let defaultOptions = {limit: 5000}

  if(get(Meteor, 'settings.private.disableDefaultDirectoryPublications') !== true){

    Meteor.publish('CodeSystems', function(){
        return CodeSystems.find(defaultQuery, defaultOptions);
    });    
    Meteor.publish('SearchParameters', function(){
        return SearchParameters.find(defaultQuery, defaultOptions);
    });    
    Meteor.publish('ValueSets', function(){
        return ValueSets.find(defaultQuery, defaultOptions);
    });    
    Meteor.publish('StructureDefinitions', function(){
        return StructureDefinitions.find();
    });
    Meteor.publish('Questionnaires', function(selectedPatientId){
        return Questionnaires.find();
    });


    // check for login ?
  

    Meteor.publish('Communications', function(selectedPatientId){
      return Communications.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
    });
    Meteor.publish('CommunicationRequests', function(selectedPatientId){
      return CommunicationRequests.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
    });
    Meteor.publish('HealthcareServices', function(selectedPatientId){
      return HealthcareServices.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
    });
    Meteor.publish('Locations', function(selectedPatientId){
    //   return Locations.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
    return Locations.find(defaultQuery, defaultOptions);
    });
    Meteor.publish('Organizations', function(selectedPatientId){
    //   return Organizations.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
      return Organizations.find(defaultQuery, defaultOptions);
    });
    Meteor.publish('Practitioners', function(selectedPatientId){
    //   return Practitioners.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
      return Practitioners.find(defaultQuery, defaultOptions);
    });
    Meteor.publish('PractitionerRoles', function(selectedPatientId){
      return PractitionerRoles.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
    });
    Meteor.publish('ServiceRequests', function(selectedPatientId){
      return ServiceRequests.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
    });
    Meteor.publish('Tasks', function(selectedPatientId){
        // return Tasks.find(FhirUtilities.addPatientFilterToQuery(selectedPatientId, defaultQuery), defaultOptions);
        return Tasks.find(defaultQuery, defaultOptions);
      });
    }

}
