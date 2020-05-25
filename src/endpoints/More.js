import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden, List, ListItem, ListItemIcon, ListItemText, Typography, ListSubheader, Divider, Paper } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import * as Icons from '@material-ui/icons';
import { useHistory } from 'react-router';
import { pushHistoryPreserve } from '../Utils';
import useLock from '../components/useLock';

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

  const { dashboards, lockSettings, lockFully } = useContext(MainContext);

  const [locked, openDialog, providedDialog] = useLock();

  let uiDashboards = [];

  if(dashboards.length > 3) {
    for(let i = 3; i < dashboards.length; i++) {
      const dashboard = dashboards[i];
      uiDashboards.push(<ImprovedListItem key={dashboard.id} label={dashboard.label} disabled={locked !== -1 && lockFully && dashboard.lock} Icon={Icons[dashboard.iconName]} onClick={() => pushHistoryPreserve(history, `/${i}/`)} />);
    }
  } else uiDashboards.push(<Fragment key={"none"}><ListItem key={"none"} className={classes.listItem} disabled><ListItemText>No other panels</ListItemText></ListItem><Divider /></Fragment>);

  return (
    <Paper square elevation={0} className={classes.settingsPaper}>
      <List disablePadding>
        <ListSubheader>Other Panels</ListSubheader>
        <Divider />

        {uiDashboards}

        <ImprovedListItem label={locked !== -1 ? "Unlock" : "Lock"} Icon={locked !== -1 ? Icons.LockOpen : Icons.Lock} onClick={openDialog} />
        {providedDialog}
        <Divider />

        <ListSubheader>Settings</ListSubheader>
        <Divider />

        <ImprovedListItem label="Settings" Icon={Icons.Settings} disabled={locked !== -1 && lockSettings} onClick={() => pushHistoryPreserve(history, '/settings/')} />
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