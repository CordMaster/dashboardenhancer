import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden, List, ListItem, ListItemIcon, ListItemText, Typography, ListSubheader, Divider, Paper } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import Icons, { getIcon } from '../Icons';
import { useHistory } from 'react-router';
import { pushHistoryPreserve } from '../Utils';
import useLock from '../components/useLock';
import { OpenWeatherContext } from '../contexts/OpenWeatherContextProvider';

const useStyles = makeStyles(theme => ({
  settingsPaper: {
    minHeight: '100%'
  },

  listItem: {
    paddingLeft: theme.spacing(4)
  }
}));

function More({ index }) {
  const classes = useStyles();
  const history = useHistory();

  const { dashboards, config } = useContext(MainContext);
  const { sync } = useContext(OpenWeatherContext);

  const [locked, openDialog, providedDialog] = useLock();

  let uiDashboards = [];

  if(dashboards.length > 4) {
    for(let i = 4; i < dashboards.length; i++) {
      const dashboard = dashboards[i];
      uiDashboards.push(<ImprovedListItem key={dashboard.id} label={dashboard.label} disabled={locked !== -1 && config.lock.lockFully && dashboard.lock} Icon={getIcon(dashboard.iconName)} onClick={() => pushHistoryPreserve(history, `/${i}/`)} />);
    }
  } else uiDashboards.push(<Fragment key={"none"}><ListItem key={"none"} className={classes.listItem} disabled><ListItemText>No other panels</ListItemText></ListItem><Divider /></Fragment>);

  return (
    <Paper square elevation={0} className={classes.settingsPaper}>
      <List disablePadding>
        <ListSubheader>Other Panels</ListSubheader>
        <Divider />

        {uiDashboards}

        <ImprovedListItem label={locked !== -1 ? "Unlock" : "Lock"} Icon={locked !== -1 ? Icons.mdiLockOpen : Icons.mdiLock} onClick={openDialog} />
        {providedDialog}
        <Divider />

        <ListSubheader>Settings</ListSubheader>
        <Divider />

        <ImprovedListItem label="Reload Weather" Icon={Icons.mdiSync} onClick={sync} />
        <ImprovedListItem label="Settings" Icon={Icons.mdiCog} disabled={locked !== -1 && config.lock.lockSettings} onClick={() => pushHistoryPreserve(history, '/settings/')} />
      </List>
    </Paper>
  );
}

function ImprovedListItem({ label, Icon, onClick, ...props }) {
  const classes = useStyles();

  return (
    <Fragment>
      <ListItem button {...props} onClick={onClick} className={classes.listItem}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText>
          {label}
        </ListItemText>
      </ListItem>
      <Divider />
    </Fragment>
  );
}

export default More;