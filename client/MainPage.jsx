import React, { useEffect, useState } from 'react';

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Session } from 'meteor/session';


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

import { EndpointsTable, OrganizationsTable, PractitionersTable } from 'meteor/clinical:hl7-fhir-data-infrastructure';

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

// function DynamicSpacer(props){
//   return(<div style={{height: props.height}}></div>)
// }

function MainPage(props){
  const classes = useStyles();

  let [ showSearchResults, setShowSearchResults ] = useState(false);
  let [ searchTerm, setSearchTerm ] = useState('');
  let [ matchedEndpoints, setMatchedEndpoints ] = useState([]);
  let [ matchedOrganizations, setMatchedOrganizations ] = useState([]);
  let [ matchedPractitioners, setMatchedPractitioners ] = useState([]);

  let [ endpointPageIndex, setEndpointPageIndex ] = useState(0);
  let [ organizationPageIndex, setOrganizationPageIndex ] = useState(0);
  let [ practitionerPageIndex, setPractitionerPageIndex ] = useState(0);

  let [ serverStats, setServerStats ] = useState({
    Organizations: 0,
    Practitioners: 0,
    HealthcareServices: 0,
    InsurancePlans: 0,
    Endpoints: 0,
    Networks: 0,
    Locations: 0  
  }) 


  // let orgCount = 0;
  // let practitionerCount = 0;
  // let healthServicesCount = 0;
  // let insurancePlansCount = 0;
  // let endpointsCount = 0;
  // let networksCount = 0;
  // let locationsCount = 0;

  //----------------------------------------------------------------------
  // Startup / End
  
  useEffect(function(){
    HTTP.get('/stats', function(error, result){
      if(result){
        let parsedContent = JSON.parse(result.content);
        console.log(parsedContent);

        setServerStats({
          Organizations: get(parsedContent, 'collections.organizations'),
          Practitioners: get(parsedContent, 'collections.practitioners'),
          HealthcareServices: get(parsedContent, 'collections.healthcareServices'),
          InsurancePlans: get(parsedContent, 'collections.insurancePlans'),
          Endpoints: get(parsedContent, 'collections.endpoints'),
          Networks: get(parsedContent, 'collections.networks'),
          Locations: get(parsedContent, 'collections.locations')
        })
      }
    })
  }, []);

  //----------------------------------------------------------------------
  // Trackers
  
  useTracker(function(){
    setServerStats(ServerStats.findOne())
    return;
  }, [])
  
  // orgCount = useTracker(function(){
  //   return Organizations.find().count();
  // }, [])
  // practitionerCount = useTracker(function(){
  //   return Practitioners.find().count();
  // }, [])
  // healthServicesCount = useTracker(function(){
  //   return HealthcareServices.find().count();
  // }, [])
  // insurancePlansCount = useTracker(function(){
  //   return InsurancePlans.find().count();
  // }, [])
  // let matchedEndpoints = useTracker(function(){
  //   return Endpoints.find({name: searchTerm}).fetch();
  // }, [])
  console.log('matchedEndpoints', matchedEndpoints)
  // networksCount = useTracker(function(){
  //   return Networks.find().count();
  // }, [])
  // locationsCount = useTracker(function(){
  //   return Locations.find().count();
  // }, [])



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
  function openPage(url){
    props.history.replace(url)
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

  if(Meteor.isCordova){
    pageStyle.width = '100%';
    pageStyle.padding = 20;
    pageStyle.marginLeft = '0px';
    pageStyle.marginRight = '0px';
  }

  function openPage(url){
    props.history.replace(url)
  }
  
  function handleExactMatchSearch(){
    console.log('Conducting exact match search...');
    if(searchTerm.length > 0){
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
    setMatchedEndpoints(Endpoints.find({name: searchTerm}).fetch());
    setMatchedOrganizations(Organizations.find({name: searchTerm}).fetch());
    setMatchedPractitioners(Practitioners.find({'name.text': searchTerm}).fetch());

    setEndpointPageIndex(0);
    setOrganizationPageIndex(0);
    setPractitionerPageIndex(0);
  }
  function handleFuzzySearch(){
    console.log('Conducting fuzzy search...');

    if(searchTerm.length > 0){
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
    setMatchedEndpoints(Endpoints.find({name: {$regex: searchTerm, $options:"i"}}).fetch());
    setMatchedOrganizations(Organizations.find({name: {$regex: searchTerm, $options:"i"}}).fetch());
    setMatchedPractitioners(Practitioners.find({'name.text': {$regex: searchTerm, $options:"i"}}).fetch());

    setEndpointPageIndex(0);
    setOrganizationPageIndex(0);
    setPractitionerPageIndex(0);
  }
  function handleChangeSearchTerm(event){
    setSearchTerm(event.currentTarget.value);    
  }

  let headerHeight = LayoutHelpers.calcHeaderHeight();
  let formFactor = LayoutHelpers.determineFormFactor();
  let paddingWidth = LayoutHelpers.calcCanvasPaddingWidth();

  let mainContent;
  if(showSearchResults){

    let endpointResultsCard;
    let organizationResultsCard;
    let practitionerResultsCard;

    

    if(matchedEndpoints.length > 0){
      let hideEndpointPagination = true;
      if(matchedEndpoints.length > 5){
        hideEndpointPagination = false;
      }
      endpointResultsCard = <StyledCard margin={20} style={{marginTop: '0px', paddingTop: '0px', marginBottom: '20px', width: '100%'}}>    
        <CardHeader title={matchedEndpoints.length + " Endpoints"} style={{marginBottom: '0px', paddingBottom: '0px'}} />
        <CardContent style={{marginTop: '0px', marginLeft: '20px', marginRight: '20px'}}>
          <EndpointsTable 
            endpoints={matchedEndpoints}
            disablePagination={hideEndpointPagination}
            rowsPerPage={5}
            count={matchedEndpoints.length}
            page={endpointPageIndex}
            onSetPage={function(index){
              setEndpointPageIndex(index)
            }}
          />
        </CardContent>
      </StyledCard>
    }

    if(matchedOrganizations.length > 0){
      let hideOrgPagination = true;
      if(matchedEndpoints.length > 5){
        hideOrgPagination = false;
      }
      organizationResultsCard = <StyledCard margin={20} style={{marginTop: '0px', paddingTop: '0px', marginBottom: '20px', width: '100%'}}>    
        <CardHeader title={matchedOrganizations.length + " Organizations"} style={{marginBottom: '0px', paddingBottom: '0px'}} />
        <CardContent style={{marginTop: '0px', marginLeft: '20px', marginRight: '20px'}}>
          <OrganizationsTable 
            organizations={matchedOrganizations}
            disablePagination={hideOrgPagination}
            rowsPerPage={5}
            hideActionIcons={true}
            hideIdentifier={true}
            count={matchedOrganizations.length}
            page={organizationPageIndex}
            onSetPage={function(index){
              setOrganizationPageIndex(index)
            }}
          />
        </CardContent>
      </StyledCard>
    }

    if(matchedPractitioners.length > 0){
      let hidePractitionerPagination = true;
      if(matchedEndpoints.length > 5){
        hidePractitionerPagination = false;
      }
      practitionerResultsCard = <StyledCard margin={20} style={{marginTop: '0px', paddingTop: '0px', marginBottom: '20px', width: '100%'}}>    
        <CardHeader title={matchedPractitioners.length + " Practitioners"} style={{marginBottom: '0px', paddingBottom: '0px'}} />
        <CardContent style={{marginTop: '0px', marginLeft: '20px', marginRight: '20px'}}>
          <PractitionersTable 
            practitioners={matchedPractitioners}
            disablePagination={hidePractitionerPagination}
            rowsPerPage={5}
            hideActionIcons={true}
            count={matchedPractitioners.length}
            page={practitionerPageIndex}
            onSetPage={function(index){
              setPractitionerPageIndex(index)
            }}
          />
        </CardContent>
      </StyledCard>
    }

    mainContent = <Grid container spacing={1} justify="center" style={{marginBottom: '20px'}}>
      <Grid item xs={12} sm={12} style={{marginTop: '20px', marginBottom: '80px'}} >
        
        { endpointResultsCard }
        { organizationResultsCard }
        { practitionerResultsCard }
        
      </Grid>
    </Grid>
  } else {
    mainContent = <Grid container spacing={1} justify="center" style={{marginBottom: '20px'}}>
      <Grid item xs={12} sm={6} style={{marginTop: '20px'}} >
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
            <h4>Contact Us</h4>
            <p>
              To request an account to the system, email: <a href="mailto://awatson@mitre.org">awatson@mitre.org</a>
            </p>
          </CardContent>
        </StyledCard>
      </Grid>
      <Grid item xs={12} sm={6} style={{marginTop: '20px'}}>
        <StyledCard margin={20} style={{marginBottom: '20px', width: '100%'}}>
          <CardHeader title="Workflows" />
          <CardContent>
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
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  }

  return (
    <PageCanvas id='MainPage' headerHeight={headerHeight} paddingLeft={10} paddingRight={10}>
      <Container maxWidth="lg" style={{paddingBottom: '84px'}} >
        <CardHeader title="Server Stats" style={{paddingBottom: '0px', marginBottom: '0px', marginTop: '20px'}} />
        <Grid container spacing={1} justify="center" >
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/organizations')} >
              <CardHeader title={get(serverStats, "Organizations", "0") } subheader="Organizations"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/practitioners')} >
              <CardHeader title={get(serverStats, "Practitioners", "0")} subheader="Practitioners"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/healthcare-services')} >
              <CardHeader title={get(serverStats, "HealthcareServices", "0")} subheader="Healthcare Services"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/insurance-plans')} >
              <CardHeader title={get(serverStats, "InsurancePlans", "0")} subheader="Insurance Plans"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/endpoints')} >
              <CardHeader title={get(serverStats, "Endpoints", "0")} subheader="Endpoints"  />
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} onClick={openPage.bind(this, '/locations')} >
              <CardHeader title={get(serverStats, "Locations", "0")} subheader="Locations"  />
            </StyledCard>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{marginBottom: '0px'}}>
          <Grid item xs={12}>
            <StyledCard margin={20} style={{width: '100%', cursor: 'pointer'}} >
              <CardContent>
                <TextField 
                  label="Search"
                  placeholder="Dr. House | Chicago | CurrentLocation"
                  onChange={handleChangeSearchTerm.bind(this)}
                  value={searchTerm}
                  InputLabelProps={{
                    shrink: true
                  }}
                  fullWidth
                />
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={ handleExactMatchSearch.bind(this) }
                >Exact Match</Button>
                <Button
                  variant="contained"
                  onClick={ handleFuzzySearch.bind(this) }
                >Fuzzy Search</Button>
              </CardActions>
            </StyledCard>
          </Grid>
        </Grid>

        { mainContent }
      </Container>
    </PageCanvas>
  );
}

export default MainPage;