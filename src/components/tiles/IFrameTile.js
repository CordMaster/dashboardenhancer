import React, { useState, Fragment, useEffect } from 'react';
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

  const frameRef = React.createRef(null);

  //set reload interval
  useEffect(() => {
    if(options.iframe.refresh) {
      const oldSrc = frameRef.current.src;
      const handle = setInterval(() => frameRef.current.src = oldSrc, 1000 * 60 * options.iframe.refreshInterval);

      return () => clearInterval(handle);
    }
  }, [frameRef, options.iframe.refresh, options.iframe.refreshInterval])

  //todo: unique title
  return <BaseTile ref={ref} options={options} popped={popped} {...props} fillContent content={ { primary: <iframe ref={frameRef} title={'title'} className={multipleClasses(classes.iframe, [!popped, 'noclick'])} src={options.iframe.src}></iframe> } } />
});