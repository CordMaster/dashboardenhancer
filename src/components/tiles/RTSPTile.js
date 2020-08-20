import React, { useState, Fragment, useEffect, useContext, useRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { BaseTile } from './Tile';
import { MainContext } from '../../contexts/MainContextProvider';

const useStyles = makeStyles(theme => ({
  stream: {
    width: '100%',
    height: '100%',
  }
}));

export default React.forwardRef(({ options, popped, ...props }, ref) => {
  const classes = useStyles();

  const { config } = useContext(MainContext);
  const canvasRef = useRef();

  const proxyAddress = config.rtspProxy.rtspProxyAddress;
  const streamAddress = options.deviceInfo.streamAddress;

  useEffect(() => {
    if(proxyAddress && streamAddress) {
      const player = new JSMpeg.Player(`ws://${proxyAddress}?location=${streamAddress}`, { canvas: canvasRef.current });

      return () => {
        player.destroy();
      }
    }
  }, [proxyAddress, streamAddress, canvasRef.current]);

  const content = {
    primary: (
      <canvas ref={canvasRef} className={classes.stream}></canvas>
    )
  }

  //todo: unique title
  return(
    <BaseTile ref={ref} options={options} content={content} fillContent popped={popped} {...props}>
      
    </BaseTile>
  );
});