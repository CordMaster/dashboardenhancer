import { openWeatherToken } from "../Constants";

export default {
  'title': {
    sectionLabel: 'Title',
    dependsOn: [{ name: 'drawer.showTitle', value: true }],
    sectionOptions: [
      { name: 'title', label: 'Title', type: 'text', default: 'Panel' }
    ]
  },

  'lock': {
    sectionLabel: 'Lock Settings',
    dependsOn: [{ name: ({ locked }) => !Boolean(locked), value: true }],
    sectionOptions: [
      //temp move to none
      { name: 'useLockCode', label: 'Use lock code', type: 'boolean', default: false },
      { name: 'lockCode', label: 'Lock code', type: 'text', default: '', dependsOn: [{ name: 'lock.useLockCode', value: true }] },
      { name: 'lockSettings', label: 'Disable settings when locked', type: 'boolean', default: false },
      { name: 'lockFully', label: 'Disable viewing selected dashboards when locked', type: 'boolean', default: false }
    ]
  },

  'drawer': {
    sectionLabel: 'Drawer Settings',
    sectionOptions: [
      { name: 'iconsOnly', label: 'Icons only', type: 'boolean', default: false, affects: [{ value: true, name: 'drawer.showTitle', setTo: false }, { value: true, name: 'drawer.showClock', setTo: false }, { value: true, name: 'drawer.showWeather', setTo: false }] },
      { name: 'showBadges', label: 'Show badges', type: 'boolean', default: false },
      { name: 'showTitle', label: 'Show Title', type: 'boolean', default: true , dependsOn:[{ name: 'drawer.iconsOnly', value: false }],  disableOnDepends: true },
      { name: 'showClock', label: 'Show clock', type: 'boolean', default: true, dependsOn:[{ name: 'drawer.iconsOnly', value: false }], disableOnDepends: true, affects: [{ value: false, name: 'clock.showClockAttributes', setTo: false }] },
      { name: 'showWeather', label: 'Show weather', type: 'boolean', default: false, dependsOn: [{ name: () => openWeatherToken !== null, value: true }, { name: 'drawer.iconsOnly', value: false }], disableOnDepends: true }
    ]
  },

  'weather': {
    sectionLabel: 'Weather Settings',
    dependsOn: [{ name: 'drawer.showWeather', value: true }],
    sectionOptions: [
      { name: 'weatherUpdateIntervalInMin', label: 'Weather update interval (in minutes)', type: 'number', default: 5 },
      { name: 'useHubDeviceForIndoorTemp', label: 'Use a hub device for the indoor temperature', type: 'boolean', default: false },
      { name: 'indoorTempHubDevice', label: 'Indoor temperature device', type: 'deviceattribute', default: { device: '', attribute: '' }, dependsOn: [{ name: 'weather.useHubDeviceForIndoorTemp', value: true }] },
      { name: 'useHubDeviceForOutdoorTemp', label: 'Use a hub device for the outdoor temperature', type: 'boolean', default: false },
      { name: 'outdoorTempHubDevice', label: 'Outdoor temperature device', type: 'deviceattribute', default: { device: '', attribute: '' }, dependsOn: [{ name: 'weather.useHubDeviceForOutdoorTemp', value: true }] },
    ]
  },

  'weatherLocation': {
    sectionLabel: 'Weather Location Settings',
    dependsOn: [{ name: 'drawer.showWeather', value: true }],
    saveBuffer: true,
    sectionOptions: [
      { name: 'latitude', label: 'Latitude', type: 'number', default: '' },
      { name: 'longitude', label: 'Longitude', type: 'number', default: '' },
    
    ]
  },

  'rtspProxy': {
    sectionLabel: 'RTSP Settings',
    sectionOptions: [
      { name: 'rtspProxyAddress', label: 'RTSP Proxy Address', type: 'text', default: '' },
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
    dependsOn: [{ name: 'theme.overrideColors', value: true }],
    sectionOptions: [
      { name: 'overrideBG', label: 'Background Color', type: 'color', default: { r: 50, b: 50, g: 50, alpha: 1.0 } },
      { name: 'overrideFG', label: 'Foreground Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } },
      { name: 'overridePrimary', label: 'Primary Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } },
      { name: 'overrideSecondary', label: 'Secondary Color', type: 'color', default: { r: 255, b: 255, g: 255, alpha: 1.0 } }
    ]
  },

  'panel': {
    sectionLabel: 'Panel Options',
    sectionOptions: [
      { name: 'cache', label: 'Cache panels', type: 'boolean', default: true },
      { name: 'panelRows', label: 'Rows', type: 'number', default: 20 },
      { name: 'panelCols', label: 'Columns', type: 'number', default: 35 }
    ]
  },

  'other': {
    noShow: true,
    sectionOptions: [
      { name: 'defaultDashboard', type: 'number', default: -1 }
    ]
  }
};