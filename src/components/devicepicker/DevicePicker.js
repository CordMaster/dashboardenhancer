import React, { useContext, useMemo } from 'react';
import { Grid, Select, MenuItem, FormControl, FormControlLabel, InputLabel } from '@material-ui/core';
import { HubContext } from '../../contexts/HubContextProvider';

export default function({ value, onChange, disabled }) {
  const { devices } = useContext(HubContext);

  const uiDevices = useMemo(() => Object.entries(devices).sort(([idA, a], [idB, b]) => a.label < b.label ? -1 : 1).map(([id, device]) => <MenuItem key={id} value={id}>{device.label}</MenuItem>), [devices]);

  return (
    <FormControl fullWidth margin="dense">
      <InputLabel>Device</InputLabel>
      <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <MenuItem value="">None</MenuItem>
        {uiDevices}
      </Select>
    </FormControl>
  )
}