
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