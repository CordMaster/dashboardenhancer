import React, { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import $ from 'jquery';

import { Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Drawer, Badge } from '@material-ui/core';

import { Link } from 'react-router-dom';

import * as Icons from '@material-ui/icons';

import { makeStyles } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

import { withRouter } from 'react-router';
import Clock from './Clock';
import { endpoint, access_token, devMode } from '../Constants';
import { devLog } from '../Utils';

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

  const { dashboards, title, showClock, clockOnTop } = useContext(MainContext);

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
          </Fragment> :
          null
        }

        {showClock && clockOnTop ?
          <ClockDrawerItem /> : null
        }

        {uiDashboards}
        <Divider />

        <div className={classes.listItemSpacer} />
        <Divider />

        <DrawerItem label="Settings" Icon={Icons.Settings} component={Link} to={`/settings/${window.location.search}`} selected={subLocation === 'settings/'} hideText={iconsOnly} />
        {showClock && !clockOnTop ?
          <ClockDrawerItem /> : null
        }
      </List>
    </Drawer>
  );
}

//util for tracking dashboard state to handle notifications
function useNotifications(dashboardId) {
  const { devices, showBadges } = useContext(MainContext);

  const [layout, setLayout] = useState([]);

  useEffect(() => {
    //get layout if we are showing badges
    if(showBadges) {
      $.get(`${endpoint}getDashboardLayout/${dashboardId}/?access_token=${access_token}`, (data) => {
        setLayout(data.tiles);
        devLog(`Got layout for: ${dashboardId}`);
        devLog(data);
      });
    } else {
      setLayout([]);
    }
  }, [showBadges, dashboardId]);

  const notifications = useMemo(() => {
    return layout.map(it => it.device).filter(it => {
      return devices[it] && (devices[it].t === 'switch' || devices[it].t === 'fan' || devices[it].t === 'bulb-color' || devices[it].t === 'button' || devices[it].t === 'dimmer');
    }).map(it => devices[it].attr.find(it => it['switch'])).filter(it => it && it.switch === 'on').length;
  }, [devices, layout]);

  return notifications;
}

function ClockDrawerItem() {
  return (
    <Fragment>
      <Divider />
      <ListItem>
        <ListItemText disableTypography>
          <Clock />
        </ListItemText>
      </ListItem>
    </Fragment>
  )
}

function DashboardDrawerItem({ index, dashboard, location, ...props }) {
    const Icon = Icons[dashboard.iconName];

    const notifications = useNotifications(dashboard.id);

    return (
      <Fragment>
        <Divider />
        <DrawerItem label={dashboard.label} badgeCount={notifications} Icon={Icon} component={Link} to={`/${index}/${window.location.search}`} selected={index === parseInt(location)} {...props} />
      </Fragment>
    );
}

//visual drawer item
function DrawerItem({ label, badgeCount, Icon, onClick, selected, selectedColor = 'primary', hideText, ...props }) {
  const booleanColor = bool => {
    return bool ? selectedColor : undefined;
  }

  return (
    <ListItem button {...props} onClick={onClick} selected={selected}>
      <ListItemIcon>
        <Badge badgeContent={badgeCount} color="secondary">
          <Icon />
        </Badge>
      </ListItemIcon>
      <ListItemText primaryTypographyProps={{ color: booleanColor(selected) }}>
          {!hideText ? label : '-'}
      </ListItemText>
    </ListItem>
  );
}


export default withRouter(AppDrawer);