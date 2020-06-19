import { openWeatherToken } from "../Constants";

export default {
  'title': {
    sectionLabel: 'Title',
    dependsOn: [{ name: 'iconsOnly', value: false }],
    sectionOptions: [
      { name: 'showTitle', label: 'Show Title', type: 'boolean', default: true },
      { name: 'title', label: 'Title', type: 'text', default: 'Panel', dependsOn: [{ name: 'showTitle', value: true }] }
    ]
  },

  'lock': {
    sectionLabel: 'Lock Settings',
    dependsOn: [{ name: ({ locked }) => locked === -1, value: true }],
    sectionOptions: [
      { name: 'lockCode', label: 'Lock code', type: 'number', default: 0 },
      { name: 'lockSettings', label: 'Disable settings when locked', type: 'boolean', default: false },
      { name: 'lockFully', label: 'Disable viewing selected dashboards when locked', type: 'boolean', default: false }
    ]
  },

  'drawer': {
    sectionLabel: 'Drawer Settings',
    sectionOptions: [
      { name: 'iconsOnly', label: 'Icons only', type: 'boolean', default: false, affects: [{ value: true, name: 'showTitle', setTo: false }, { value: true, name: 'showClock', setTo: false }, { value: true, name: 'showWeather', setTo: false }] },
      { name: 'showBadges', label: 'Show badges', type: 'boolean', default: false },
      { name: 'showClock', label: 'Show clock', type: 'boolean', default: true, dependsOn:[{ name: 'iconsOnly', value: false }], disableOnDepends: true, affects: [{ value: false, name: 'showClockAttributes', setTo: false }] },
      { name: 'showWeather', label: 'Show weather', type: 'boolean', default: false, dependsOn: [{ name: () => openWeatherToken !== null, value: true }, { name: 'iconsOnly', value: false }], disableOnDepends: true }
    ]
  },

  'clock': {
    sectionLabel: 'Clock Settings',
    dependsOn: [{ name: 'showClock', value: true }],
    sectionOptions: [
      { name: 'clockOnTop', label: 'Show clock on top', type: 'boolean', default: false },
      { name: 'showSeconds', label: 'Show seconds', type: 'boolean', default: true },
      { name: 'showDate', label: 'Show date', type: 'boolean', default: true },
      { name: 'showClockAttributes', label: 'Show attributes from devices', type: 'boolean', default: false }
    ]
  },

  'clockAttrs': {
    sectionLabel: 'Clock Device Attributes',
    dependsOn: [{ name: 'showClockAttributes', value: true }],
    sectionOptions: [
      { name: 'clockAttr1Label', label: '1st attribute label', type: 'text', default: 'Attr1' },
      { name: 'clockAttr1', label: '1st attribute', type: 'deviceattribute', default: { device: '', attribute: '' } },

      { name: 'clockAttr2Label', label: '2nd attribute label', type: 'text', default: 'Attr2' },
      { name: 'clockAttr2', label: '2nd attribute', type: 'deviceattribute', default: { device: '', attribute: '' } }
    ]
  },

  'weather': {
    sectionLabel: 'Weather Settings',
    dependsOn: [{ name: 'showWeather', value: true }],
    sectionOptions: [
      { name: 'weatherUpdateIntervalInMin', label: 'Weather update interval (in minutes)', type: 'number', default: 5 },
      { name: 'useHubDeviceForIndoorTemp', label: 'Use a hub device for the indoor temperature', type: 'boolean', default: false },
      { name: 'indoorTempHubDevice', label: 'Indoor temperature device', type: 'deviceattribute', default: { device: '', attribute: '' }, dependsOn: [{ name: 'useHubDeviceForIndoorTemp', value: true }] },
      { name: 'useHubDeviceForOutdoorTemp', label: 'Use a hub device for the outdoor temperature', type: 'boolean', default: false },
      { name: 'outdoorTempHubDevice', label: 'Outdoor temperature device', type: 'deviceattribute', default: { device: '', attribute: '' }, dependsOn: [{ name: 'useHubDeviceForOutdoorTemp', value: true }] },
    ]
  },

  'weatherLocation': {
    sectionLabel: 'Weather Location Settings',
    dependsOn: [{ name: 'showWeather', value: true }],
    saveBuffer: true,
    sectionOptions: [
      { name: 'latitude', label: 'Latitude', type: 'number', default: '' },
      { name: 'longitude', label: 'Longitude', type: 'number', default: '' },
    
    ]
  },

  'font': {
    sectionLabel: 'Font Size',
    saveBuffer: true,
    sectionOptions: [
      { name: 'fontSize', label: 'Font Size', type: 'number', default: 12 },
    ]
  },

  'theme': {
    sectionLabel: 'Theme',
    sectionOptions: [
      { name: 'darkTheme', label: 'Dark Theme', type: 'boolean', default: false },
      { name: 'overrideColors', label: 'Custom Theme', type: 'boolean', default: false }
    ]
  },

  'themeColors': {
    sectionLabel: 'Custom Theme Colors',
    saveBuffer: true,
    dependsOn: [{ name: 'overrideColors', value: true }],
    sectionOptions: [
      { name: 'overrideBG', label: 'Background Color', type: 'color', default: { r: 50, b: 50, g: 50, alpha: 1.0 } },
      { name: 'overrideFG', label: 'Foreground Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } },
      { name: 'overridePrimary', label: 'Primary Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } },
      { name: 'overrideSecondary', label: 'Secondary Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }
    ]
  },

  'experimental': {
    sectionLabel: 'Experimental Options',
    sectionOptions: [
      { name: 'overridePanelView', label: '[WIP] [FASTER] Override panel view to match your theme', type: 'boolean', default: false },
    ]
  },

  'none': {
    noShow: true,
    sectionOptions: [
      { name: 'defaultDashboard', type: 'number', default: -1 },
    ]
  }
};