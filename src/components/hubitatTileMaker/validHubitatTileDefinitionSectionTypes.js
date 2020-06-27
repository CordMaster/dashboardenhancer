import { TextField } from "@material-ui/core";
import { PopoverColorPicker } from "../colorpicker/ColorPicker";

export default {
  text: [
    { name: 'value', type: 'text', default: '' },
    { name: 'color', type: 'colorpopover', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
    { name: 'size', type: 'number' }
  ],
  icon: [
    { name: 'iconName', type: 'text', default: 'mdiCancel' },
    { name: 'color', type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } },
    { name: 'size', type: 'number' }
  ],
  none: []
}

export const optionOverridesTemplates = [
  { name: 'backgroundColor', type: 'colorpopover', default: { r: 255, g: 255, b: 255, alpha: 1.0 } }
];