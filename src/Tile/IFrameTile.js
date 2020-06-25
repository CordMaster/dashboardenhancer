import React, { useState, Fragment } from 'react';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import { CSSTransition, Transition } from 'react-transition-group';
import { useDrag } from 'react-dnd';
import Tile from './Tile';

const useStyles = makeStyles(theme => ({
  iframe: {
    width: '100%',
    height: '100%',

    border: 'none'
  }
}));

export default function({ tile, ...props }) {
  const classes = useStyles();

  return <Tile tile={tile} {...props} fillContent primaryContent={<iframe title={tile.id} className={classes.iframe} src={tile.options.iframe.src}></iframe>} />
}