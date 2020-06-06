import React from 'react';
import * as OldIcons from '@material-ui/icons';
import * as MdiIcons from '@mdi/js';
import { SvgIcon } from '@material-ui/core';

const Icons = Object.entries(MdiIcons).reduce((sum, [name, val]) => {
  sum[name] = (props) => {
    return (
      <SvgIcon {...props}>
        <path d={val} />
      </SvgIcon>
    );
  }
  return sum;
}, {});

export default Icons;

export function getIcon(name) {
  return Icons[name] ? Icons[name] : (OldIcons[name] ? OldIcons[name] : OldIcons.Error);
}