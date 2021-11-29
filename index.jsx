import React from 'react';

import MainPage from './client/MainPage';


import { 
  CardContent,
  DialogContent
} from '@material-ui/core';

import { 
  CodeSystemDetail,
  EndpointDetail,
  HealthcareServiceDetail,
  InsurancePlanDetail,
  LocationDetail,
  OrganizationDetail,
  OrganizationAffiliationDetail,
  PractitionerDetail,
  PractitionerRoleDetail,
  SearchParameterDetail,
  StructureDefinitionDetail,
  ValueSetDetail
} from 'meteor/clinical:hl7-fhir-data-infrastructure';


import { 
  VhDirFooterButtons,
  CodeSystemsFooterButtons,
  EndpointsFooterButtons,
  HealthcareServicesFooterButtons,
  InsurancePlansFooterButtons,
  LocationsFooterButtons,
  OrganizationsFooterButtons,
  OrganizationAffiliationsFooterButtons,
  PractitionersFooterButtons,
  PractitionerRolesFooterButtons,
  SearchParametersFooterButtons,
  StructureDefinitionsFooterButtons,
  ValueSetsFooterButtons,

  DefaultPostDialogActions
} from './client/FooterButtons';

let FooterButtons = [{
  pathname: '/',
  component: <VhDirFooterButtons />
}, {
  pathname: '/code-systems',
  component: <CodeSystemsFooterButtons />
}, {
  pathname: '/endpoints',
  component: <EndpointsFooterButtons />
}, {
  pathname: '/healthcare-services',
  component: <HealthcareServicesFooterButtons />
}, {
  pathname: '/insurance-plans',
  component: <InsurancePlansFooterButtons />
}, {
  pathname: '/locations',
  component: <LocationsFooterButtons />
}, {
  pathname: '/organizations',
  component: <OrganizationsFooterButtons />
}, {
  pathname: '/organization-affiliations',
  component: <OrganizationAffiliationsFooterButtons />
}, {
  pathname: '/practitioners',
  component: <PractitionersFooterButtons />
}, {
  pathname: '/practitioner-roles',
  component: <PractitionerRolesFooterButtons />
}, {
  pathname: '/search-parameters',
  component: <SearchParametersFooterButtons />
}, {
  pathname: '/structure-definitions',
  component: <StructureDefinitionsFooterButtons />
}, {
  pathname: '/valuesets',
  component: <ValueSetsFooterButtons />
}];


let DialogComponents = [{
  name: "CodeSystemDetail",
  component: <DialogContent><CodeSystemDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="CodeSystem" />
}, {
  name: "EndpointDetail",
  component: <DialogContent><EndpointDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Endpoint" />
}, {
  name: "HealthcareServiceDetail",
  component: <DialogContent><HealthcareServiceDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="HealthcareService" />
}, {
  name: "InsurancePlanDetail",
  component: <DialogContent><InsurancePlanDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="InsurancePlan" />
}, {
  name: "LocationDetail",
  component: <DialogContent><LocationDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Location" />
}, {
  name: "OrganizationDetail",
  component: <DialogContent><OrganizationDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Organization" />
}, {
  name: "OrganizationAffiliationDetail",
  component: <DialogContent><OrganizationAffiliationDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="OrganizationAffiliation" />
}, {
  name: "PractitionerDetail",
  component: <DialogContent><PractitionerDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Practitioner" />
}, {
  name: "PractitionerRoleDetail",
  component: <DialogContent><PractitionerRoleDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="PractitionerRole" />
}, {
  name: "SearchParameterDetail",
  component: <DialogContent><SearchParameterDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="SearchParameter" />
}, {
  name: "StructureDefinitionDetail",
  component: <DialogContent><StructureDefinitionDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="StructureDefinition" />
}, {
  name: "ValueSetDetail",
  component: <DialogContent><ValueSetDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="ValueSet" />
}]

export {
  FooterButtons,
  DialogComponents,
  MainPage
};
