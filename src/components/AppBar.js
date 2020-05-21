import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Drawer, BottomNavigationAction, BottomNavigation } from '@material-ui/core';

import { Link } from 'react-router-dom';

import * as Icons from '@material-ui/icons';

import { makeStyles } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

import { withRouter, useHistory } from 'react-router';
import { pushHistoryPreserve } from '../Utils';

const useStyles = makeStyles(theme => ({
  
}));

function AppBar({ location, iconsOnly }) {
  const classes = useStyles();

  const { dashboards } = useContext(MainContext);

  const subLocation = location.pathname.substr(1);
  const history = useHistory();

  const handleChange = (e, value) => {
    if(value < 3) pushHistoryPreserve(history, `/${value}/`);
    else {
      pushHistoryPreserve(history, '/more/');
    }
  }

  let uiDashboards = new Array(4);

  for(let i = 0; i < Math.min(dashboards.length, 3); i++) {
    const dashboard = dashboards[i];
    const Icon = Icons[dashboard.iconName];
    uiDashboards[i] = <BottomNavigationAction key={dashboard.id} icon={<Icon />} />
  }
  uiDashboards[3] = <BottomNavigationAction key={"more"} icon={<Icons.MoreHoriz />} />

  return (
    <BottomNavigation value={!isNaN(parseInt(subLocation)) ? Math.min(parseInt(subLocation), 3) : 3} onChange={handleChange}>
      {uiDashboards}
    </BottomNavigation>
  );
}

export default withRouter(AppBar);