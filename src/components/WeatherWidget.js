import React, { useContext } from 'react';
import { ListItem, Grid, Typography, makeStyles } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { OpenWeatherContext } from '../contexts/OpenWeatherContextProvider';

const useStyles = makeStyles(theme => ({
  spacer: {
    height: theme.spacing(2)
  }
}));

function TypeToIcon(type) {
  switch(type) {
    case 'Clear':
    return Icons.WbSunny;

    case 'Clouds':
    return Icons.WbCloudyOutlined;

    case 'Rain':
    return Icons.WbCloudy;

    default:
    return Icons.Error;
  }
}

export default function() {
  const classes = useStyles();

  const { loaded, error, current: currentWeather, future: futureWeather } = useContext(OpenWeatherContext);

  const futureWeatherParsed = loaded && !error ? futureWeather.map((data) => {
    return {
      low: Math.round(data.temp.min),
      high: Math.round(data.temp.max),

      clouds: data.clouds,
      
      day: new Intl.DateTimeFormat('en-us', { weekday: 'short' }).format(new Date(data.dt * 1000)),
      main: data.weather[0].main
    }
  }) : {};

  if(loaded && !error) {
    return (
      <ListItem>
        <Grid container direction="row" wrap>
          <Grid item xs={12}>
            <Grid container direction ="row">
              <Grid item xs={4}>
                <CurrentOverview current={72} low={70} high={75} />
              </Grid>

              <Grid item xs={4}>
                <CurrentWeather precip={currentWeather.clouds} type={currentWeather.weather[0].main} />
              </Grid>

              <Grid item xs={4}>
                <CurrentOverview current={currentWeather.temp} low={futureWeatherParsed[0].low} high={futureWeatherParsed[0].high} />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Day label={futureWeatherParsed[1].day} low={futureWeatherParsed[1].low} high={futureWeatherParsed[1].high} precip={futureWeatherParsed[1].clouds} type={futureWeatherParsed[1].main} />
          </Grid>

          <Grid item xs={4}>
            <Day label={futureWeatherParsed[2].day} low={futureWeatherParsed[2].low} high={futureWeatherParsed[2].high} precip={futureWeatherParsed[2].clouds} type={futureWeatherParsed[2].main} />
          </Grid>

          <Grid item xs={4}>
            <Day label={futureWeatherParsed[3].day} low={futureWeatherParsed[3].low} high={futureWeatherParsed[3].high} precip={futureWeatherParsed[3].clouds} type={futureWeatherParsed[3].main} />
          </Grid>
        </Grid>
      </ListItem>
    );
  } else {
    return "Loading";
  }
}

function Day({ label, low, high, precip, type }) {
  const Icon = TypeToIcon(type);

  return (
    <Grid container direction="column" alignItems="center">
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
          {low} / {high}
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
  }
}));

function CurrentWeather({ precip, type }) {
  const classes = useCWStyles();

  const Icon = TypeToIcon(type);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12} className={classes.spacer} />

      <Grid item xs={12}>
        <Icon fontSize="large" />
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
        <Typography variant="h6" align="center">
          {current}
        </Typography>
      </Grid>

      <Grid item>
        <Typography align="center" variant="subtitle2">
          {low} / {high}
        </Typography>
      </Grid>
    </Grid>
  );
}