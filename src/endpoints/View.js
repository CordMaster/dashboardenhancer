import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

const useStyles = makeStyles(theme => ({
  fullFrame: {
    width: '100%',
    height: '100%',
    border: 'none',

    position: 'absolute'
  }
}));

function View({ index, preload }) {
  const classes = useStyles();

  const { token, dashboards } = useContext(MainContext);

  const frames = dashboards.map((dashboard, i) => <iframe key={dashboard.id} style={{ visibility: index === i ? 'visible' : 'hidden'}} className={classes.fullFrame} src={`http://192.168.1.211/apps/api/1/dashboard/${dashboard.id}?access_token=${token}`} title="Hubitat" />);

  return (
    <Fragment>
      {preload ? frames : <iframe className={classes.fullFrame} src={`http://192.168.1.211/apps/api/1/dashboard/${dashboards[index].id}?access_token=${token}`} title="Hubitat" />}
    </Fragment>
  );
}

export default View;