import React from 'react';
import { TextField, Typography } from "@material-ui/core";
import { PopoverColorPicker } from "../colorpicker/ColorPicker";
import Color from 'color';
import Icons from '../../Icons';
import BatteryMeter from '../BatteryMeter';
import { colToStr } from '../../Utils';

export default {
  none: {
    label: 'Not Set',

    properties: [],

    Renderer: ({ options }) => {
      return (
        null
      );
    }
  },

  text: {
    label: 'Text',

    properties: {
      value: { type: 'text', default: 'Text' },
      color: { type: 'colorpopover', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
      size: { type: 'number', default: 12 }
    },

    Renderer: ({ options }) => {
      return (
        <Typography align="center" style={{ fontSize: options.size, color: colToStr(options.color) }}>
          {options.value}
        </Typography>
      );
    }
  },

  icon: {
    label: 'Icon',

    properties: {
      iconName: { type: 'iconselectpopover', default: 'mdiCancel' },
      color: { type: 'colorpopover', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
      size: { type: 'number', default: 24 }
    },

    Renderer: ({ options }) => {
      const Icon = Icons[options.iconName];

      return (
        <Icon style={{ fontSize: options.size, color: colToStr(options.color) }} />
      );
    }
  },

  battery: {
    label: 'Battery (0 - 100)',

    properties: {
      value: { type: 'text', default: '50' },
      borderColor: { type: 'colorpopover', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
      batteryColor: { type: 'colorpopover', default: { r: 0, g: 200, b: 0, alpha: 1.0 } },
      size: { type: 'number', default: 24 }
    },

    Renderer: ({ options }) => {
      return (
        <BatteryMeter value={parseInt(options.value) ? Math.max(0, Math.min(100, parseInt(options.value))) : 0} borderColor={colToStr(options.borderColor)} batteryColor={colToStr(options.batteryColor)} size={options.size} />
      );
    }
  }
}

export const optionOverridesTemplates = {
  'padding.padding': { type: 'number', default: 8 },
  'colors.backgroundColor': { type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } }
};