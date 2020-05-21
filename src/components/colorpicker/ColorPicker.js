import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import ColorSlider from './ColorSlider.js';
import ColorPreview from './ColorPreview.js';

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


export default React.memo(ColorPicker);