import React from 'react';
import * as OldIcons from '@material-ui/icons';
import * as MdiIcons from '@mdi/js';
import { SvgIcon } from '@material-ui/core';
import IconAliases from './definitions/IconAliases.json';

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
  if(Icons[name]) return Icons[name];
  else if(OldIcons[name]) return OldIcons[name];
  else {
    const foundIconByAlias = IconAliases.find(elem => elem.aliases.includes(name));
    if(foundIconByAlias)  return Icons[foundIconByAlias.name];
    else return Icons.mdiAlertCircle;
  }
}