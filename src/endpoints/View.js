import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden, Paper } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import { hubIp, dashboardAppId } from '../Constants';

const useStyles = makeStyles(theme => ({
  fullFrame: {
    width: '100%',
    height: '100%',
    border: 'none',

    position: 'absolute'
  }
}));

//only render if we have an index
function View({ index, preload }) {
  const classes = useStyles();

  const { token, dashboards } = useContext(MainContext);

  const frames = dashboards.map((dashboard, i) => <iframe key={dashboard.id} style={{ visibility: index === i ? 'visible' : 'hidden'}} className={classes.fullFrame} src={`${hubIp}apps/api/${dashboardAppId}/dashboard/${dashboard.id}?access_token=${token}`} title="Hubitat" />);

  return (
    <Paper square elevation={0} style={{ display: isNaN(index) ? 'none' : 'initial' }}>
      {preload ? frames : !isNaN(index) && <iframe className={classes.fullFrame} src={`${hubIp}apps/api/${dashboardAppId}/dashboard/${dashboards[index].id}?access_token=${token}`} title="Hubitat" />}
    </Paper>
  );
}

export default View;