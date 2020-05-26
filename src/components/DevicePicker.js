import React, { useContext, useMemo } from 'react';
import { Grid, Select, MenuItem, FormControl, FormControlLabel, InputLabel } from '@material-ui/core';
import { MainContext } from '../contexts/MainContextProvider';

export default function({ value, onChange }) {
  const { devices } = useContext(MainContext);

  const onChangeDevice = val => {
    onChange({ device: val, attribute: '' });
  }

  const onChangeAttr = val => {
    onChange({ ...value, attribute: val });
  }

  const uiDevices = useMemo(() => Object.entries(devices).map(([id, device]) => <MenuItem value={id}>{device.label}</MenuItem>), [devices]);
  const uiAttrs = useMemo(() => value.device ? devices[value.device].attr.map((it) => <MenuItem value={Object.keys(it)[0]}>{Object.keys(it)[0]}</MenuItem>) : [], [devices, value.device]);

  return (
    <Grid container direction="row" spacing={3}>
      <Grid item xs={6}>
        <FormControl fullWidth margin="dense">
        <InputLabel>Device</InputLabel>
          <Select value={value.device} onChange={(e) => onChangeDevice(e.target.value)}>
            <MenuItem value="">None</MenuItem>
            {uiDevices}
          </Select>
        </FormControl>
      </Grid>

      { value.device && 
      <Grid item xs={6}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Attribute</InputLabel>
          <Select value={value.attribute} onChange={(e) => onChangeAttr(e.target.value)}>
            <MenuItem value="">None</MenuItem>
            {uiAttrs}
          </Select>
        </FormControl>
      </Grid>
      }
    </Grid>
  )
}