export default {
  'general': {
    'label': {
      sectionLabel: 'Tile Label',
      sectionOptions: [
        { name: 'showLabel', label: 'Show Label', type: 'boolean', default: true },
        { name: 'label', label: 'Label', type: 'text', default: 'Panel', dependsOn: [{ name: 'label.showLabel', value: true }] }
      ]
    },

    'colors': {
      sectionLabel: 'Colors',
      sectionOptions: [
        { name: 'backgroundColor', label: 'Background Color', type: 'color', default: { r: 255, g: 255, b: 255, alpha: 1.0 } },
        { name: 'foregroundColor', label: 'Text Color', type: 'color', default: { r: 0, g: 0, b: 0, alpha: 1.0 } },
      ]
    },
  },

  'iframeTile': {
    'iframe': {
      sectionLabel: 'iFrame Options',
      sectionOptions: [
        { name: 'src', label: 'iFrame Source', type: 'text', default: '' },
      ]
    }
  },

  'hubitatTile': {
    'deviceInfo': {
      sectionLabel: 'Device Info',
      sectionOptions: [
        { name: 'device', label: 'Device', type: 'device', default: '' },
        { name: 'type', label: 'Type', type: 'enum', values: (mainContext) => {
          return mainContext.allHubitatTileDefinitions.map(it => ({ value: it.id, label: it.label }));
        }, default: '' }
      ]
    }
  }
};