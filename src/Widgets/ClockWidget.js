import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import { HubContext } from '../contexts/HubContextProvider';

function timeStr(num) {
  return num > 9 ? num : '0' + num;
}

function Clock() {
  const { config } = useContext(MainContext);
  const { devices } = useContext(HubContext);

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

  const attr1 = config.clockAttr1.device && config.clockAttr1.attribute && devices[config.clockAttr1.device].attr[config.clockAttr1.attribute].value;
  const attr2 = config.clockAttr2.device && config.clockAttr2.attribute && devices[config.clockAttr2.device].attr[config.clockAttr2.attribute].value;
  return (
    <Fragment>
      <Typography>{config.showDate && time.toLocaleDateString()}</Typography>
      <Typography variant="h6">{time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:{timeStr(time.getMinutes())}{config.showSeconds && `:${timeStr(time.getSeconds())}`} {time.getHours() > 12 ? 'PM' : 'AM'}</Typography>
      
      {config.showClockAttributes &&
        <Grid container direction="row" spacing={3}>
          <Grid item>
            <Typography variant="caption">{config.clockAttr1Label}: {attr1}</Typography>
          </Grid>

          <Grid item>
            <Typography variant="caption">{config.clockAttr2Label}: {attr2}</Typography>
          </Grid>
        </Grid>
      }
    </Fragment>
  )
}

export default Clock;