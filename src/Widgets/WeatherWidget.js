import React, { useContext, Fragment, useMemo } from 'react';
import { ListItem, Grid, Typography, makeStyles, Divider, CircularProgress, SvgIcon } from '@material-ui/core';
import { OpenWeatherContext } from '../contexts/OpenWeatherContextProvider';

import Icons from '../Icons';
import { MainContext } from '../contexts/MainContextProvider';
import { HubContext } from '../contexts/HubContextProvider';

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: 0
  },
  
  spacer: {
    height: theme.spacing(2)
  },

  dividerRight: {
    borderRight: `1px solid ${theme.palette.divider}`
  },

  dividerBottom: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },

  dividerTop: {
    borderTop: `1px solid ${theme.palette.divider}`
  },

  disclaimerText: {
    display: 'inline-block',
    width: '100%',
    boxSizing: 'border-box',

    paddingRight: 2,

    textAlign: 'right',
    
  }
}));

function TypeToIcon(type) {
  switch(type) {
    case 'Clear':
    return Icons.mdiWeatherSunny;

    case 'Clouds':
    return Icons.mdiWeatherCloudy;

    case 'Drizzle':
    return Icons.mdiWeatherRainy;

    case 'Rain':
    return Icons.mdiWeatherPouring;

    case 'Thunderstorm':
    return Icons.mdiWeatherLightning;

    case 'Snow':
    return Icons.mdiWeatherSnowy;

    case 'Atmosphere':
    return Icons.mdiWeatherFog;

    default:
    return Icons.mdiAlertCircle;
  }
}

export default function() {
  const classes = useStyles();

  const { config } = useContext(MainContext);
  const weatherConfig = config.weather;

  const { devices } = useContext(HubContext);
  const { loaded, error, current: currentWeather, future: futureWeather } = useContext(OpenWeatherContext);

  const indoorTemp = weatherConfig.useHubDeviceForIndoorTemp && weatherConfig.indoorTempHubDevice.device && weatherConfig.indoorTempHubDevice.attribute ? Math.round(devices[weatherConfig.indoorTempHubDevice.device].attributes[weatherConfig.indoorTempHubDevice.attribute].currentState) : false;
  const outdoorTemp = Math.round(weatherConfig.useHubDeviceForOutdoorTemp && weatherConfig.outdoorTempHubDevice.device && weatherConfig.outdoorTempHubDevice.attribute ? devices[weatherConfig.outdoorTempHubDevice.device].attributes[weatherConfig.outdoorTempHubDevice.attribute].currentState : (loaded && !error ? currentWeather.temp : 0));

  const futureWeatherParsed = loaded && !error ? futureWeather.map((data) => {
    return {
      low: Math.round(data.temp.min),
      high: Math.round(data.temp.max),

      clouds: data.clouds,
      
      day: new Intl.DateTimeFormat('en-us', { weekday: 'short' }).format(new Date(data.dt * 1000)),
      main: data.weather[0].main
    }
  }) : {};

  return (
    <ListItem className={classes.listItem}>
      <Grid container direction="row" justify="center" wrap>
        {!loaded && <CircularProgress />}
        {error && <Typography>There was an error getting the weather</Typography>}
        {loaded && !error &&
          <Fragment>
            <Grid item xs={12} className={classes.dividerBottom}>
              <Grid container direction ="row" alignItems="center">
                
                <Grid item xs={4}>
                  { weatherConfig.useHubDeviceForIndoorTemp && <CurrentOverview current={indoorTemp} /> }
                </Grid>

                <Grid item xs={4}>
                  <CurrentWeather precip={currentWeather.clouds} type={currentWeather.weather[0].main} />
                </Grid>

                <Grid item xs={4}>
                  <CurrentOverview current={outdoorTemp} low={futureWeatherParsed[0].low} high={futureWeatherParsed[0].high} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={4} className={classes.dividerRight}>
              <Day label={futureWeatherParsed[1].day} low={futureWeatherParsed[1].low} high={futureWeatherParsed[1].high} precip={futureWeatherParsed[1].clouds} type={futureWeatherParsed[1].main} />
            </Grid>

            <Grid item xs={4} className={classes.dividerRight}>
              <Day label={futureWeatherParsed[2].day} low={futureWeatherParsed[2].low} high={futureWeatherParsed[2].high} precip={futureWeatherParsed[2].clouds} type={futureWeatherParsed[2].main} />
            </Grid>

            <Grid item xs={4}>
              <Day label={futureWeatherParsed[3].day} low={futureWeatherParsed[3].low} high={futureWeatherParsed[3].high} precip={futureWeatherParsed[3].clouds} type={futureWeatherParsed[3].main} />
            </Grid>

            <Grid item xs={12} className={classes.dividerTop}>
              <Typography variant="caption" className={classes.disclaimerText}>Data from OpenWeatherMap.com</Typography>
            </Grid>
          </Fragment>
        }
      </Grid>
    </ListItem>
  );
}

const useDayStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2)
  }
}));

function Day({ label, low, high, precip, type }) {
  const classes = useDayStyles();
  const Icon = TypeToIcon(type);

  return (
    <Grid container className={classes.container} direction="column" alignItems="center">
      <Grid item>
        <Typography align="center">
          {label}
        </Typography>
      </Grid>

      <Grid itemRef>
        <Icon />
      </Grid>

      <Grid itemType>
        <Typography align="center" variant="subtitle2">
          {low}{"\u00B0"} / {high}{"\u00B0"}
        </Typography>
      </Grid>

      <Grid item>
        <Typography align="center" variant="caption">
          {precip}%
        </Typography>
      </Grid>
    </Grid>

  );
}

const useCWStyles = makeStyles(theme => ({
  spacer: {
    flexBasis: theme.spacing(2)
  },

  bigIcon: {
    fontSize: theme.typography.fontSize * 4
  }
}));

function CurrentWeather({ precip, type }) {
  const classes = useCWStyles();

  const Icon = TypeToIcon(type);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12}>
        <Icon className={classes.bigIcon} />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" align="center">
          {precip}%
        </Typography>
      </Grid>

      <Grid item xs={12} className={classes.spacer} />
    </Grid>
  );
}

function CurrentOverview({ current, low, high }) {
  return (
    <Grid container direction="column" alignItems="center">
      <Grid item>
        <Typography variant="h4" align="center">
          {current}{"\u00B0"}
        </Typography>
      </Grid>

      {low && high ? 
        <Grid item>
          <Typography align="center" variant="subtitle2">
            {low}{"\u00B0"} / {high}{"\u00B0"}
          </Typography>
        </Grid>
      : null}
    </Grid>
  );
}