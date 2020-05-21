import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Drawer } from '@material-ui/core';

import { Link } from 'react-router-dom';

import * as Icons from '@material-ui/icons';

import { makeStyles } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

import { withRouter } from 'react-router';
import Clock from './Clock';

const useStyles = makeStyles(theme => ({
  drawerList: {
    width: '100%',
    height: '100%',
    padding: 0,
    
    display: 'flex',
    flexFlow: 'column nowrap'
  },

  drawer: {
    width: 300
  },

  drawerIconsOnly: {
    width: theme.spacing(7) + 1,
    overflowX: 'hidden'
  },

  listItemSpacer: {
    flex: '1 0 0'
  }
}));

function AppDrawer({ location, iconsOnly }) {
  const classes = useStyles();

  const { dashboards, title } = useContext(MainContext);

  const subLocation = location.pathname.substr(1);

  const uiDashboards = dashboards.map((dashboard, index) => {
    return <DashboardDrawerItem key={dashboard.id} index={index} dashboard={dashboard} location={subLocation} hideText={iconsOnly} />
  });

  return (
    <Drawer variant="permanent" className={iconsOnly ? classes.drawerIconsOnly : classes.drawer} classes={{ paper: iconsOnly ? classes.drawerIconsOnly : classes.drawer }}>
      <List className={classes.drawerList}>
        {!iconsOnly ?
          <Fragment>
            <ListItem className={classes.drawerAppBar}>
              <ListItemText disableTypography>
                <Typography variant="h6">
                  {title}
                </Typography>
              </ListItemText>
            </ListItem>
            <Divider />
          </Fragment> :
          null
        }

        {uiDashboards}

        <div className={classes.listItemSpacer} />
        <Divider />

        <DrawerItem label="Settings" Icon={Icons.Settings} component={Link} to={`/settings/${window.location.search}`} selected={subLocation == 'settings/'} hideText={iconsOnly} />
        <Divider />
        {!iconsOnly ?
          <Fragment>
            <ListItem className={classes.drawerAppBar}>
              <ListItemText disableTypography>
                <Clock />
              </ListItemText>
            </ListItem>
            <Divider />
          </Fragment> : null
        }
      </List>
    </Drawer>
  );
}

function DashboardDrawerItem({ index, dashboard, location, ...props }) {
    const Icon = Icons[dashboard.iconName];

    return (
      <Fragment>
        <DrawerItem label={dashboard.label} Icon={Icon} component={Link} to={`/${index}/${window.location.search}`} selected={index === parseInt(location)} {...props} />
        <Divider />
      </Fragment>
    );
}

//visual drawer item
function DrawerItem({ label, Icon, onClick, selected, selectedColor = 'primary', hideText, ...props }) {
  const booleanColor = bool => {
    return bool ? selectedColor : undefined;
  }

  return (
    <ListItem button {...props} onClick={onClick} selected={selected}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primaryTypographyProps={{ color: booleanColor(selected) }}>
          {!hideText ? label : '-'}
      </ListItemText>
    </ListItem>
  );
}


export default withRouter(AppDrawer);