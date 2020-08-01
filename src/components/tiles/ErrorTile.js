import React, { useState, Fragment } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { BaseTile } from './Tile';
import { multipleClasses } from '../../Utils';

const useStyles = makeStyles(theme => ({
  error: {
    width: '100%',
    height: '100%'
  }
}));

export default React.forwardRef(({ options, popped, ...props }, ref) => {
  const classes = useStyles();

  //todo: unique title
  return <BaseTile ref={ref} options={options} popped={popped} {...props} fillContent content={ { primary: <div className={classes.error}><Typography>Error</Typography></div> } } />
});