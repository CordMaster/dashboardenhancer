import React, { useContext } from 'react';
import { Paper, makeStyles } from '@material-ui/core';
import { HubContext } from '../contexts/HubContextProvider';
import { MainContext } from '../contexts/MainContextProvider';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexFlow: 'row wrap',

    width: '100%',
    height: '100%'
  },

  item: {
    
  }
}));

export default function({ index }) {
  const classes = useStyles();

  const { dashboards } = useContext(MainContext);
  const { allDashboards } = useContext(HubContext);

  const layout = dashboards[index];

  const containerStyles = {
    flexSpacing: 16
  }

  const itemStyles = {
    width: `calc(100% / ${layout.cols}`
  }

  return (
    <Paper className={classes.container} style={containerStyles} square elevation={0}>
      <Paper className={classes.itemStyles}>
        {index}
      </Paper>
    </Paper>
  );
}