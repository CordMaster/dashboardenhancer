import React from 'react';
import PropTypes from 'prop-types';

import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import Color from 'color';

import gridImage from '../../grid.png'

const useStyles = makeStyles(theme => ({
  container: {
    height: theme.spacing(4),
    margin: theme.spacing(2),
    marginBottom: 0,

    background: `url(${gridImage})`,
    backgroundSize: theme.spacing(4),
    backgroundRepeat: 'repeat',
    imageRendering: 'pixelated'
  },

  overlay: {
    height: '100%'
  }
}));

function ColorPreview({ value }) {
  const classes = useStyles();

  const styles = {
    backgroundColor: Color(value).rgb().string()
  }

  return (
    <Paper className={classes.container}>
      <div className={classes.overlay} style={styles} />
    </Paper>
  );
}

ColorPreview.propTypes = {
  value: PropTypes.object.isRequired,
}

export default ColorPreview;