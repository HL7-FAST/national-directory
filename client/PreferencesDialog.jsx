import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { 
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  FormControlLabel,
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

import { ValueSetSelection } from './ValueSetSelection';



// SearchResourceTypesDialog


export function PreferencesDialog(props){

  const [showExperimental, setShowExperimental] = useState(false);
  const [onlyShowMatched, setOnlyShowMatched] = useState(false);


  let { 
    children, 
    id,
    // error,
    errorMessage,
    jsonContent,
    ...otherProps 
  } = props;

  // let showExperimental = useTracker(function(){
  //   return Session.get('showExperimental');
  // }, [])
  

  function handleToggleShowExperimental(event, newValue){
    setShowExperimental(newValue);
    Session.set('showExperimental', newValue);
  }
  function handleToggleOnlyShowMatched(event, newValue){
    setOnlyShowMatched(newValue);
    Session.set('onlyShowMatched', newValue);
  }
  function openPage(url){
    props.history.replace(url)
  }

  return(
    <DialogContent id={id} className="PreferencesDialog" style={{width: '100%'}} dividers={scroll === 'paper'}>      
      
      <FormControlLabel                
        control={<Checkbox checked={showExperimental} onChange={handleToggleShowExperimental} name="toggleShowExperimental" />}
        label="Show experimental search options"
      />
      <FormControlLabel                
        control={<Checkbox checked={onlyShowMatched} onChange={handleToggleOnlyShowMatched} name="toggleShowExperimental" />}
        label="Only show Orgs with matched names and addresses"
      />
      <DynamicSpacer />      
      <Button
        variant="contained"
        fullWidth
        onClick={ openPage.bind(this, '/server-configuration')}
      >Configure Server</Button>
      <DynamicSpacer />
      <Button
        variant="contained"
        fullWidth
        onClick={ openPage.bind(this, '/udap-registration')}
      >Register App</Button>
      <DynamicSpacer />
      <Button
        variant="contained"
        fullWidth
        onClick={ openPage.bind(this, '/verification-results')}
      >Validation Queue</Button>
      
    </DialogContent>
  )
}

PreferencesDialog.propTypes = {
  errorMessage: PropTypes.string
}
PreferencesDialog.defaultProps = {}


export default PreferencesDialog;