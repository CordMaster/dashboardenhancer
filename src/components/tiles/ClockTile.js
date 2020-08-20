import React, { useEffect, useState, Fragment, useContext, useRef } from 'react';
import { Typography, Grid, makeStyles } from '@material-ui/core';
import { HubContext } from '../../contexts/HubContextProvider';
import { BaseTile } from './Tile';

const useStyles = makeStyles(theme => ({
  primary: {
    
  },

  secondary: {
    
  }
}));

function timeStr(num) {
  return num > 9 ? num : '0' + num;
}

export default React.forwardRef(({ options, ...props }, ref) => {
  const classes = useStyles();

  const { devices } = useContext(HubContext);

  const tileRef = useRef();

  const clockOptions = options.clock;
  const clockAttrsOptions = options.clockAttrs;

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    //start clock loop
    const hook = setInterval(() => {
      setTime(new Date());
    }, 1000);

    //cleanup
    return () => {
      clearInterval(hook);
    }
  }, [setTime]);

  const attr1 = clockAttrsOptions.clockAttr1.device && clockAttrsOptions.clockAttr1.attribute && devices[clockAttrsOptions.clockAttr1.device].attributes[clockAttrsOptions.clockAttr1.attribute].currentState;
  const attr2 = clockAttrsOptions.clockAttr2.device && clockAttrsOptions.clockAttr2.attribute && devices[clockAttrsOptions.clockAttr2.device].attributes[clockAttrsOptions.clockAttr2.attribute].currentState;

  const currentSize = tileRef.current ? tileRef.current.getBoundingClientRect() : { width: 12, height: 12 };
  const largest = currentSize.height;
  
  const sizeStyles = {
    time: {
      fontSize: `${ largest / 4 }px`,
      lineHeight: `${ largest / 4.75 }px`
    },

    date: {
      fontSize: `${ largest / 6 }px`,
      lineHeight: `${ largest / 6.75 }px`
    },

    attrs: {
      fontSize: `${ largest / 10 }px`,
    }
  }

  const content = {
    primary: (
      <div className={classes.primary}>
        <Typography variant="h6" style={sizeStyles.time}>{time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:{timeStr(time.getMinutes())}{clockOptions.showSeconds && `:${timeStr(time.getSeconds())}`} {time.getHours() > 12 ? 'PM' : 'AM'}</Typography>
        <Typography style={sizeStyles.date}>{clockOptions.showDate && time.toLocaleDateString()}</Typography>
      </div>
    ),

    secondary: clockOptions.showClockAttributes && (
      <Grid container className={classes.secondary} style={sizeStyles.attrs} direction="row" spacing={3}>
        <Grid item className={classes.attrItem}>
          <Typography variant="caption" style={sizeStyles.attrs}>{clockAttrsOptions.clockAttr1Label}: {attr1}</Typography>
        </Grid>

        <Grid item className={classes.attrItem}>
          <Typography variant="caption" style={sizeStyles.attrs}>{clockAttrsOptions.clockAttr2Label}: {attr2}</Typography>
        </Grid>
      </Grid>
    )
  };

  return (
    <BaseTile ref={{ tileRef, ...ref }} options={options} {...props} content={content} />
  );
});