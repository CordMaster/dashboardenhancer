import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden, Paper } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import { hubIp, dashboardAppId, dashboardAccessToken } from '../Constants';

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

  const { dashboards, locked, lockFully } = useContext(MainContext);

  const blockingStyles = {
    pointerEvents: locked !== -1 && !lockFully ? 'none' : 'initial',
    touchAction: locked !== -1 && !lockFully ? 'none' : 'initial'
  }

  const frames = dashboards.map((dashboard, i) => <iframe key={dashboard.id} style={{ display: index === i ? 'initial' : 'none', ...blockingStyles }} className={classes.fullFrame} src={`http://${hubIp}/apps/api/${dashboardAppId}/dashboard/${dashboard.id}?access_token=${dashboardAccessToken}`} title="Hubitat" />);

  return (
    <Paper square elevation={0} style={{ display: isNaN(index) ? 'none' : 'initial' }}>
      {preload ? frames : !isNaN(index) && <iframe style={blockingStyles} className={classes.fullFrame} src={`http://${hubIp}/apps/api/${dashboardAppId}/dashboard/${dashboards[index].id}?access_token=${dashboardAccessToken}`} title="Hubitat" />}
    </Paper>
  );
}

export default View;