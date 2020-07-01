import { TextField } from "@material-ui/core";
import { PopoverColorPicker } from "../colorpicker/ColorPicker";

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
      value: { type: 'text', default: '' },
      color: { type: 'colorpopover', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
      size: { type: 'number', default: 12 }
    },

    Renderer: ({ options }) => {
      return (
        null
      );
    }
  },

  icon: {
    label: 'Icon',

    properties: {
      iconName: { type: 'text', default: 'mdiCancel' },
      color: { type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } },
      size: { type: 'number', default: 12 }
    },

    Renderer: ({ options }) => {
      return (
        null
      );
    }
  },

  battery: {
    label: 'Battery (0 - 100)',

    properties: {
      borderColor: { type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } },
      batteryColor: { type: 'colorpopover', default: { r: 200, g: 0, b: 0, alpha: 1.0 } },
      size: { type: 'number', default: 12 }
    },

    Renderer: ({ options }) => {
      return (
        null
      );
    }
  }
}

export const optionOverridesTemplates = [
  { name: 'backgroundColor', type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } }
];