import React, { useState, useEffect } from 'react';

import { useFormik, FormikErrors } from 'formik';

import { 
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardContent,
  CardMedia,
  Container,
  Grid,  
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Image,
  Typography,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Input,
  InputLabel,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ClassIcon from '@material-ui/icons/Class';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import LocationOnIcon from '@material-ui/icons/LocationOn';

import { get, has } from 'lodash';
import { DynamicSpacer, PageCanvas, StyledCard } from 'fhir-starter';

import { useTracker } from 'meteor/react-meteor-data';

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import jwt from 'jsonwebtoken';

import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/icomoon/home';
import {ic_vpn_key} from 'react-icons-kit/md/ic_vpn_key';

import {keyOutline} from 'react-icons-kit/typicons/keyOutline'
import {key} from 'react-icons-kit/typicons/key'


import forge from 'node-forge';

let pki = forge.pki;

// import { LayoutHelpers } from 'clinical:hl7-fhir-data-infrastructure';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 345,
  },
  media: {
    minHeight: 400,
  },
  open_stack: {
    minHeight: 1200,
    backgroundSize: 'contain'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {},
  button: {},
  label: {
    paddingBottom: '10px'
  }
}));





function ServerConfigurationPage(props){
  const classes = useStyles();

  let [ wellKnownUdapUrl, setWellKnownUdapUrl ] = useState(Meteor.absoluteUrl() + ".well-known/udap");
  let [ certificate, setCertificate ] = useState([]);
  let [ publicKey, setPublicKey ] = useState("");
  let [ privateKey, setPrivateKey ] = useState("");
  let [ serverHasPublicKey, setServerHasPublicKey] = useState(false);
  let [ serverHasPrivateKey, setServerHasPrivateKey] = useState(false);
  let [ serverHasPublicCert, setServerHasPublicCert] = useState(false);

  let [ publicKeyText, setPublicKeyText ] = useState("");
  let [ privateKeyText, setPrivateKeyText ] = useState("");
  let [ publicCertPem, setPublicCertPem ] = useState("");

  let [checked, setChecked] = React.useState(true);
  let handleChange = (event) => {
    setChecked(event.target.checked);
  };


  useEffect(function(){
    if(Meteor.isClient){
      Meteor.call('hasServerKeys', function(error, result){
        if(result){
          console.log('.ServerConfigurationPage.useEffect', result);
          setServerHasPublicKey(get(result, 'x509.publicKey'));
          setServerHasPrivateKey(get(result, 'x509.privateKey'));
          setServerHasPublicCert(get(result, 'x509.publicCertPem'))
          setPublicKeyText(get(result, 'x509.publicKey'))
          setPublicCertPem(get(result, 'x509.publicCertPem'))
        }
      })  
    }
  }, []);

  let currentUser = useTracker(function(){
    return Session.get('currentUser');
  }, []);


  function openExternalPage(url){
    logger.debug('client.app.layout.ServerConfigurationPage.openExternalPage', url);
    window.open(url);
    // props.history.replace(url)
  }

  //----------------------------------------------------------------------
  // Page Styling 


  let pageStyle = {
    paddingLeft: '0px', 
    paddingRight: '0px',
    position: 'absolute',
    top: '0px'
  }

  //----------------------------------------------------------------------
  // Main Render Method  

  

  let tagLineStyle = {
    fontWeight: 'normal',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '0px',
    marginBottom: '40px'
  }

  let featureRowStyle = {
    height: '52px'
  }

  function openPage(url){
    props.history.replace(url)
  }

  function handelUpdateWellKnownUdapUrl(event){
    setWellKnownUdapUrl(event.currentTarget.value)
  }
  function handleFetchWellknownUdap(){
    console.log('wellKnownUdapUrl', wellKnownUdapUrl);

    HTTP.get(wellKnownUdapUrl, function(error, result){
      if(error){
        console.log('handleFetchWellknownUdap.error', error)
      }
      if(result){
        console.log('handleFetchWellknownUdap.result.data', get(result, 'data'))

        alert(result.data.x5c[0]);
        
        if(Array.isArray(get(result, 'data.x5c'))){
          console.log('x.509 cert: ' + result.data.x5c[0]);
          setCertificate(result.data.x5c);          
        }
        
      }
    })
  }
  function generateKeys(){
    let keys = pki.rsa.generateKeyPair(2048);
    console.log('keys', keys)

    var publicKeyText = pki.publicKeyToPem(keys.publicKey);
    console.log('publicKeyText', JSON.stringify(publicKeyText))

    setPublicKeyText(JSON.stringify(publicKeyText))

    var privateKeyText = pki.privateKeyToPem(keys.privateKey);
    console.log('privateKeyText', JSON.stringify(privateKeyText));

    setPrivateKeyText(JSON.stringify(privateKeyText))
  }
  function handleGenerateCert(){
    console.log("Generating certificate...");

    Meteor.call('generateCertificate', function(error, certificatePem){
      if(error){
        console.log('error', error)
      }
      if(certificatePem){
        console.log('certificatePem', certificatePem)

        setPublicCertPem(certificatePem)
      }
    })
  }
  function handleSyncLantern(){
    console.log("Syncing lantern...")

    Meteor.call('syncLantern', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function handleSyncProviderDirectory(){
    console.log("Syncing provider directory...")

    Meteor.call('syncProviderDirectory', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function handleSyncUpstreamDirectory(){
    console.log("Syncing upstream directory...");

    Meteor.call('syncUpstreamDirectory', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function initCodeSystems(){
    console.log("Initializing code systems...");

    Meteor.call('initCodeSystems', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function initUsCore(){
    console.log("Initializing US Core...");

    Meteor.call('initUsCore', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function initSearchParameters(){
    console.log("Initializing search parameters...");

    Meteor.call('initSearchParameters', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function initStructureDefinitions(){
    console.log("Initializing structure definitions...");

    Meteor.call('initStructureDefinitions', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }
  function initValueSets(){
    console.log("Initializing value sets...");

    Meteor.call('initValueSets', function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        console.log('result', result)
      }
    })
  }

  function handleOpenTypes(){
    Session.set('mainAppDialogTitle', "Search States & Territories");
    Session.set('mainAppDialogComponent', "SearchStatesDialog");
    Session.set('lastUpdated', new Date());
    Session.set('mainAppDialogMaxWidth', "md");
    Session.set('mainAppDialogOpen', true);
  }  


  let headerHeight = LayoutHelpers.calcHeaderHeight();
  let formFactor = LayoutHelpers.determineFormFactor();
  let paddingWidth = LayoutHelpers.calcCanvasPaddingWidth();

  let serverPublicKeyElems;
  if(serverHasPublicKey){
    serverPublicKeyElems = <StyledCard margin={20} style={{width: '100%', fontSize: '80%'}}  >      
      <CardHeader avatar={<Icon icon={key} size={32} />} title="Public Key Configured!" />    
      <CardContent>
        <TextField
          fullWidth={true}
          id="publicKey"
          type="publicKey"
          value={publicKeyText}
          style={{marginBottom: '10px'}}
          multiline
          InputProps={{
            style: {
              fontSize: '120%',
              fontFamily: 'monospace'
            },
            disableUnderline: true
          }}
          disabled
        />
      </CardContent>
    </StyledCard>
  }

  let serverPublicCertElems;
  if(serverHasPublicCert){
    serverPublicCertElems = <StyledCard margin={20} style={{width: '100%', fontSize: '80%'}}  >      
      <CardHeader avatar={<Icon icon={key} size={32} />} title="Public Cert Available!" />    
      <CardContent>
        <TextField
          fullWidth={true}
          id="publicCert"
          type="publicCert"
          value={publicCertPem}
          style={{marginBottom: '10px'}}
          multiline
          InputProps={{
            style: {
              fontSize: '120%',
              fontFamily: 'monospace'
            },
            disableUnderline: true
          }}
          disabled
        />
      </CardContent>
    </StyledCard> 
  }

  let serverPrivateKeyElems;
  if(serverHasPrivateKey){
    serverPrivateKeyElems = <StyledCard margin={20} style={{width: '100%', fontSize: '80%'}}  >
      <CardHeader avatar={<Icon icon={keyOutline} size={32} />} title="Private Key Configured!" />    
    </StyledCard>
  }

  let generateKeyElems;
  if(!serverHasPublicKey && !serverHasPrivateKey){
    generateKeyElems = <StyledCard margin={20} style={{width: '100%', fontSize: '80%'}}  >
      <CardHeader title="Generate Keys" subheader="No X.509 keys were detected on the server. You will want to generate keys and then copy them to the Meteor settings file.  Be sure to include the /n newline characters!" />
      <CardContent >
        <TextField
          label="Public Key"
          fullWidth={true}
          id="publicKey"
          type="publicKey"
          value={publicKeyText}
          style={{marginBottom: '10px'}}
          multiline
          InputProps={{
            style: {
              fontSize: '120%',
              fontFamily: 'monospace'
            }
          }}
        />
        <TextField
          label="Private Key"
          fullWidth={true}
          id="privateKey"
          type="privateKey"
          value={privateKeyText}
          style={{marginBottom: '10px'}}
          multiline
          InputProps={{
            style: {
              fontSize: '120%',
              fontFamily: 'monospace'
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={generateKeys.bind(this)}
        >Generate Keys</Button>
      </CardContent>
    </StyledCard>
  }

  let generateCertElems;
  if(!serverHasPublicCert){
    generateCertElems = <StyledCard margin={20} style={{width: '100%', fontSize: '80%'}}  >
      <CardHeader title="Generate Cert" subheader="No X.509 certificates were detected on the server. You will want to generate the certificate and then copy it to the Meteor settings file. " />
      <CardContent >
        <TextField
          label="Public Cert"
          fullWidth={true}
          id="publicCert"
          type="publicCert"
          value={JSON.stringify(publicCertPem)}
          style={{marginBottom: '10px'}}
          multiline
          InputProps={{
            style: {
              fontSize: '120%',
              fontFamily: 'monospace'
            }
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateCert.bind(this)}
        >Generate Cert</Button>
      </CardContent>
    </StyledCard>
  }

  let initSampleDataElements;
  let isDisabled = true;
  if(currentUser){
    isDisabled = false;
    initSampleDataElements = <StyledCard margin={20} style={{marginBottom: '20px', width: '100%'}}>
      <CardContent>        
        <Button
          variant="contained"
          fullWidth
          onClick={ initUsCore.bind(this) }
        >Init US Core</Button>
        <DynamicSpacer />
        <Button
          variant="contained"
          fullWidth
          onClick={ initCodeSystems.bind(this) }
        >Init Code Systems</Button>
        <DynamicSpacer />
        <Button
          variant="contained"
          fullWidth
          onClick={ initSearchParameters.bind(this) }
        >Init Search Parameters</Button>
        <DynamicSpacer />
        <Button
          variant="contained"
          fullWidth
          onClick={ initStructureDefinitions.bind(this) }
        >Init Structure Definitions</Button>
        <DynamicSpacer />
        <Button
          variant="contained"
          fullWidth
          onClick={ initValueSets.bind(this) }
        >Init Value Sets</Button>
        <DynamicSpacer />
        <Button
          variant="contained"
          fullWidth
          onClick={ handleSyncLantern.bind(this) }
        >Sync Lantern</Button>
        <DynamicSpacer />
        <Button
          variant="contained"
          fullWidth
          onClick={ handleSyncProviderDirectory.bind(this) }
        >Sync Provider Directory</Button>
        
      </CardContent>
    </StyledCard>
  }


  let upstreamServerSyncButton = <Button
    variant="contained"
    fullWidth
    onClick={ handleSyncUpstreamDirectory.bind(this) }
  >Sync Upstream Directory</Button>

  let upstreamServer = get(Meteor, 'settings.public.interfaces.upstreamDirectory.channel.endpoint', '')
  let upstreamServerElements = <StyledCard margin={20} style={{width: '100%'}}  >
      <CardHeader title="Upstream Directory" />
      <CardContent>
        <TextField
          label="Upstream Directory"
          fullWidth={true}
          id="upstreamDirectory"
          type="upstreamDirectory"
          value={upstreamServer}
          style={{marginBottom: '10px'}}
          // InputProps={{
          //   disableUnderline: true
          // }}
          disabled={isDisabled}
        />        
        <Grid container spacing={3} justify="center" style={{paddingTop: '20px'}}>
          <Grid item xs={12} container spacing={3} style={{padding: '0px', margin: '0px'}}>
            <Grid item xs={4}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>State</InputLabel>
                <Input
                  id="stateOrJurisdiction"
                  name="stateOrJurisdiction"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="Illinois"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>              
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Postal Code</InputLabel>
                <Input
                  id="postalCode"
                  name="postalCode"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="60618"
                  disabled={isDisabled}
                  // endAdornment={
                  //   <InputAdornment position="end">
                  //     <IconButton
                  //       aria-label="toggle type select"
                  //       onClick={ handleOpenTypes.bind(this) }
                  //     >
                  //       <SearchIcon />
                  //     </IconButton>
                  //   </InputAdornment>
                  // }           
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Nation</InputLabel>
                <Input
                  id="nation"
                  name="nation"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="U.S.A."
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>
            </Grid>
          </Grid>

          <Grid item xs={12} container spacing={3} style={{padding: '0px', margin: '0px'}}>
            <Grid item xs={4}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Longitude</InputLabel>
                <Input
                  id="longitude"
                  name="longitude"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="-130.12322"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <LocationOnIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>              
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Latitude</InputLabel>
                <Input
                  id="latitude"
                  name="latitude"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="83.12356"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <LocationOnIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Distance</InputLabel>
                <Input
                  id="distance"
                  name="distance"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="50"
                  disabled={isDisabled}
                />
              </FormControl>      
            </Grid>
            <Grid item xs={2}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Units</InputLabel>
                <Input
                  id="distanceUnits"
                  name="distanceUnits"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="miles"
                  disabled={isDisabled}
                />
              </FormControl>               
            </Grid>
          </Grid>


          <Grid item xs={12} container spacing={3} style={{padding: '0px', margin: '0px'}}>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Practitioner Specialty</InputLabel>
                <Input
                  id="practitionerSpecialty"
                  name="practitionerSpecialty"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="Cardiologist"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <AssignmentIndIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>              
            </Grid>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Practitioner Qualification</InputLabel>
                <Input
                  id="practitionerQualifications"
                  name="practitionerQualifications"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="Medical Doctor"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <PersonIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={3} style={{padding: '0px', margin: '0px'}}>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Payor Network</InputLabel>
                <Input
                  id="payorNetwork"
                  name="payorNetwork"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="Blue Cross Blue Shield"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <CollectionsBookmarkIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>              
            </Grid>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Insurance Plan</InputLabel>
                <Input
                  id="insurancePlan"
                  name="insurancePlan"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="BCBS PPO Silver"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <ClassIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>              
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={3} style={{padding: '0px', margin: '0px'}}>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Healthcare Service</InputLabel>
                <Input
                  id="healthcareService"
                  name="healthcareService"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="Physical Therapy"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <LocalPlayIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>              
            </Grid>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>CareTeam Specialty</InputLabel>
                <Input
                  id="careteamSpecialty"
                  name="careteamSpecialty"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="Sports Injury Specialists"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={3} style={{padding: '0px', margin: '0px'}}>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Endpoint Type</InputLabel>
                <Input
                  id="endpointType"
                  name="endpointType"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="HL7 FHIR"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl style={{width: '100%', marginTop: '0px'}}>
                <InputLabel className={classes.label}>Security</InputLabel>
                <Input
                  id="endpointSignature"
                  name="endpointSignature"
                  className={classes.input}   
                  // value={FhirUtilities.pluckCodeableConcept(get(activeHealthcareService, 'type[0]'))}
                  // onChange={updateField.bind(this, 'type[0].text')}
                  fullWidth    
                  type="text"
                  placeholder="RS256"
                  disabled={isDisabled}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle type select"
                        onClick={ handleOpenTypes.bind(this) }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }           
                />
              </FormControl>
            </Grid>
          </Grid>
        <DynamicSpacer height={40} />
        </Grid>
        <Grid item xs={12} style={{paddingTop: '20px', paddingBottom: '20px'}}>
          <FormControlLabel
            control={<Checkbox checked={false} onChange={handleChange} />}
            label="Daily"
            disabled={isDisabled}
          />
          <FormControlLabel
            control={<Checkbox checked={false} onChange={handleChange} />}
            label="Weekly"
            disabled={isDisabled}
          />
          <FormControlLabel
            control={<Checkbox checked={false} onChange={handleChange} />}
            label="Monthly"
            disabled={isDisabled}
          />
          <FormControlLabel
            control={<Checkbox checked={false} onChange={handleChange} />}
            label="Last Updated"
            disabled={isDisabled}
          />
        </Grid>
        { upstreamServerSyncButton }

      </CardContent>
    </StyledCard>

  return (
    <PageCanvas id='ServerConfigurationPage' headerHeight={headerHeight} paddingLeft={10} paddingRight={10}>
      
      <Container maxWidth="lg" style={{paddingBottom: '80px'}}>
        <Grid container spacing={3} justify="center" style={{marginBottom: '20px'}}>
          <Grid item xs={6} sm={6}>
            { serverPrivateKeyElems }
            { serverPublicKeyElems }
            { serverPublicCertElems }
            { generateKeyElems }
            { generateCertElems }
          </Grid>
          <Grid item xs={6} sm={6}>
            { upstreamServerElements }
            { initSampleDataElements }
          </Grid>
        </Grid>
      </Container>

    </PageCanvas>
  );
}

export default ServerConfigurationPage;