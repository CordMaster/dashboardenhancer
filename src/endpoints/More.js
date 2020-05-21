import React, { useContext, Fragment } from 'react';
import { makeStyles, Hidden, List, ListItem, ListItemIcon, ListItemText, Typography, ListSubheader, Divider } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import * as Icons from '@material-ui/icons';
import { useHistory } from 'react-router';
import { pushHistoryPreserve } from '../Utils';

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingLeft: theme.spacing(4)
  }
}));

function More({ index }) {
  const classes = useStyles();
  const history = useHistory();

  const { dashboards } = useContext(MainContext);

  let uiDashboards = [];

  if(dashboards.length > 3) {
    for(let i = 3; i < dashboards.length; i++) {
      const dashboard = dashboards[i];
      uiDashboards.push(<ImprovedListItem key={dashboard.id} label={dashboard.label} Icon={Icons[dashboard.iconName]} onClick={() => pushHistoryPreserve(history, `/${i}/`)} />);
    }
  } else uiDashboards.push(<Fragment key={"none"}><ListItem key={"none"} className={classes.listItem} disabled><ListItemText>No other panels</ListItemText></ListItem><Divider /></Fragment>);

  return (
    <List disablePadding>
      <ListSubheader>Other Panels</ListSubheader>
      <Divider />

      {uiDashboards}

      <ListSubheader>Settings</ListSubheader>
      <Divider />

      <ImprovedListItem label="Settings" Icon={Icons.Settings} onClick={() => pushHistoryPreserve(history, '/settings/')} />
    </List>
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