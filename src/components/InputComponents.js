import React, { useState, Fragment, useEffect, useMemo } from 'react';

import { Typography, TextField, Switch, FormControlLabel, FormControl, Select, MenuItem, InputLabel } from '@material-ui/core';
import ColorPicker, { PopoverColorPicker } from './colorpicker/ColorPicker';
import DeviceAttributePicker from './devicepicker/DeviceAttributePicker';
import DevicePicker from './devicepicker/DevicePicker';
import { evalIfFunction } from '../Utils';
import { PopoverIconSelect } from './IconSelect';

const BooleanType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <FormControlLabel control={<Switch />} label={label} checked={value} onChange={() => setValue(!value)} {...props} />
    </FormControl>
  );
});

const TextType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField label={label} value={value} onChange={(e) => setValue(e.target.value)} {...props} />
    </FormControl>
  );
});

const NumberType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <FormControl fullWidth margin="dense">
      <TextField type="number" label={label} value={value} onChange={(e) => setValue(parseFloat(e.target.value))} {...props} />
    </FormControl>
  );
});

const EnumType = React.memo(({ label, values, value, setValue, ...props }) => {
  console.log(values)
  const uiValues = values.map(item => <MenuItem value={item.value}>{item.label}</MenuItem>);

  return (
    <FormControl fullWidth margin="dense">
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={(e) => setValue(e.target.value)} {...props}>
        {uiValues}
      </Select>
    </FormControl>
  );
});

const ColorType = React.memo(({ label, value, setValue, ...props }) => {
  return (
    <Fragment>
      <Typography variant="subtitle1">{label}</Typography>
      <ColorPicker value={value} onChange={(value) => setValue(value)} {...props} />
    </Fragment>
  );
});

const ColorPopoverType = React.memo(({ setValue, ...props }) => {
  return (
    <PopoverColorPicker onChange={(value) => setValue(value)} {...props} />
  );
});

const IconSelectPopoverType = React.memo(({ value, setValue, ...props }) => {
  return <PopoverIconSelect value={value} onChange={(value) => setValue(value)} {...props} />
});

const DeviceType = React.memo(({ value, setValue, ...props }) => {
  return <DevicePicker value={value} onChange={(value) => setValue(value)} {...props} />
});

const DeviceAttributeType = React.memo(({ value, setValue, ...props }) => {
  return <DeviceAttributePicker value={value} onChange={(value) => setValue(value)} {...props} />
});

export default {
  boolean: BooleanType,
  text: TextType,
  number: NumberType,
  enum: EnumType,
  color: ColorType,
  colorpopover: ColorPopoverType,
  iconselectpopover: IconSelectPopoverType,
  device: DeviceType,
  deviceattribute: DeviceAttributeType
}