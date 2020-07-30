import { BaseTile } from "./Tile";
import IFrameTile from "./IFrameTile";
import HubitatTile from "./HubitatTile";
import tileConfigDefinitions from "./tileConfigDefinitions";
import RTSPTile from "./RTSPTile";

function getDefaultsFor(str) {
  let ret = {
    label: {
      label: `New ${str}`,
      showLabel: true
    },

    padding: {
      padding: 8
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
  'hubitatTile': {
    label: 'Hubitat Tile',
    icon: 'mdiHomeAutomation',
    Type: HubitatTile,

    defaultOptions: getDefaultsFor('hubitatTile')
  },

  'iframeTile': {
    label: 'IFrame Tile',
    icon: 'mdiApplication',
    Type: IFrameTile,
    
    defaultOptions: getDefaultsFor('iframeTile')
  },

  'rtspTile': {
    label: 'RTSP Tile',
    icon: 'mdiVideo',
    Type: RTSPTile,
    
    defaultOptions: getDefaultsFor('rtspTile')
  }
}