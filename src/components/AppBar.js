import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Drawer, BottomNavigationAction, BottomNavigation } from '@material-ui/core';

import { Link } from 'react-router-dom';

import Icons, { getIcon } from '../Icons';

import { makeStyles } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

import { withRouter, useHistory } from 'react-router';
import { pushHistoryPreserve } from '../Utils';

const useStyles = makeStyles(theme => ({
  
}));

function AppBar({ location, iconsOnly }) {
  const classes = useStyles();

  const { dashboards, locked, config } = useContext(MainContext);

  const subLocation = location.pathname.substr(1);
  const history = useHistory();

  const handleChange = (e, value) => {
    if(value < 4) pushHistoryPreserve(history, `/${value}/`);
    else {
      pushHistoryPreserve(history, '/more/');
    }
  }

  let uiDashboards = new Array(4);

  for(let i = 0; i < Math.min(dashboards.length, 4); i++) {
    const dashboard = dashboards[i];
    const Icon = getIcon(dashboard.iconName);
    uiDashboards[i] = <BottomNavigationAction key={dashboard.id} disabled={locked !== -1 && config.lock.lockFully && dashboard.lock} icon={<Icon />} />
  }
  uiDashboards[4] = <BottomNavigationAction key={"more"} icon={<Icons.mdiDotsHorizontal />} />

  return (
    <BottomNavigation value={!isNaN(parseInt(subLocation)) ? Math.min(parseInt(subLocation), 4) : 4} onChange={handleChange}>
      {uiDashboards}
    </BottomNavigation>
  );
}

export default withRouter(AppBar);