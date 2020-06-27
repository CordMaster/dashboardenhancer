import React, { useState, Fragment } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { BaseTile } from './Tile';
import { multipleClasses } from '../../Utils';

const useStyles = makeStyles(theme => ({
  iframe: {
    width: '100%',
    height: '100%',

    border: 'none',

    '&.noclick': {
      pointerEvents: 'none',
      touchAction: 'none'
    }
  }
}));

export default React.forwardRef(({ options, popped, ...props }, ref) => {
  const classes = useStyles();

  //todo: unique title
  return <BaseTile ref={ref} options={options} popped={popped} {...props} fillContent primaryContent={<iframe title={'title'} className={multipleClasses(classes.iframe, [!popped, 'noclick'])} src={options.iframe.src}></iframe>} />
});