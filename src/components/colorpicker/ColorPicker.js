import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import ColorSlider from './ColorSlider.js';
import ColorPreview from './ColorPreview.js';
import { Popover, Button, IconButton, makeStyles } from '@material-ui/core';
import Icons from '../../Icons.js';
import Color from 'color';

function TestPicker() {
  const [color, setColor] = useState({ r: 0, g: 0, b: 0, a: 0 });

  return(
    <ColorPicker value={color} onChange={setColor} />
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <Fragment>
      <ColorPreview value={value} />
      <ColorSlider type="red" value={value.r} onChange={(val) => onChange({ ...value, r: val })} />
      <ColorSlider type="green" value={value.g} onChange={(val) => onChange({ ...value, g: val })} />
      <ColorSlider type="blue" value={value.b} onChange={(val) => onChange({ ...value, b: val })} />
      <ColorSlider type="alpha" value={value.alpha} onChange={(val) => onChange({ ...value, alpha: val })} />
    </Fragment>
  );
}

ColorPicker.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

const usePCPStyles = makeStyles(() => ({
  popover: {
    overflow: 'hidden'
  }
}));

export function PopoverColorPicker({ value, onChange }) {
  const classes = usePCPStyles();

  const buttonStyle = {
    backgroundColor: Color(value).rgb().string()
  }

  const iconStyle = {
    color: Color(value).isDark() ? 'white' : 'black'
  }

  const [anchor, setAnchor] = useState(null);

  return (
    <Fragment>
      <Button variant="contained" style={buttonStyle} size="small" onClick={(e) => setAnchor(e.target)}>
        <Icons.mdiPalette style={iconStyle} />
      </Button>

      <Popover anchorEl={anchor} open={anchor} onClose={() => setAnchor(null)}>
        <ColorPicker value={value} onChange={onChange} />
      </Popover>
    </Fragment>
  );
}


export default React.memo(ColorPicker);