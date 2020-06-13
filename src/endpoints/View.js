import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden, Paper } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import { hubIp, dashboardAppId, dashboardAccessToken } from '../Constants';
import EnhancedView from './EnhancedView';

const useStyles = makeStyles(theme => ({
  fullPaper: {
    height: '100%'
  },

  fullFrame: {
    width: '100%',
    height: '100%',

    border: 'none',
  }
}));

//only render if we have an index
function View({ index, preload, isSmall }) {
  const { dashboards, locked, config } = useContext(MainContext);

  const blockingStyles = {
    pointerEvents: locked !== -1 && !config.lockFully ? 'none' : 'initial',
    touchAction: locked !== -1 && !config.lockFully ? 'none' : 'initial'
  }

  if(config.overridePanelView) return <EnhancedViewAll dashboards={dashboards} index={index} blockingStyles={blockingStyles} preload={preload} isSmall={isSmall} />
  else return <ClassicView dashboards={dashboards} index={index} blockingStyles={blockingStyles} preload={preload} />
}

function EnhancedViewAll({ dashboards, index, blockingStyles, preload, isSmall }) {
  const classes = useStyles();

  const frames = dashboards.map((dashboard, i) => <EnhancedView key={dashboard.id} index={i} className={classes.fullFrame} style={{ display: index === i ? 'block' : 'none', ...(dashboard.lock ? blockingStyles : null), overflowY: isSmall ? 'auto' : 'initial' }} isSmall={isSmall} />);

  return (
    <Fragment>
      {preload ? frames : !isNaN(index) && <EnhancedView className={classes.fullFrame} index={index} style={{ ...(dashboards[index].lock ? blockingStyles : null), overflowY: isSmall ? 'auto' : 'initial' }} isSmall={isSmall} /> }
    </Fragment>
  );
}

function ClassicView({ dashboards, index, blockingStyles, preload }) {
  const classes = useStyles();

  const frames = dashboards.map((dashboard, i) => <iframe key={dashboard.id} style={{ display: index === i ? 'block' : 'none', ...(dashboard.lock ? blockingStyles : null) }} className={classes.fullFrame} src={`http://${hubIp}/apps/api/${dashboardAppId}/dashboard/${dashboard.id}?access_token=${dashboardAccessToken}`} title="Hubitat" />);

  return (
    <Paper square elevation={0} className={classes.fullPaper}>
      {preload ? frames : !isNaN(index) && <iframe style={{ ...(dashboards[index].lock && blockingStyles) }} className={classes.fullFrame} src={`http://${hubIp}/apps/api/${dashboardAppId}/dashboard/${dashboards[index].id}?access_token=${dashboardAccessToken}`} title="Hubitat" />}
    </Paper>
  );
}

export default View;