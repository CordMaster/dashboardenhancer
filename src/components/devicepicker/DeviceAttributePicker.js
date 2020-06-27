import React, { useContext, useMemo } from 'react';
import { Grid, Select, MenuItem, FormControl, FormControlLabel, InputLabel } from '@material-ui/core';
import { HubContext } from '../../contexts/HubContextProvider';
import DevicePicker from './DevicePicker';

export default function({ value, onChange, disabled }) {
  const { devices } = useContext(HubContext);

  const onChangeDevice = val => {
    onChange({ device: val, attribute: '' });
  }

  const onChangeAttr = val => {
    onChange({ ...value, attribute: val });
  }

  const uiAttrs = useMemo(() => value.device ? Object.values(devices[value.device].attr).map((it) => <MenuItem key={it.name} value={it.name}>{it.name}</MenuItem>) : [], [devices, value.device]);

  return (
    <Grid container direction="row" spacing={3}>
      <Grid item xs={6}>
        <DevicePicker value={value.device} onChange={onChangeDevice} />
      </Grid>

      { value.device && 
      <Grid item xs={6}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Attribute</InputLabel>
          <Select value={value.attribute} onChange={(e) => onChangeAttr(e.target.value)} disabled={disabled}>
            <MenuItem value="">None</MenuItem>
            {uiAttrs}
          </Select>
        </FormControl>
      </Grid>
      }
    </Grid>
  )
}