import React from 'react';
import { Paper, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    height: '100%'
  },
}));

export default function() {
  const classes = useStyles();

  return (
    <Paper elevation={8} className={classes.paper}>
      Test
    </Paper>
  );
}