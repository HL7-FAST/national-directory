

import { 
  Grid,
  Button, 
  CardActions, 
  CardContent, 
  CardHeader,
  TextField,
  Paper
} from '@material-ui/core';

import { StyledCard, PageCanvas } from 'fhir-starter';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

import { get, result, set } from 'lodash';
import moment from 'moment';

import { FhirUtilities } from 'meteor/clinical:hl7-fhir-data-infrastructure';


//====================================================================================
// THEMING

import { ThemeProvider, makeStyles } from '@material-ui/styles';
const useStyles = makeStyles(theme => ({
  button: {
    background: theme.background,
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: theme.buttonText,
    height: 48,
    padding: '0 30px',
  },
  input: {
    marginBottom: '20px'
  },
  compactInput: {
    marginBottom: '10px'
  },
  label: {
    paddingBottom: '10px'
  },
  inputRoot: {
    '&$disabled': {
      color:'#222222'
    },
  },
  disabled: {}
}));

//====================================================================================
// SESSION VARIABLES

let defaultPractitioner = {
  resourceType: 'Practitioner'
}

Session.setDefault('Practitioner.Current', defaultPractitioner)
Session.setDefault('practitionerBlockchainData', []);



//====================================================================================
// Helper Functions

function pluckNpiIdentifier(identifierArray){
  let result = "";
  if(Array.isArray(identifierArray)){
    identifierArray.forEach(function(identifier){
      if(get(identifier, 'type.text') === "National Provider Identifier"){
        result = get(identifier, 'value');
      }
    })
  }
  return result;
}
function pluckSpecialtyIdentifier(identifierArray){
  let result = "";
  if(Array.isArray(identifierArray)){
    identifierArray.forEach(function(identifier){
      if(get(identifier, 'type.text') === "Healthcare Provider Taxonomy Code"){
        result = get(identifier, 'value');
      }
    })
  }
  return result;
}
function pluckPhoneTelecom(telecomAppray){
  let result = "";
  if(Array.isArray(telecomAppray)){
    telecomAppray.forEach(function(telecom){
      if(get(telecom, 'system') === "phone"){
        if(get(telecom, 'use') === "work"){
          result = get(telecom, 'value');
        }
      }
    })
  }
  return result;
}
function formatPostalCode(postalCode){
  let postalCodeString = "";
  if(postalCode){
    // assume a 5 digit code
    // and assign as string
    postalCodeString = postalCode;

    // if a 9 digit postal code, format it (US Standards)
    if(postalCodeString.length === 9){
      postalCodeString = postalCodeString.substring(0,5) + "-" + postalCodeString.substring(5,9)
      
    }  
  }
  return postalCodeString;
}
function formatPhoneNumber(phoneNumber){
  let phoneString = "";
  if(phoneNumber){
    // and assign as string, assuming its properly formated
    phoneString = (phoneNumber).toString();

    // if a 10 digit number, add necessary dashes
    if(phoneString.length === 10){
      phoneString = phoneString.substring(0,3) + "-" + phoneString.substring(3,6) + "-" + phoneString.substring(6,10)
    }
  }
  return phoneString;
}


//====================================================================================
// MAIN COMPONENT

export function PractitionerDetail(props){

  let classes = useStyles();

  let { 
    children, 
    practitioner,
    primaryColor,
    ...otherProps 
  } = props;

  let data = {
    activePractitioner: defaultPractitioner,
    currentUser: false,
    isDisabled: true
  };

  // practitioner = useTracker(function(){
  //   return Session.get('Practitioner.Current');
  // }, [])
  data.currentUser = useTracker(function(){
    return Session.get('currentUser');
  }, [])
  data.isDisabled = useTracker(function(){
    if(Session.get('currentUser')){
      return false;
    } else {
      return true;
    }
  }, [])

  function updateField(path, event){
    console.log('updateField', event.currentTarget.value);

    // setCurrentCodeSystem(set(currentCodeSystem, path, event.currentTarget.value))
    Session.set('Practitioner.Current', set(practitioner, path, event.currentTarget.value))    
  }

  let customInputProps = {
    classes:{
      root: classes.inputRoot,
      disabled: classes.disabled
    }
  };
  let customInputLabelProps = {
    shrink: true
  }



  let practitionerArray = [];

  if(get(practitioner, 'qualification')){
    if(Array.isArray(practitioner.qualification)){
      practitioner.qualification.forEach(function(record, index){
        practitionerArray.push(
          <Grid container spacing={3}>
              <Grid item md={6}>
                <TextField
                  id='qualificationIssuerInput'
                  // ref='qualificationIssuer'
                  name='qualificationIssuer'
                  type='text'
                  label='Qualification Issuer'
                  //floatingLabelFixed={true}
                  value={ FhirUtilities.pluckReference(get(practitioner, 'qualification[' + index + '].issuer')) }
                  onChange={ updateField.bind(this, 'qualification[' + index + '].issuer')}
                  hintText='American College of Emergency Physicians'
                  disabled={data.isDisabled}
                  fullWidth
                  InputProps={customInputProps}
                  InputLabelProps={customInputLabelProps}
                  /><br/>
              </Grid>
              <Grid item md={2}>
                <TextField
                  id='qualificationCodeInput'
                  // ref='qualificationCode'
                  name='qualificationCode'
                  type='text'
                  label='Code'
                  //floatingLabelFixed={true}
                  value={ FhirUtilities.pluckFirstIdentifier(get(practitioner, 'qualification[' + index + '].identifier')) }
                  onChange={ updateField.bind(this, 'qualification[' + index + '].code') }
                  hintText='ACEP-10792866'
                  disabled={data.isDisabled}
                  fullWidth
                  InputProps={customInputProps}
                  InputLabelProps={customInputLabelProps}
                  /><br/>
              </Grid>
              <Grid item md={2}>
                <TextField
                  id='qualificationStartInput'
                  // ref='qualificationStart'
                  name='qualificationStart'
                  type='date'
                  label='Start'
                  floatingLabelFixed={true}
                  value={ get(practitioner, 'qualification[' + index + '].period.start', null) }
                  onChange={ updateField.bind(this, 'qualification[' + index + '].period.start')}
                  disabled={data.isDisabled}
                  fullWidth
                  InputProps={customInputProps}
                  InputLabelProps={customInputLabelProps}
                  /><br/>
              </Grid>
              <Grid item md={2}>
                <TextField
                  id='qualificationEndInput'
                  // ref='qualificationEnd'
                  name='qualificationEnd'
                  type='date'
                  label='End'
                  disabled={data.isDisabled}
                  floatingLabelFixed={true}
                  value={ get(practitioner, 'qualification[' + index + '].period.end', null) }
                  onChange={ updateField.bind(this, 'qualification[' + index + '].period.end')}
                  InputProps={customInputProps}
                  InputLabelProps={customInputLabelProps}
                  fullWidth
                  /><br/>
              </Grid>
          </Grid>
        )
      })
    }  
  }

  let restrictionStyle = {};

  if(!data.currentUser){
    restrictionStyle.backgroundColor = "#ffffff";
    restrictionStyle.opacity = 0.8;
    restrictionStyle.backgroundSize = "16px 16px";
    restrictionStyle.backgroundImage = "radial-gradient(" + primaryColor + " 1.5px, rgba(0, 0, 0, 0) 1.5px)"  
  }

  return (
    <div className="practitionerDetail">
      <CardContent>
        <Grid container spacing={3}>
          <Grid item md={6}>  
            <TextField
              id='practitionerNameInput'
              // ref='name'
              name='name'
              type='text'
              label='Name'
              //floatingLabelFixed={true}
              hintText='Alison Camron'
              value={ FhirUtilities.assembleName(get(practitioner, 'name[0]')) }
              onChange={ updateField.bind(this, 'name')}
              disabled={data.isDisabled}
              fullWidth
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              /><br/>
          </Grid>
          <Grid item md={1}>
            <TextField
              id='genderInput'
              // ref='gender'
              name='gender'
              type='gender'
              label='Gender'
              //floatingLabelFixed={true}
              hintText='unknown'
              value={ get(practitioner, 'gender') }
              onChange={ updateField.bind(this, 'gender')}
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              /><br/>
          </Grid>
          <Grid item md={2}>
            <TextField
              id='phoneInput'
              // ref='phone'
              name='phone'
              type='phone'
              label='Phone'
              //floatingLabelFixed={true}
              hintText='773-555-1010'
              value={ formatPhoneNumber(FhirUtilities.pluckPhone(get(practitioner, 'telecom'))) }
              onChange={ updateField.bind(this, 'phone')}
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              /><br/>
          </Grid>
          <Grid item md={3}>
            <TextField
              id='emailInput'
              // ref='email'
              name='email'
              type='email'
              label='Email'
              //floatingLabelFixed={true}
              hintText='drcamron@symptomatic.io'
              value={ FhirUtilities.pluckEmail(get(practitioner, 'telecom')) }
              onChange={ updateField.bind(this, 'email')}
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              /><br/>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item md={6}>
            <TextField
              id='textInput'
              // ref='text'
              name='text'
              label='Address'
              value={ get(practitioner, 'address[0].line[0]') }
              onChange={ updateField.bind(this, 'address[0].line')}
              //floatingLabelFixed={true}
              hintText='South Side'
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              style={restrictionStyle}
              /><br/>
          </Grid>
          <Grid item md={2}>
            <TextField
              id='cityInput'
              // ref='city'
              name='city'
              label='City'
              value={ get(practitioner, 'address[0].city') }
              onChange={ updateField.bind(this, 'city')}
              hintText='Chicago'
              //floatingLabelFixed={true}
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              style={restrictionStyle}
              /><br/>
          </Grid>
          <Grid item md={2}>
            <TextField
              id='stateInput'
              // ref='state'
              name='state'
              label='State'
              value={ get(practitioner, 'address[0].state') }
              onChange={ updateField.bind(this, 'address[0].state')}
              //floatingLabelFixed={true}
              hintText='Illinois'
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              style={restrictionStyle}
              /><br/>
          </Grid>
          <Grid item md={2}>
            <TextField
              id='postalCodeInput'
              // ref='postalCode'
              name='postalCode'
              label='Postal Code'
              value={ formatPostalCode(get(practitioner, 'address[0].postalCode')) }
              onChange={ updateField.bind(this, 'address[0].postalCode')}
              //floatingLabelFixed={true}
              hintText='60637'
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              style={restrictionStyle}
              /><br/>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item md={3}>
            <TextField
              id='npiInput'
              // ref='npi'
              name='npi'
              label='National Provider Identifier'
              value={ pluckNpiIdentifier(get(practitioner, 'identifier')) }
              onChange={ updateField.bind(this, 'city')}
              hintText='Chicago'
              //floatingLabelFixed={true}
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              /><br/>
          </Grid>   
          <Grid item md={3}>
            <TextField
              id='specialtyInput'
              // ref='specialty'
              name='specialty'
              label='Specialty Code'
              value={ pluckSpecialtyIdentifier(get(practitioner, 'identifier')) }
              fullWidth
              disabled={data.isDisabled}
              InputProps={customInputProps}
              InputLabelProps={customInputLabelProps}
              // onChange={ updateField.bind(this, 'address[0].line')}
              //floatingLabelFixed={true}
              // hintText='South Side'
              /><br/>
          </Grid>
                 
        </Grid>
        <div id="qualificationArray" style={{ paddingLeft: '10px', borderLeft: '4px double lightgray', marginTop: '20px'}}>
          { practitionerArray }
        </div>  


        {/* { this.displayQualifications(this.data.practitionerId) }      */}
      </CardContent>
      {/* <CardActions>
        { this.determineButtons(this.data.practitionerId) }
      </CardActions> */}
    </div>
  );
}

PractitionerDetail.propTypes = {
  id: PropTypes.string,
  fhirVersion: PropTypes.string,
  primaryColor: PropTypes.string,
  practitionerId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  practitioner: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};
PractitionerDetail.defaultProps = {
  primaryColor: "#E5537E"
};
export default PractitionerDetail;