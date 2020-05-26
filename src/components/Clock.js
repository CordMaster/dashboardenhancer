import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

function timeStr(num) {
  return num > 9 ? num : '0' + num;
}

function Clock() {
  const { devices, showClockAttributes, clockAttr1, clockAttr2, clockAttr1Label, clockAttr2Label } = useContext(MainContext);

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

  const attr1 = clockAttr1.device && clockAttr1.attribute && devices[clockAttr1.device].attr.find((e) => Object.keys(e).findIndex(i => i  === clockAttr1.attribute) !== -1);
  const attr2 = clockAttr2.device && clockAttr2.attribute && devices[clockAttr2.device].attr.find((e) => Object.keys(e).findIndex(i => i  === clockAttr2.attribute) !== -1);
  return (
    <Fragment>
      <Typography>{time.toLocaleDateString()}</Typography>
      <Typography variant="h6">{time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:{timeStr(time.getMinutes())}:{timeStr(time.getSeconds())} {time.getHours() > 12 ? 'PM' : 'AM'}</Typography>
      
      {showClockAttributes &&
        <Grid container direction="row" spacing={3}>
          <Grid item>
            <Typography variant="caption">{clockAttr1Label}: {attr1 ? attr1[clockAttr1.attribute] : false}</Typography>
          </Grid>

          <Grid item>
            <Typography variant="caption">{clockAttr2Label}: {attr2 ? attr2[clockAttr2.attribute] : false}</Typography>
          </Grid>
        </Grid>
      }
    </Fragment>
  )
}

export default Clock;