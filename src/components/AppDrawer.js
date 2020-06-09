import React, { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import $ from 'jquery';

import { Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Drawer, Badge, Button } from '@material-ui/core';

import { Link } from 'react-router-dom';

import Icons, { getIcon } from '../Icons';

import { makeStyles } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

import { withRouter } from 'react-router';
import ClockWidget from '../Widgets/ClockWidget';
import { endpoint, access_token, devMode } from '../Constants';
import { devLog } from '../Utils';
import useLock from './useLock';
import WeatherWidget from '../Widgets/WeatherWidget';
import { OpenWeatherContext } from '../contexts/OpenWeatherContextProvider';
import { HubContext } from '../contexts/HubContextProvider';

const useStyles = makeStyles(theme => ({
  drawerList: {
    width: '100%',
    height: '100%',
    padding: 0,
    
    display: 'flex',
    flexFlow: 'column nowrap'
  },

  drawer: {
    width: 300,
    boxShadow: `0 0 16px 0 ${theme.palette.grey[900]}`
  },

  drawerIconsOnly: {
    width: theme.spacing(7) + 1,
    overflowX: 'hidden'
  },

  listItemSpacer: {
    flex: '1 0 0'
  },

  bottomListContainer: {
    padding: 0
  },

  bottomList: {
    padding: 0,

    width: '100%',
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between'
  },

  bottomListItem: {
    display: 'inline-block',

    width: 'auto',
    padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px`,

    '&.right': {
      borderRight: `1px solid ${theme.palette.divider}`
    },

    '&.left': {
      borderLeft: `1px solid ${theme.palette.divider}`
    },

    '&.bottom': {
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  }
}));

function AppDrawer({ location }) {
  const classes = useStyles();

  const { dashboards, config } = useContext(MainContext);
  const { sync } = useContext(OpenWeatherContext);

  const subLocation = location.pathname.substr(1);

  const [locked, openDialog, providedDialog] = useLock();

  const uiDashboards = dashboards.map((dashboard, index) => {
    return <DashboardDrawerItem key={dashboard.id} index={index} dashboard={dashboard} location={subLocation} hideText={config.iconsOnly} />
  });

  return (
    <Drawer variant="permanent" className={config.iconsOnly ? classes.drawerIconsOnly : classes.drawer} classes={{ paper: config.iconsOnly ? classes.drawerIconsOnly : classes.drawer }}>
      <List className={classes.drawerList}>
        {config.showTitle ?
          <Fragment>
            <ListItem className={classes.drawerAppBar}>
              <ListItemText disableTypography>
                <Typography variant="h6">
                  {config.title}
                </Typography>
              </ListItemText>
            </ListItem>
            <Divider />
          </Fragment> :
          null
        }

        {config.showClock && config.clockOnTop ?
          <Fragment>
            <ClockDrawerItem />
            <Divider />
          </Fragment>
          : null
        }

        {uiDashboards}

        <div className={classes.listItemSpacer} />
        <Divider />

        {config.showWeather && 
          <Fragment>
            <WeatherWidget />
            <Divider />
          </Fragment>
        }

        {config.showClock && !config.clockOnTop ?
          <Fragment>
            <ClockDrawerItem />
            <Divider />
          </Fragment>
        : null
        }

        <ListItem className={classes.bottomListContainer}>
          <List className={classes.bottomList}>
              <ListItem button className={`${classes.bottomListItem} ${!config.iconsOnly ? 'right' : 'bottom'}`} component={Link} to={`/settings/${window.location.search}`} selected={subLocation === 'settings/'} disabled={locked !== -1 && config.lockSettings}>
                <Icons.mdiCog color="action" />
              </ListItem>
              
              <div>
                <ListItem button className={`${classes.bottomListItem}  ${!config.iconsOnly ? 'left' : 'bottom'}`} onClick={sync}>
                  <Icons.mdiSync color="action" />
                </ListItem>

                <ListItem button className={`${classes.bottomListItem} ${!config.iconsOnly && 'left'}`} onClick={openDialog}>
                  {locked !== -1 ? <Icons.mdiLockOpen color="action" /> : <Icons.mdiLock color="action" />}
                </ListItem>
              </div>
          </List>
        </ListItem>

        {providedDialog}
      </List>
    </Drawer>
  );
}

//util for tracking dashboard state to handle notifications
function useNotifications(dashboardId) {
  const { allDashboards, devices } = useContext(HubContext);

  const layout = allDashboards[dashboardId].layout.tiles;

  const notifications = useMemo(() => {
    return layout.map(it => it.device).filter(it => {
      return devices[it] && (devices[it].t === 'switch' || devices[it].t === 'fan' || devices[it].t === 'bulb-color' || devices[it].t === 'button' || devices[it].t === 'dimmer');
    }).map(it => devices[it]).filter(it => it.attr && it.attr.switch && it.attr.switch.value === 'on').length;
  }, [devices, layout]);

  return notifications;
}

function ClockDrawerItem() {
  return (
    <ListItem>
      <ListItemText disableTypography>
        <ClockWidget />
      </ListItemText>
    </ListItem>
  )
}

function DashboardDrawerItem({ index, dashboard, location, ...props }) {
  const { locked, config } = useContext(MainContext);

    const Icon = getIcon(dashboard.iconName);

    const notifications = useNotifications(dashboard.id);

    return (
      <Fragment>
        <DrawerItem label={dashboard.label} badgeCount={notifications} Icon={Icon} disabled={locked !== -1 && config.lockFully && dashboard.lock} component={Link} to={`/${index}/${window.location.search}`} selected={index === parseInt(location)} {...props} />
        <Divider />
      </Fragment>
    );
}

const useDrawerItemStyles = makeStyles(theme => ({
  textHidden: {
    padding: theme.spacing(2)
  }
}));

//visual drawer item
function DrawerItem({ label, badgeCount, Icon, onClick, selected, selectedColor = 'primary', hideText, ...props }) {
  const classes = useDrawerItemStyles();

  const booleanColor = bool => {
    return bool ? selectedColor : undefined;
  }

  return (
    <ListItem className={hideText && classes.textHidden} button {...props} onClick={onClick} selected={selected}>
      <ListItemIcon>
        <Badge badgeContent={badgeCount} color="secondary">
          <Icon />
        </Badge>
      </ListItemIcon>
      {!hideText &&
        <ListItemText primaryTypographyProps={{ color: booleanColor(selected) }}>
            {label}
        </ListItemText>
      }
    </ListItem>
  );
}


export default withRouter(AppDrawer);