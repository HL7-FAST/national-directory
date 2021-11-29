import React, { useState } from 'react';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

import { 
    DialogActions,
    Button
} from '@material-ui/core';

import { get, has } from 'lodash';
import JSON5 from 'json5';

import { 
    useTracker, 
    LayoutHelpers, 
    Locations, 
    CodeSystemDetail
} from 'meteor/clinical:hl7-fhir-data-infrastructure';

import moment from 'moment';

//========================================================================================================

import {
  fade,
  ThemeProvider,
  MuiThemeProvider,
  withStyles,
  makeStyles,
  createMuiTheme,
  useTheme
} from '@material-ui/core/styles';

  // Global Theming 
  // This is necessary for the Material UI component render layer
  let theme = {
    appBarColor: "#000000",
    appBarTextColor: "#ffffff"
  }

  // if we have a globally defined theme from a settings file
  if(get(Meteor, 'settings.public.theme.palette')){
    theme = Object.assign(theme, get(Meteor, 'settings.public.theme.palette'));
  }

  const muiTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      appBar: {
        main: theme.appBarColor,
        contrastText: theme.appBarTextColor
      },
      contrastThreshold: 3,
      tonalOffset: 0.2
    }
  });



//============================================================================================================================
// Shared Functions




//============================================================================================================================
// Shared Styles  

let buttonStyles = {
    west_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: '#ffffff',
      marginLeft: '20px',
      marginTop: '5px',
      float: 'left',
      position: 'relative'
    },
    east_button: {
      cursor: 'pointer',
      justifyContent: 'right',
      color: '#ffffff',
      right: '20px',
      marginTop: '5px',
      float: 'right',
      position: 'relative'
    }
  }




//============================================================================================================================
// Turntable / Biosignature

export function VhDirFooterButtons(props){
  // const buttonClasses = buttonStyles();

  console.log('VhDirFooterButtons')


  function clearData(){
    if(confirm("Are you sure you want to delete all the data?")){
      console.log('VhDirFooterButtons.clearData()');
  
      Meteor.call('clearAllHealthflowData');

      Patients.find().forEach(function(record){
        Patients.remove({_id: record._id});
      });
      Persons.find().forEach(function(record){
        Persons.remove({_id: record._id});
      });
      Medications.find().forEach(function(record){
        Medications.remove({_id: record._id});
      });
      CareTeams.find().forEach(function(record){
        CareTeams.remove({_id: record._id});
      });
      Organizations.find().forEach(function(record){
        Organizations.remove({_id: record._id});
      });
    }
  }
  return (
    <MuiThemeProvider theme={muiTheme}  >
      <Button onClick={ clearData.bind(this) } style={buttonStyles.east_button}>
        Clear
      </Button>      
    </MuiThemeProvider>
  );
}



//============================================================================================================================
// Shared Functions


function toggleSelect(resourceType){
    Session.toggle(resourceType + 'sTable.hideCheckbox')
}
function toggleLayout(resourceType){
    Session.toggle(resourceType + 'sPage.onePageLayout')
}
function handleClose(){
    Session.set('mainAppDialogOpen', false)
}

//============================================================================================================================
// Shared Components

export function DefaultPostDialogActions(props){

    let { 
        children, 
        resourceType,
        relayUrl,
        ...otherProps 
    } = props;

    function handleSendCodeSystem(){
        console.log('handleSendCodeSystem', props);

        let relayUrl = get(Meteor, 'settings.public.interfaces.fhirRelay.channel.endpoint', 'http://localhost:3000/baseR4')
        if(relayUrl){
            let currentCodeSystem = Session.get('CodeSystem.Current')
            if(has(currentCodeSystem, 'id')){
                HTTP.put(relayUrl + '/' + resourceType + '/' + get(currentCodeSystem, 'id'), {data: currentCodeSystem}, function(error, result){
                    if(error){
                        alert(JSON.stringify(error.message));
                    }
                    if(result){
                        Session.set('mainAppDialogOpen', false)
                    }
                })
            } else {
                HTTP.post(relayUrl + '/' + resourceType, {data: currentCodeSystem}, function(error, result){
                    if(error){
                        alert(JSON.stringify(error.message));
                    }
                    if(result){
                        Session.set('mainAppDialogOpen', false)
                    }
                })
            }    
        }
    }
    let actionsToRender = <DialogActions >
        <Button onClick={handleClose} color="primary">
            Close
        </Button>
        <Button onClick={handleSendCodeSystem.bind(this)} color="primary" variant="contained">
            Send
        </Button>
    </DialogActions>

    return actionsToRender;
}

//============================================================================================================================
// Code Systems

export function CodeSystemsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "CodeSystemDetail");
        Session.set('mainAppDialogTitle', "Edit Code System");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let buttonArray = [];

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
                New Code System
            </Button>
            <Button onClick={ toggleSelect.bind(this, "CodeSystem") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "CodeSystem") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>     
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }

  return (componentToRender);
}



//============================================================================================================================
// Endpoints

export function EndpointsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "EndpointDetail");
        Session.set('mainAppDialogTitle', "Edit Endpoint");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >        
            <Button onClick={ openDialog.bind(this, "Endpoint") } style={ buttonStyles.west_button }>
            New Endpoint
            </Button>
            <Button onClick={ toggleSelect.bind(this, "Endpoint") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "Endpoint") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
  }


//============================================================================================================================
// Healthcare Services

export function HealthcareServicesFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "HealthcareServiceDetail");
        Session.set('mainAppDialogTitle', "Edit Service");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Service
            </Button>
            <Button onClick={ toggleSelect.bind(this, "HealthcareService") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "HealthcareService") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}


//============================================================================================================================
// Insurance Plans

export function InsurancePlansFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "InsurancePlanDetail");
        Session.set('mainAppDialogTitle', "Edit Insurance Plan");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Plan
            </Button>
            <Button onClick={ toggleSelect.bind(this, "InsurancePlan") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "InsurancePlan") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}

//============================================================================================================================
// Locations

export function LocationsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "LocationDetail");
        Session.set('mainAppDialogTitle', "Edit Location");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Location
            </Button>
            <Button onClick={ toggleSelect.bind(this, "Location") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "Location") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}

//============================================================================================================================
// Organizations


export function OrganizationsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "OrganizationDetail");
        Session.set('mainAppDialogTitle', "Edit Organization");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }
  
    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Organization
            </Button>
            <Button onClick={ toggleSelect.bind(this, "Organization") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "Organization") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }

    return (componentToRender);
}

//============================================================================================================================
// Organization Affiliations


export function OrganizationAffiliationsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "OrganizationAffiliationDetail");
        Session.set('mainAppDialogTitle', "Edit Affiliation");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Affiliation
            </Button>
            <Button onClick={ toggleSelect.bind(this, "OrganizationAffiliation") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "OrganizationAffiliation") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}


//============================================================================================================================
// Practitioners



export function PractitionersFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "PractitionerDetail");
        Session.set('mainAppDialogTitle', "Edit Practitioner");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Practitioner
            </Button>
            <Button onClick={ toggleSelect.bind(this, "Practitioner") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "Practitioner") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}


//============================================================================================================================
// Practitioner Roles



export function PractitionerRolesFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "PractitionerRoleDetail");
        Session.set('mainAppDialogTitle', "Edit Role");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }
  
    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Role
            </Button>
            <Button onClick={ toggleSelect.bind(this, "PractitionerRole") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "PractitionerRole") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }

    return (componentToRender);
}

//============================================================================================================================
// Search Parameters


export function SearchParametersFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "SearchParameterDetail");
        Session.set('mainAppDialogTitle', "Edit Parameters");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Parameter
            </Button>
            <Button onClick={ toggleSelect.bind(this, "SearchParameter") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "SearchParameter") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}


//============================================================================================================================
// Structure Definitions



export function StructureDefinitionsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "StructureDefinitionDetail");
        Session.set('mainAppDialogTitle', "Edit Definitions");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }

    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Definition
            </Button>
            <Button onClick={ toggleSelect.bind(this, "StructureDefinition") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "StructureDefinition") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }
  
    return (componentToRender);
}


//============================================================================================================================
// Value Sets



export function ValueSetsFooterButtons(props){

    function openDialog(){
        Session.toggle('mainAppDialogOpen');
        Session.set('mainAppDialogComponent', "ValueSetDetail");
        Session.set('mainAppDialogTitle', "Edit Value Set");
        Session.set('mainAppDialogMaxWidth', "sm");
        // Session.set('mainAppDialogJson', {});        
    }
  
    let componentToRender;
    if(Meteor.currentUserId()){
        componentToRender = <MuiThemeProvider theme={muiTheme} >
            <Button onClick={ openDialog.bind(this) } style={ buttonStyles.west_button }>
            New Value Set
            </Button>
            <Button onClick={ toggleSelect.bind(this, "ValueSet") } style={ buttonStyles.west_button }>
                Toggle Select
            </Button>
            <Button onClick={ toggleLayout.bind(this, "ValueSet") } style={ buttonStyles.west_button }>
                Layout
            </Button>
        </MuiThemeProvider>
    } else {
        componentToRender = <MuiThemeProvider theme={muiTheme}></MuiThemeProvider>;
    }

    return (componentToRender);
}
//============================================================================================================================
