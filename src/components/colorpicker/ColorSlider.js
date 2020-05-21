import React from 'react';
import PropTypes from 'prop-types';

import FullSlider from '../FullSlider.js';
import { toSentence } from '../../Utils.js';

function ColorSlider({ type, value, onChange }) {
  return (
    <FullSlider label={toSentence(type)} min={0} max={type === 'alpha' ? 1 : 255} step={type === 'alpha' ? 0.05 : 1} value={value} onChange={onChange} />
  );
}

ColorSlider.propTypes = {
  type: PropTypes.string.isRequired,

  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default React.memo(ColorSlider);