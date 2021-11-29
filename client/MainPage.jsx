import React from 'react';

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
import { PageCanvas, StyledCard } from 'fhir-starter';

import { Icon } from 'react-icons-kit';
import { github } from 'react-icons-kit/fa/github';
import {lightbulbO} from 'react-icons-kit/fa/lightbulbO'
import {puzzlePiece} from 'react-icons-kit/fa/puzzlePiece'
import {map} from 'react-icons-kit/fa/map'
import {amazon} from 'react-icons-kit/fa/amazon'
import {lowVision} from 'react-icons-kit/fa/lowVision'
import {addressCard} from 'react-icons-kit/fa/addressCard'
import {pieChart} from 'react-icons-kit/fa/pieChart'
import {wechat} from 'react-icons-kit/fa/wechat'
import {filePdfO} from 'react-icons-kit/fa/filePdfO'
import {database} from 'react-icons-kit/fa/database'
import {institution} from 'react-icons-kit/fa/institution'
import {speech_bubbles} from 'react-icons-kit/ikons/speech_bubbles'
import {ic_ac_unit} from 'react-icons-kit/md/ic_ac_unit'
import {font} from 'react-icons-kit/fa/font'
import {barcode} from 'react-icons-kit/fa/barcode'
import {cogs} from 'react-icons-kit/fa/cogs'
import {server} from 'react-icons-kit/fa/server'
import {snowflakeO} from 'react-icons-kit/fa/snowflakeO'
import {location} from 'react-icons-kit/icomoon/location'
import {aidKit} from 'react-icons-kit/icomoon/aidKit'
import {chain} from 'react-icons-kit/fa/chain'
import {dashboard} from 'react-icons-kit/fa/dashboard'
import {hospitalO} from 'react-icons-kit/fa/hospitalO'
import {medkit} from 'react-icons-kit/fa/medkit'
import {codeFork} from 'react-icons-kit/fa/codeFork'
import {cubes} from 'react-icons-kit/fa/cubes'
import {usb} from 'react-icons-kit/fa/usb'
import {universalAccess} from 'react-icons-kit/fa/universalAccess'
import {mobileCombo} from 'react-icons-kit/entypo/mobileCombo'
import {fire} from 'react-icons-kit/icomoon/fire'
import {warning} from 'react-icons-kit/fa/warning'

import Carousel from 'react-multi-carousel';

import { useTracker } from 'meteor/react-meteor-data';

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
  fallout_button: {
    width: '100%', 
    marginTop: '20px', 
    marginBottom: '20px',
    textAlign: 'left',
    background: "repeating-linear-gradient( 45deg, rgba(253,184,19, 0.9), rgba(253,184,19, 0.9) 10px, rgba(253,184,19, 0.75) 10px, rgba(253,184,19, 0.75) 20px ), url(http://s3-us-west-2.amazonaws.com/s.cdpn.io/3/old_map_@2X.png)"
  },
  hero_button: {
    width: '100%', 
    marginTop: '20px', 
    marginBottom: '20px',
    textAlign: 'left'
  },
  tip_of_the_day: {
    width: '100%', 
    marginTop: '20px', 
    marginBottom: '20px',
    textAlign: 'left'
  }
}));

function DynamicSpacer(props){
  return(<div style={{height: props.height}}></div>)
}



function MainPage(props){
  const classes = useStyles();

  let orgCount = 0;
  let practitionerCount = 0;
  let healthServicesCount = 0;
  let insurancePlansCount = 0;
  let endpointsCount = 0;
  let networksCount = 0;

  //----------------------------------------------------------------------
  // Trackers
  
  orgCount = useTracker(function(){
    return Organizations.find().count();
  }, [])
  practitionerCount = useTracker(function(){
    return Practitioners.find().count();
  }, [])
  healthServicesCount = useTracker(function(){
    return HealthcareServices.find().count();
  }, [])
  insurancePlansCount = useTracker(function(){
    return InsurancePlans.find().count();
  }, [])
  endpointsCount = useTracker(function(){
    return Endpoints.find().count();
  }, [])
  networksCount = useTracker(function(){
    return Networks.find().count();
  }, [])



  //----------------------------------------------------------------------
  // Carousel  

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      paritialVisibilityGutter: 60
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      paritialVisibilityGutter: 50
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      paritialVisibilityGutter: 30
    }
  };


  function openExternalPage(url){
    logger.debug('client.app.layout.MainPage.openExternalPage', url);
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

  let carouselImages = get(Meteor, 'settings.public.projectPage.carouselImages', []);

  let imageItems = [];
  carouselImages.forEach(function(url, index){
    imageItems.push(<img                    
      style={{ width: "100%", height: "100%" }}
      key={"image-" + index}
      src={url}
    />);
  });

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

  if(Meteor.isCordova){
    pageStyle.width = '100%';
    pageStyle.padding = 20;
    pageStyle.marginLeft = '0px';
    pageStyle.marginRight = '0px';
  }

  function openPage(url){
    props.history.replace(url)
  }

  let headerHeight = LayoutHelpers.calcHeaderHeight();
  let formFactor = LayoutHelpers.determineFormFactor();
  let paddingWidth = LayoutHelpers.calcCanvasPaddingWidth();

  return (
    <PageCanvas id='MainPage' headerHeight={headerHeight} paddingLeft={10} paddingRight={10}>
      <Container maxWidth="lg">
        <Grid container spacing={1} justify="center" style={{marginBottom: '20px'}}>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/organizations')} >
              <CardHeader title={orgCount} subheader="Organizations"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/practitioners')} >
              <CardHeader title={practitionerCount} subheader="Practitioners"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/healthcare-services')} >
              <CardHeader title={healthServicesCount} subheader="Healthcare Services"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/insurance-plans')} >
              <CardHeader title={insurancePlansCount} subheader="Insurance Plans"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/endpoints')} >
              <CardHeader title={endpointsCount} subheader="Endpoints"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/networks')} >
              <CardHeader title={networksCount} subheader="Networks"  />
            </StyledCard>
          </Grid>
        </Grid>
        <Grid container justify="center" style={{paddingBottom: '80px'}}>
          <StyledCard margin={20} style={{marginBottom: '20px', width: '100%'}}>
            <CardHeader title="Getting Started" />
            <CardContent style={{marginLeft: '20px', marginRight: '20px'}}>
              <h4>About</h4>
              <p>
                This server implements the <a href="https://build.fhir.org/ig/HL7/davinci-pdex-plan-net/StructureDefinition-plannet-Location.html" target="_blank">HL7 DaVinci PDEX Plan Net Implementation Guide</a>.
              </p>
              <h4>API Connectivity</h4>
              <p>
                To access the directory via API, you will want to use a tool like <a href="https://www.postman.com/" target="_blank">Postman</a>, and then connect to the following URLs:  
              </p>
              <code>
                GET <a href="https://vhdir.meteorapp.com/baseR4/metadata" target="_blank">https://vhdir.meteorapp.com/baseR4/metadata</a>  <br />
                GET <a href="https://vhdir.meteorapp.com/baseR4/Organization" target="_blank">https://vhdir.meteorapp.com/baseR4/Organization</a> <br />
                GET <a href="https://vhdir.meteorapp.com/baseR4/Endpoint" target="_blank">https://vhdir.meteorapp.com/baseR4/Endpoint</a> <br />
                GET <a href="https://vhdir.meteorapp.com/baseR4/HealthcareService" target="_blank">https://vhdir.meteorapp.com/baseR4/HealthcareService</a> <br />
              </code>
            </CardContent>
          </StyledCard>

          <StyledCard margin={20} style={{marginBottom: '20px'}}>
            <CardHeader title="Open Source Infrastructure" />
            <CardContent>
              <Table size="small" >
                <TableHead>
                  <TableRow >
                    <TableCell style={{fontWeight: 'bold'}} >Feature</TableCell>
                    <TableCell style={{fontWeight: 'bold'}} >Library</TableCell>
                    <TableCell style={{fontWeight: 'bold'}} >Vendor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                  <TableCell>FHIR Client with ES6 classes, cross-version support, testing, etc.  </TableCell>
                    <TableCell>fhir-kit-client</TableCell>
                    <TableCell>Vermonster</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FHIR Client from the developers of the SMART specification.</TableCell>
                    <TableCell>fhirclient</TableCell>
                    <TableCell>smarthealthit</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FHIR Client with good Angular and jQuery support.</TableCell>
                    <TableCell>fhir.js</TableCell>
                    <TableCell>Aidbox</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Node FHIR Server</TableCell>
                    <TableCell>node-fhir-server-core</TableCell>
                    <TableCell>Asymmetrik</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Typescript definitions</TableCell>
                    <TableCell>ts-fhir-types</TableCell>
                    <TableCell>Ahryman40k</TableCell>
                  </TableRow>
                  <TableRow>
                  <TableCell>Blue Button to FHIR DSTU2 converter</TableCell>
                    <TableCell>blue-button-fhir</TableCell>
                    <TableCell>Amida Technology</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FHIRPath parser</TableCell>
                    <TableCell>fhirpath</TableCell>
                    <TableCell>HL7</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FHIR validator for R4</TableCell>
                    <TableCell>json-schema-resource-validation</TableCell>
                    <TableCell>VictorGus</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilities to check SMART on FHIR scope access</TableCell>
                    <TableCell>sof-scope-checker</TableCell>
                    <TableCell>Asymmetrik</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilities for extracting addresses</TableCell>
                    <TableCell>fhir-list-addresses</TableCell>
                    <TableCell>careMESH</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilities to hydrate argonaut form data into FHIR objects</TableCell>
                    <TableCell>fhir-helpers</TableCell>
                    <TableCell>jackruss</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilities to hydrate argonaut form data into FHIR objects</TableCell>
                    <TableCell>fhir-helpers</TableCell>
                    <TableCell>jackruss</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>HL7 v2 parser, serializer, validator and tcp client/server.</TableCell>
                    <TableCell>hl7v2</TableCell>
                    <TableCell>panates</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>HL7v2 parser/generator from Redox.  Battle tested.</TableCell>
                    <TableCell>redox-hl7-v2</TableCell>
                    <TableCell>Redox</TableCell>
                  </TableRow>
                  
                </TableBody>
              </Table>
              </CardContent>
            </StyledCard>


          <StyledCard style={{marginBottom: '20px'}}>
            <CardHeader title="Change Log" subheader="A huge amount of new features have gone into Node on FHIR since v0.3.0, easily making this the most feature packed release ever.  " />
            <CardContent style={{padding: '20px', marginLeft: '40px'}}>
              <Typography gutterBottom variant="h6" component="h2">
                v0.4.0 - Patient Charting with SMART on FHIR
              </Typography>
              <ul>
                <li>Upgraded to the official SMART on FHIR client library.</li>
                <li>Added provider launch context.</li>
                <li>Added a basic patient chart with most of the Argonaut / USCDI FHIR resources.</li>
                <li>Added quicklaunch functionality to pull patient chart when being launched from an EHR.</li>
                <li>Autoconfiguration checks Capability Statement on launch, and adjusts queries accordingly.</li>
                <li>No Data cards and workflows.</li>
                <li>Added additional Clinical Parameters to Bulk Data Fetch. </li>
                <li>Updated license terms to MIT, in consideration of pandemic response.</li>
                <li>Updated privacy policy to reflect redesigned example page.</li>
              </ul>
              <Typography gutterBottom variant="h6" component="h2">
                v0.3.2 - COVID19 - Geocoding, Heatmaps, and Measure Reports
              </Typography>
              <ul>
                <li>Google Maps integration, with markers and heatmaps.</li>
                <li>Geocoding pipelines codes Address datatypes into Locations with Lat/Lng</li>
                <li>Sidebar Workflows separated from FHIR Resource links.</li>
                <li>Server side hospital index with 2dsphere index.</li>
                <li>Proximity searches on both client and server using $near operator.</li>
                <li>Map controls for radius, opacity, and max intensity.  Toggle labels and markers on/off.</li>
                <li>Covid19-Reporting plugin which includes Measure and Measure Reports.</li>
                <li>Sample data includes grocers file, CDC measures, and hospital index file.</li>
              </ul>
              <Typography gutterBottom variant="h6" component="h2">
                v0.3.1 - COVID19 - FHIR Queries
              </Typography>
              <ul>
                <li>Replaced the old example plugin with the Covid19 on FHIR plugin.</li>
                <li>Preliminary integration with Synthea via the Covid19 Module.</li>
                <li>Validated bulk data query operations with Covid19 related LOINC and SNOMED codes.</li>
                <li>Major updates to resource tables in the HL7 FHIR Data Infrastructure package.</li>
              </ul>
            </CardContent>
          </StyledCard>


        </Grid>
      </Container>

    </PageCanvas>
  );
}

export default MainPage;