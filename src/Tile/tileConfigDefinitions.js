export default {
  'all': {
    'label': {
      sectionLabel: 'Tile Label',
      sectionOptions: [
        { name: 'showLabel', label: 'Show Label', type: 'boolean', default: true },
        { name: 'label', label: 'Label', type: 'text', default: 'Panel', dependsOn: [{ name: 'showLabel', value: true }] }
      ]
    }
  },

  'iframe': {
    'iframeOpts': {
      sectionLabel: 'iFrame Options',
      sectionOptions: [
        { name: 'src', label: 'iFrame Source', type: 'text', default: '' },
      ]
    }
  },

  'hubitatTile': {

  }
};