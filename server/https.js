
import { Meteor } from 'meteor/meteor';
import { Endpoints, Practitioners, Organizations, HealthcareServices, InsurancePlans, Networks, Locations, OrganizationAffiliations, PractitionerRoles } from 'meteor/clinical:hl7-fhir-data-infrastructure'

JsonRoutes.add("get", "/stats", function (req, res, next) {
    console.log('GET ' + '/stats');

    res.setHeader('Content-type', 'application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");

    let returnPayload = {
      code: 200,
      data: {
        collections: {
            organizations: Organizations.find().count(),
            practitioners: Practitioners.find().count(),
            endpoints: Endpoints.find().count(),
            networks: Networks.find().count(),
            insurancePlans: InsurancePlans.find().count(),
            healthcareServices: HealthcareServices.find().count(),
            locations: Locations.find().count(),
            organizationAffiliations: OrganizationAffiliations.find().count(),
            practitionerRoles: PractitionerRoles.find().count()
        }
      }
    }

    console.log('Publishing stats...')
   
    JsonRoutes.sendResult(res, returnPayload);
});


JsonRoutes.add("post", "/generateAndSignCertificate", function (req, res, next) {
  console.log('POST ' + '/generateAndSignCertificate');

  res.setHeader('Content-type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");

  console.log("");
  console.log(req.body);
  console.log("");

  Meteor.call('generateAndSignCertificate', req.body, function(error, signResult){
    if(error){
      console.log('error', error);
    }
    if(signResult){
      let returnPayload = {
        code: 200,
        data: signResult
      }      
      console.log('Signing software statement...') 
      JsonRoutes.sendResult(res, returnPayload);    
    }
  }) ;
});