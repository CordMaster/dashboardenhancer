import React, { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import $ from 'jquery';

import { Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Drawer, Badge, Button } from '@material-ui/core';

import { Link } from 'react-router-dom';

import * as Icons from '@material-ui/icons';

import { makeStyles } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

import { withRouter } from 'react-router';
import Clock from './Clock';
import { endpoint, access_token, devMode } from '../Constants';
import { devLog } from '../Utils';
import useLock from './useLock';
import WeatherWidget from './WeatherWidget';
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
    width: 300
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

  const { dashboards, config, lockSettings } = useContext(MainContext);

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
              <ListItem button className={`${classes.bottomListItem} ${!config.iconsOnly ? 'right' : 'bottom'}`} component={Link} to={`/settings/${window.location.search}`} selected={subLocation === 'settings/'}>
                <Icons.Settings color="action" />
              </ListItem>
              
              <div>
                <ListItem button className={`${classes.bottomListItem}  ${!config.iconsOnly ? 'left' : 'bottom'}`}>
                  <Icons.Refresh color="action" />
                </ListItem>

                <ListItem button className={`${classes.bottomListItem} ${!config.iconsOnly && 'left'}`} onClick={openDialog}>
                  {locked !== -1 ? <Icons.LockOpen color="action" /> : <Icons.Lock color="action" />}
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
  const { config } = useContext(MainContext);
  const { devices } = useContext(HubContext);

  const [layout, setLayout] = useState([]);

  useEffect(() => {
    //get layout if we are showing badges
    if(config.showBadges) {
      $.get(`${endpoint}getDashboardLayout/${dashboardId}/?access_token=${access_token}`, (data) => {
        setLayout(data.tiles);
        devLog(`Got layout for: ${dashboardId}`);
        devLog(data);
      });
    } else {
      setLayout([]);
    }
  }, [config.showBadges, dashboardId]);

  const notifications = useMemo(() => {
    return layout.map(it => it.device).filter(it => {
      return devices[it] && (devices[it].t === 'switch' || devices[it].t === 'fan' || devices[it].t === 'bulb-color' || devices[it].t === 'button' || devices[it].t === 'dimmer');
    }).map(it => devices[it].attr.find(it => it['switch'])).filter(it => it && it.switch === 'on').length;
  }, [devices, layout]);

  return notifications;
}

function ClockDrawerItem() {
  return (
    <ListItem>
      <ListItemText disableTypography>
        <Clock />
      </ListItemText>
    </ListItem>
  )
}

function DashboardDrawerItem({ index, dashboard, location, ...props }) {
  const { locked, lockFully } = useContext(MainContext);

    const Icon = Icons[dashboard.iconName];

    const notifications = useNotifications(dashboard.id);

    return (
      <Fragment>
        <DrawerItem label={dashboard.label} badgeCount={notifications} Icon={Icon} disabled={locked !== -1 && lockFully && dashboard.lock} component={Link} to={`/${index}/${window.location.search}`} selected={index === parseInt(location)} {...props} />
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