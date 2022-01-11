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
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { get } from 'lodash';
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
  button: {}
}));





function ServerConfigurationPage(props){
  const classes = useStyles();

  let [ wellKnownUdapUrl, setWellKnownUdapUrl ] = useState(Meteor.absoluteUrl() + ".well-known/udap");
  let [ certificate, setCertificate ] = useState([]);
  let [ publicKey, setPublicKey ] = useState("");
  let [ privateKey, setPrivateKey ] = useState("");
  let [ serverHasPublicKey, setServerHasPublicKey] = useState(false);
  let [ serverHasPrivateKey, setServerHasPrivateKey] = useState(false);

  let [ publicKeyPem, setPublicKeyPem ] = useState("");
  let [ privateKeyPem, setPrivateKeyPem ] = useState("");

  useEffect(function(){
    if(Meteor.isClient){
      Meteor.call('hasServerKeys', function(error, result){
        if(result){
          console.log('.ServerConfigurationPage.useEffect', result);
          setServerHasPublicKey(get(result, 'x509.publicKey'));
          setServerHasPrivateKey(get(result, 'x509.privateKey'));
          setPublicKeyPem(get(result, 'x509.publicKey'))
        }
      })  
    }
  }, [])

  let currentUser = useTracker(function(){
    return Session.get('currentUser');
  }, []);

  // const formik = useFormik({
  //   initialValues: {
  //     iss: 'http://example.com/my-b2b-app',
  //     sub: 'http://example.com/my-b2b-app',
  //     aud: 'https://oauth.example.net/register',
  //     exp: '1597186041',
  //     iat: '1597186041',
  //     jti: 'random-value-109a3bd72',
  //     client_name: 'Acme B2B App',
  //     redirect_uris: '',
  //     contacts: "mailto:b2b-operations@example.com",
  //     logo_uri: '',
  //     grant_types: "client_credentials",
  //     response_types: "",
  //     token_endpoint_auth_method: "private_key_jwt",
  //     scope: 'system/Patient.read system/Procedure.read'
  //   },
  //   validate: function(values){
  //     const errors = {};
      
  //     if (!values.iss) {
  //       errors.iss = 'Required';
  //     }
  //     if (!values.sub) {
  //       errors.sub = 'Required';
  //     }
  //     if (!values.aud) {
  //       errors.aud = 'Required';
  //     }
  //     if (!values.exp) {
  //       errors.exp = 'Required';
  //     }
  //     if (!values.iat) {
  //       errors.iat = 'Required';
  //     }
  //     if (!values.jti) {
  //       errors.jti = 'Required';
  //     }
  //     if (!values.client_name) {
  //       errors.client_name = 'Required';
  //     }
  //     if (!values.contacts) {
  //       errors.contacts = 'Required';
  //     }
  //     if (!values.grant_types) {
  //       errors.grant_types = 'Required';
  //     }
  //     if (!values.token_endpoint_auth_method) {
  //       errors.token_endpoint_auth_method = 'Required';
  //     }
  //     if (!values.scope) {
  //       errors.scope = 'Required';
  //     }
  //     return errors;
  //   },
  //   onSubmit: async function(values, { setSubmitting }){

  //     console.log('Trying to register UDAP client...')
  //     // console.log('values', values);

  //     let jwtPayload = {
  //       iss: get(values, 'iss'),
  //       sub: get(values, 'sub'),
  //       aud: get(values, 'aud'),
  //       exp: parseInt(get(values, 'exp')),
  //       iat: parseInt(get(values, 'iat')),
  //       jti: get(values, 'jti'),
  //       client_name: get(values, 'client_name'),
  //       redirect_uris: get(values, 'redirect_uris'),
  //       contacts: [get(values, 'contacts')],
  //       logo_uri: get(values, 'logo_uri'),
  //       grant_types: [get(values, 'grant_types')],
  //       response_types: get(values, 'response_types'),
  //       token_endpoint_auth_method: get(values, 'token_endpoint_auth_method'),
  //       scope: get(values, 'scope')
  //     }

  //     let jwtHeader = {
  //       "alg": "RS256",
  //       "x5c": []
  //     };

  //     console.log('jwtHeader', jwtHeader)
  //     console.log('jwtPayload', jwtPayload);


  //     // try {
  //     //   // HMAC SHA256
  //     //   // var hmacSha256Token = jwt.sign(jwtPayload, 'shhhhh');
  //     //   // console.log('hmacSha256Token', hmacSha256Token);

  //     //   // var rs256Token = jwt.sign(jwtPayload, jwtHeader.x5c, {algorithm: jwtHeader.alg});
  //     //   // console.log('rs256Token', rs256Token);

  //     //   // Meteor.call('generateAndSignCertificate', jwtPayload, function(error, signResult){
  //     //   //   if(error){
  //     //   //     console.log('error', error);
  //     //   //   }
  //     //   //   if(signResult){
  //     //   //     console.log('signResult', signResult);

  //     //   //     // if we have a certificate from the server, we can begin constructing the JWT header
  //     //   //     // note:  may want to move this server side
  //     //   //     if(get(signResult, 'token')){
  //     //   //       let decoded = jwt.decode(get(signResult, 'token'));

  //     //   //       console.log('decoded', decoded)
  //     //   //     }

  //     //   //     // now we can construct the JWT 
            

  //     //   //   }
  //     //   // })
  

  //     // } catch (err) {
  //     //   console.log('err', err)
  //     // }
  //   }
  // });


  // //----------------------------------------------------------------------
  // // Carousel  

  // const responsive = {
  //   desktop: {
  //     breakpoint: { max: 3000, min: 1024 },
  //     items: 3,
  //     paritialVisibilityGutter: 60
  //   },
  //   tablet: {
  //     breakpoint: { max: 1024, min: 464 },
  //     items: 2,
  //     paritialVisibilityGutter: 50
  //   },
  //   mobile: {
  //     breakpoint: { max: 464, min: 0 },
  //     items: 1,
  //     paritialVisibilityGutter: 30
  //   }
  // };


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

    var publicKeyPem = pki.publicKeyToPem(keys.publicKey);
    console.log('publicKeyPem', JSON.stringify(publicKeyPem))

    setPublicKeyPem(JSON.stringify(publicKeyPem))

    var privateKeyPem = pki.privateKeyToPem(keys.privateKey);
    console.log('privateKeyPem', JSON.stringify(privateKeyPem))

    setPrivateKeyPem(JSON.stringify(privateKeyPem))

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
          value={publicKeyPem}
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
      <CardHeader title="Generate Keys" subheader="No X.509 certificates were detected on the server. You will want to generate keys and then copy them to the Meteor settings file.  Be sure to include the /n newline characters!" />
      <CardContent >
        <TextField
          label="Public Key"
          fullWidth={true}
          id="publicKey"
          type="publicKey"
          value={publicKeyPem}
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
          value={privateKeyPem}
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
        >Generate</Button>
      </CardContent>
    </StyledCard>
  }

  let initSampleDataElements;
  let upstreamServerSyncButton;
  if(currentUser){
    initSampleDataElements = <StyledCard margin={20} style={{marginBottom: '20px', width: '100%'}}>
      <CardContent>
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


    upstreamServerSyncButton = <Button
      variant="contained"
      fullWidth
      onClick={ handleSyncUpstreamDirectory.bind(this) }
    >Sync Upstream Directory</Button>
  }

  let upstreamServer = get(Meteor, 'settings.public.interfaces.oauthServer.channel.endpoint', '')
  let upstreamServerElements = <StyledCard margin={20} style={{width: '100%'}}  >
      <CardContent>
        <TextField
          label="Upstream Directory"
          fullWidth={true}
          id="upstreamDirectory"
          type="upstreamDirectory"
          value={upstreamServer}
          style={{marginBottom: '10px'}}
        />
        { upstreamServerSyncButton }
      </CardContent>
    </StyledCard>

  return (
    <PageCanvas id='ServerConfigurationPage' headerHeight={headerHeight} paddingLeft={10} paddingRight={10}>
      
      <Container maxWidth="lg" style={{paddingBottom: '80px'}}>
        <Grid container spacing={3} justify="center" style={{marginBottom: '20px'}}>
          <Grid item xs={6} sm={6}>
            { serverPublicKeyElems }
            { serverPrivateKeyElems }
            { generateKeyElems }
            { upstreamServerElements }
            { initSampleDataElements }
          </Grid>
        </Grid>
      </Container>

    </PageCanvas>
  );
}

export default ServerConfigurationPage;