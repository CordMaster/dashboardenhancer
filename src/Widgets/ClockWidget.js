import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';
import { HubContext } from '../contexts/HubContextProvider';

function timeStr(num) {
  return num > 9 ? num : '0' + num;
}

function Clock() {
  const { config } = useContext(MainContext);
  const clockConfig = config.clock;
  const clockAttrsConfig = config.clockAttrs;

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

  const attr1 = clockAttrsConfig.clockAttr1.device && clockAttrsConfig.clockAttr1.attribute && devices[clockAttrsConfig.clockAttr1.device].attributes[clockAttrsConfig.clockAttr1.attribute].currentState;
  const attr2 = clockAttrsConfig.clockAttr2.device && clockAttrsConfig.clockAttr2.attribute && devices[clockAttrsConfig.clockAttr2.device].attributes[clockAttrsConfig.clockAttr2.attribute].currentState;
  return (
    <Fragment>
      <Typography>{clockConfig.showDate && time.toLocaleDateString()}</Typography>
      <Typography variant="h6">{time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:{timeStr(time.getMinutes())}{clockConfig.showSeconds && `:${timeStr(time.getSeconds())}`} {time.getHours() > 12 ? 'PM' : 'AM'}</Typography>
      
      {clockConfig.showClockAttributes &&
        <Grid container direction="row" spacing={3}>
          <Grid item>
            <Typography variant="caption">{clockAttrsConfig.clockAttr1Label}: {attr1}</Typography>
          </Grid>

          <Grid item>
            <Typography variant="caption">{clockAttrsConfig.clockAttr2Label}: {attr2}</Typography>
          </Grid>
        </Grid>
      }
    </Fragment>
  )
}

export default Clock;