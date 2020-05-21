import React from 'react';
import PropTypes from 'prop-types';

import { Grid, TextField, Slider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2)
  },

  itemGrow: {
    flex: '1 0 0'
  },

  sliderContainer: {
    margin: theme.spacing(0, 3),

    overflow: 'visible'
  }
}));

const useSliderOverrides = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),

    height: theme.spacing(1),

    marginTop: theme.spacing(-4),
    marginBottom: theme.spacing(-4)
  },

  track: {
    height: theme.spacing(1),
    borderRadius: theme.spacing(0.5)
  },

  rail: {
    height: theme.spacing(1),
    borderRadius: theme.spacing(0.5)
  },

  thumb: {
    marginTop: theme.spacing(-1),
    marginLeft: theme.spacing(-2),

    width: theme.spacing(3),
    height: theme.spacing(3),

    background: theme.palette.background.paper,
    border: `2px solid ${theme.palette.grey[300]}`
  }
}));

function FullSlider({ label, onChange, ...props }) {
  const classes = useStyles();
  const sliderOverrides = useSliderOverrides();

  const handleTextFieldChange = (e) => {
    const val = parseInt(e.target.value);
    if(!val || val < props.min) {
      onChange(props.min);
    } else if(val > props.max) {
      onChange(props.max);
    } else {
      onChange(val);
    }
  }

  return (
    <Grid container className={classes.container} direction="row" wrap="nowrap" alignItems="center">
      <Grid item xs={1}>
        <Typography>{label}</Typography>
      </Grid>

      <Grid item className={classes.itemGrow}>
        <div className={classes.sliderContainer}>
          <Slider classes={sliderOverrides} {...props} onChange={(e, value) => onChange(value)} />
        </div>
      </Grid>

      <Grid item xs={2}>
        <TextField fullWidth type="number" value={props.value} onChange={handleTextFieldChange} />
      </Grid>
    </Grid>
  );
}

export default React.memo(FullSlider);