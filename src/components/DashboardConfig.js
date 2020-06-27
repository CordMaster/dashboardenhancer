import React, { useState, Fragment } from 'react';
import { Grid, Typography, TextField, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Paper, DialogContent, makeStyles, Switch, FormControlLabel, Button } from '@material-ui/core';
import { useModifyImmutableCollection } from '../contexts/useCollection';
import { List } from 'immutable';
import merge from 'deepmerge';
import { toSentence } from '../Utils';
import { PreviewTile, BaseTile } from '../Tile/Tile';
import ColorPicker, { PopoverColorPicker } from './colorpicker/ColorPicker';

const useStyles = makeStyles(theme => ({
  
}));

export default function({ dashboard, modifyDashboard }) {
  //TODO: useSettings?
  const classes = useStyles();

  return (
    <DialogContent>
      <Typography variant="h5" gutterBottom>
        <ColorPicker value={dashboard.backgroundColor} onChange={(value) => modifyDashboard({ backgroundColor: value })} />
      </Typography>
    </DialogContent>
  );
}