import { TextField } from "@material-ui/core";
import { PopoverColorPicker } from "../colorpicker/ColorPicker";

export default {
  none: {
    label: 'Not Set',

    fields: []
  },

  text: {
    label: 'Text',

    fields: [
      { name: 'value', type: 'text', default: '' },
      { name: 'color', type: 'colorpopover', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
      { name: 'size', type: 'number' }
    ],

    Renderer: null
  },

  icon: {
    label: 'Icon',

    fields: [
      { name: 'iconName', type: 'text', default: 'mdiCancel' },
      { name: 'color', type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } },
      { name: 'size', type: 'number' }
    ],

    Renderer: null
  },

  battery: {
    label: 'Battery (0 - 100)',

    fields:[
      { name: 'borderColor', type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } },
      { name: 'batteryColor', type: 'colorpopover', default: { r: 200, g: 0, b: 0, alpha: 1.0 } },
      { name: 'size', type: 'number' }
    ],

    Renderer: null
  }
}

export const optionOverridesTemplates = [
  { name: 'backgroundColor', type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } }
];