import React, { useEffect, useState, Fragment } from 'react';
import { Typography } from '@material-ui/core';

function timeStr(num) {
  return num > 9 ? num : '0' + num;
}

function Clock() {
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

  return (
    <Fragment>
      <Typography>{time.toLocaleDateString()}</Typography>
      <Typography variant="h6">{time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:{timeStr(time.getMinutes())}:{timeStr(time.getSeconds())} {time.getHours() > 12 ? 'PM' : 'AM'}</Typography>
    </Fragment>
  )
}

export default Clock;