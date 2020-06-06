import React from 'react';
import * as MdiIcons from '@mdi/js';
import { SvgIcon } from '@material-ui/core';

module.exports = Object.entries(MdiIcons).reduce(([name, val], sum) => sum[name] = <SvgIcon><path d={val} /></SvgIcon>, {});