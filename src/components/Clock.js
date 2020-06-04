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

  const attr1 = config.clockAttr1.device && config.clockAttr1.attribute && devices[config.clockAttr1.device].attr.find((e) => Object.keys(e).findIndex(i => i  === config.clockAttr1.attribute) !== -1);
  const attr2 = config.clockAttr2.device && config.clockAttr2.attribute && devices[config.clockAttr2.device].attr.find((e) => Object.keys(e).findIndex(i => i  === config.clockAttr2.attribute) !== -1);
  return (
    <Fragment>
      <Typography>{time.toLocaleDateString()}</Typography>
      <Typography variant="h6">{time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:{timeStr(time.getMinutes())}:{timeStr(time.getSeconds())} {time.getHours() > 12 ? 'PM' : 'AM'}</Typography>
      
      {config.showClockAttributes &&
        <Grid container direction="row" spacing={3}>
          <Grid item>
            <Typography variant="caption">{config.clockAttr1Label}: {attr1 ? attr1[config.clockAttr1.attribute] : false}</Typography>
          </Grid>

          <Grid item>
            <Typography variant="caption">{config.clockAttr2Label}: {attr2 ? attr2[config.clockAttr2.attribute] : false}</Typography>
          </Grid>
        </Grid>
      }
    </Fragment>
  )
}

export default Clock;