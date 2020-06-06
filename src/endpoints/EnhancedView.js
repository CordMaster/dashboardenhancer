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

  return (
    <Paper className={classes.container} square elevation={0}>
      <div className={classes.item}>
        {index}
      </div>
    </Paper>
  );
}