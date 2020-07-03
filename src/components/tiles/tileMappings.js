import { BaseTile } from "./Tile";
import IFrameTile from "./IFrameTile";
import HubitatTile from "./HubitatTile";
import tileConfigDefinitions from "./tileConfigDefinitions";

function getDefaultsFor(str) {
  let ret = {
    label: {
      label: `New ${str}`,
      showLabel: true
    },

    colors: {
      backgroundColor: { r: 255, g: 255, b: 255, alpha: 1.0 },
      foregroundColor: { r: 0, g: 0, b: 0, alpha: 1.0 }
    }
  };

  Object.entries(tileConfigDefinitions[str]).forEach(([sectionName, section]) => {
    ret[sectionName] = {};
    section.sectionOptions.forEach(option => {
      ret[sectionName][option.name] = option.default;
    });
  });

  return ret;
}

export default {
  'iframeTile': {
    Type: IFrameTile,
    
    defaultOptions: getDefaultsFor('iframeTile')
  },

  'hubitatTile': {
    Type: HubitatTile,

    defaultOptions: getDefaultsFor('hubitatTile')
  }
}