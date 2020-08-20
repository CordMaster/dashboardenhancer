export default {
  'general': {
    'label': {
      sectionLabel: 'Tile Label',
      sectionOptions: [
        { name: 'showLabel', label: 'Show Label', type: 'boolean', default: true },
        { name: 'label', label: 'Label', type: 'text', default: 'Panel', dependsOn: [{ name: 'label.showLabel', value: true }] }
      ]
    },

    'padding': {
      sectionLabel: 'Padding',
      sectionOptions: [
        { name: 'padding', label: 'Padding', type: 'number', default: 8 }
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

  'clockTile': {
    'clock': {
      sectionLabel: 'Clock Settings',
      dependsOn: [{ name: 'drawer.showClock', value: true }],
      sectionOptions: [
        { name: 'showSeconds', label: 'Show seconds', type: 'boolean', default: true },
        { name: 'showDate', label: 'Show date', type: 'boolean', default: true },
        { name: 'showClockAttributes', label: 'Show attributes from devices', type: 'boolean', default: false }
      ]
    },
  
    'clockAttrs': {
      sectionLabel: 'Clock Device Attributes',
      dependsOn: [{ name: 'clock.showClockAttributes', value: true }],
      sectionOptions: [
        { name: 'clockAttr1Label', label: '1st attribute label', type: 'text', default: 'Attr1' },
        { name: 'clockAttr1', label: '1st attribute', type: 'deviceattribute', default: { device: '', attribute: '' } },
  
        { name: 'clockAttr2Label', label: '2nd attribute label', type: 'text', default: 'Attr2' },
        { name: 'clockAttr2', label: '2nd attribute', type: 'deviceattribute', default: { device: '', attribute: '' } }
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
  },

  'iframeTile': {
    'iframe': {
      sectionLabel: 'iFrame Options',
      sectionOptions: [
        { name: 'src', label: 'iFrame Source', type: 'text', default: '' },
        { name: 'refresh', label: 'Reload iFrame', type: 'boolean', default: false },
        { name: 'refreshInterval', label: 'iFrame Reload Interval (Minutes)', type: 'number', default: 5, dependsOn: [{ name: 'iframe.refresh', value: true }] }
      ]
    }
  },

  'rtspTile': {
    'deviceInfo': {
      sectionLabel: 'Device Info',
      sectionOptions: [
        { name: 'streamAddress', label: 'Stream Address', type: 'text', default: '' }
      ]
    }
  }
};