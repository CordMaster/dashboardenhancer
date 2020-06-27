import { TextField } from "@material-ui/core";
import { PopoverColorPicker } from "../colorpicker/ColorPicker";

export default {
  text: [{ name: 'value', type: 'text', default: '', Component: TextField }, { name: 'color', type: 'color', default: { r: 0, g: 0, b: 0, alpha: 1.0 }, Component: PopoverColorPicker }],
  icon: [{ name: 'iconName', type: 'icon', default: 'mdiCancel', Component: TextField }, { name: 'color', type: 'color', default: { r: 255, g: 255, b: 255, alpha: 1.0 }, Component: PopoverColorPicker }],
  none: []
}