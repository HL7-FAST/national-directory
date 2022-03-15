import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { 
  Card,
  CardHeader,
  CardContent,
  Button,
  Tab, 
  Tabs,
  Typography,
  Box,
  TextField
} from '@material-ui/core';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';




import { get, has } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import JSON5 from 'json5';

import { FhirUtilities, DynamicSpacer, ValueSets, ValueSetDetail } from 'meteor/clinical:hl7-fhir-data-infrastructure';





export function SearchStatesDialog(props){

  const [tabIndex, setTabIndex] = useState(0);


  let certificate = useTracker(function(){
    return Session.get('newUdapCertificate');
  }, []);
  let certificateOwner = useTracker(function(){
    return Session.get('newUdapCertificateOwner');
  }, []);
  let usStateCodes = useTracker(function(){
    return ValueSets.findOne({id: 'us-core-usps-state'});
  }, []);
  console.log('usStateCodes', usStateCodes)

  let { 
    children, 
    id,
    // error,
    errorMessage,
    jsonContent,
    ...otherProps 
  } = props;

  let textToRender = "";
  if(jsonContent && !errorMessage){
    errorMessage = jsonContent;
  }

  // console.log('SearchStatesDialog', errorMessage)

  if(errorMessage){
    if(typeof errorMessage === "string"){
      textToRender = errorMessage
    } else if(typeof errorMessage === "object") {
      textToRender = JSON.stringify(errorMessage, null, 2);
    }
  } 
  

  function handleTabChange(event, newIndex){
    setTabIndex(newIndex);
  }

  function handleSetCertificateOwner(event){
    
    // setCertificateOwner(value)
    Session.set('newUdapCertificateOwner', event.currentTarget.value)
  }
  function handleSetCertificate(event){
    // setCertificate(value)
    Session.set('newUdapCertificate',  event.currentTarget.value)
  }

  // --------------------------------------------------------------------------------------------------------------------------------
  // Rendering


  let labelRowStyle = {
    clear: 'both'
  }
  let labelStyle = {
    float: 'left',
    width: '160px',
    margin: '0px'
  }
  let valueStyle = {
    float: 'left',
    whiteSpace: 'pre',
    textOverflow: 'ellipsis',
    position: 'absolute'
  }
  let blockStyle = {
    clear: 'both'
  }
  let separatorStyle = {
    marginTop: '40px', 
    marginBottom: '20px', 
    clear: 'both',
    height: '2px'
  }

  return(
    <DialogContent id={id} className="SearchStatesDialog" style={{width: '100%'}} dividers={scroll === 'paper'}>      
      <TextField
        id="search"
        type="search"
        label="Search"
        fullWidth={true}
        value={ certificateOwner }
        onChange={ handleSetCertificateOwner.bind(this) }
        // error={Boolean(formik.errors.email && formik.touched.email)}
        // helperText={formik.touched.email && formik.errors.email}
      />
      <DynamicSpacer />
      <ValueSetDetail 
        valueSet={usStateCodes}
        hideTitleElements={true}
        hideDescriptionElements={true}
        hideTable={false}
        hideConcepts={true}
      />
      

    </DialogContent>
  )
}

SearchStatesDialog.propTypes = {
  errorMessage: PropTypes.string
}
SearchStatesDialog.defaultProps = {}


export default SearchStatesDialog;