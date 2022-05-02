import React from 'react';

import MainPage from './client/MainPage';
import UdapRegistrationPage from './client/UdapRegistrationPage';
import ServerConfigurationPage from './client/ServerConfigurationPage';
import CertificateStoragePage from './client/CertificateStoragePage';
import OauthClientsPage from './client/OauthClientsPage';
import NewCertificateDialog from './client/NewCertificateDialog';

import SearchValueSetDialog from './client/SearchValueSetDialog';
import SearchStatesDialog from './client/SearchStatesDialog';
import SearchResourceTypesDialog from './client/SearchResourceTypesDialog';

import { 
  CardContent,
  DialogContent
} from '@material-ui/core';

import { 
  CareTeamDetail,
  CodeSystemDetail,
  CommunicationDetail,
  CommunicationRequestDetail,
  EndpointDetail,
  HealthcareServiceDetail,
  InsurancePlanDetail,
  LocationDetail,
  NetworkDetail,
  OrganizationDetail,
  OrganizationAffiliationDetail,
  PractitionerDetail,
  PractitionerRoleDetail,
  ProvenanceDetail,
  RelatedPersonDetail,
  RestrictionDetail,
  SearchParameterDetail,
  StructureDefinitionDetail,
  TaskDetail,
  ValueSetDetail,
  VerificationResultDetail
} from 'meteor/clinical:hl7-fhir-data-infrastructure';


let DynamicRoutes = [{
  name: 'UdapRegistrationPage',
  path: '/udap-registration',
  component: UdapRegistrationPage,
  requireAuth: true
}, {
  name: 'ServerConfigurationPage',
  path: '/server-configuration',
  component: ServerConfigurationPage,
  requireAuth: true
}, {
  name: 'CertificateStoragePage',
  path: '/certificate-storage-page',
  component: CertificateStoragePage,
  requireAuth: true
}, {
  name: 'OauthClientsPage',
  path: '/oauth-clients',
  component: OauthClientsPage,
  requireAuth: true
}]

let SidebarWorkflows = [{
  'primaryText': 'Certificates',
  'to': '/certificate-storage-page',
  'href': '/certificate-storage-page'
}, {
  'primaryText': 'OAuth Clients',
  'to': '/oauth-clients',
  'href': '/oauth-clients'
}]


import { 
  VhDirFooterButtons,
  CareTeamsFooterButtons,
  CodeSystemsFooterButtons,
  CommunicationsFooterButtons,
  CommunicationRequestsFooterButtons,
  EndpointsFooterButtons,
  HealthcareServicesFooterButtons,
  InsurancePlansFooterButtons,
  LocationsFooterButtons,
  NetworksFooterButtons,
  OrganizationsFooterButtons,
  OrganizationAffiliationsFooterButtons,
  PractitionersFooterButtons,
  PractitionerRolesFooterButtons,
  ProvenancesFooterButtons,
  RelatedPersonsFooterButtons,
  RestrictionsFooterButtons,
  SearchParametersFooterButtons,
  StructureDefinitionsFooterButtons,
  TasksFooterButtons,
  ValueSetsFooterButtons,
  VerificationResultsFooterButtons,

  CertificatesButtons,
  AddCertificateDialogActions,

  DefaultPostDialogActions
} from './client/FooterButtons';

let FooterButtons = [{
  pathname: '/',
  component: <VhDirFooterButtons />
}, {
  pathname: '/careteams',
  component: <CareTeamsFooterButtons />
}, {
  pathname: '/code-systems',
  component: <CodeSystemsFooterButtons />
}, {
  pathname: '/communications',
  component: <CommunicationsFooterButtons />
}, {
  pathname: '/communication-requests',
  component: <CommunicationRequestsFooterButtons />
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
  pathname: '/networks',
  component: <NetworksFooterButtons />
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
  pathname: '/provenances',
  component: <ProvenancesFooterButtons />
}, {
  pathname: '/related-persons',
  component: <RelatedPersonsFooterButtons />
}, {
  pathname: '/restrictions',
  component: <RestrictionsFooterButtons />
}, {
  pathname: '/search-parameters',
  component: <SearchParametersFooterButtons />
}, {
  pathname: '/structure-definitions',
  component: <StructureDefinitionsFooterButtons />
}, {
  pathname: '/tasks',
  component: <TasksFooterButtons />
}, {
  pathname: '/valuesets',
  component: <ValueSetsFooterButtons />
}, {
  pathname: '/verification-results',
  component: <VerificationResultsFooterButtons />
}, {
  pathname: '/certificate-storage-page',
  component: <CertificatesButtons />
}];




let DialogComponents = [{
  name: "SearchResourceTypesDialog",
  component: <DialogContent><SearchResourceTypesDialog /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="ValueSet" />
}, {
  name: "SearchStatesDialog",
  component: <DialogContent><SearchStatesDialog /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="ValueSet" />
}, {
  name: "SearchValueSetDialog",
  component: <DialogContent><SearchValueSetDialog /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="ValueSet" />
}, {
  name: "CareTeamDetail",
  component: <DialogContent><CareTeamDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="CareTeam" />
}, {
  name: "CodeSystemDetail",
  component: <DialogContent><CodeSystemDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="CodeSystem" />
}, {
  name: "CommunicationDetail",
  component: <DialogContent><CommunicationDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Communication" />
}, {
  name: "CommunicationRequestDetail",
  component: <DialogContent><CommunicationRequestDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="CommunicationRequest" />
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
  name: "NetworkDetail",
  component: <DialogContent><NetworkDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Network" />
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
  name: "ProvenanceDetail",
  component: <DialogContent><ProvenanceDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Provenance" />
}, {
  name: "RelatedPersonDetail",
  component: <DialogContent><RelatedPersonDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="RelatedPerson" />
}, {
  name: "RestrictionDetail",
  component: <DialogContent><RestrictionDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Restriction" />
}, {
  name: "SearchParameterDetail",
  component: <DialogContent><SearchParameterDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="SearchParameter" />
}, {
  name: "StructureDefinitionDetail",
  component: <DialogContent><StructureDefinitionDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="StructureDefinition" />
}, {
  name: "TaskDetail",
  component: <DialogContent><TaskDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="Task" />
}, {
  name: "ValueSetDetail",
  component: <DialogContent><ValueSetDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="ValueSet" />
}, {
  name: "VerificationResultDetail",
  component: <DialogContent><VerificationResultDetail /></DialogContent>,
  actions: <DefaultPostDialogActions resourceType="VerificationResult" />
}, {
  name: "NewCertificateDialog",
  component: <DialogContent><NewCertificateDialog /></DialogContent>,
  actions: <AddCertificateDialogActions resourceType="VerificationResult" />
}]



export {
  FooterButtons,
  DialogComponents,
  DynamicRoutes,
  SidebarWorkflows,
  MainPage
};
