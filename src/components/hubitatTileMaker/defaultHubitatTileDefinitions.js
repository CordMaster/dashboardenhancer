export default [
  {
    id: 'def-1',
    label: 'Switch',
    iconName: 'mdiToggleSwitch',

    sections: {
      primary: {
        enabled: true,
        type: 'icon',

        iconName: [
          {
            attributeName: 'switch',
            comparator: '===',
            requiredState: 'on',
            value: 'mdiToggleSwitch'
          },

          {
            attributeName: 'switch',
            comparator: '===',
            requiredState: 'off',
            value: 'mdiToggleSwitchOff'
          },
        ],

        color: [
          {
            attributeName: 'switch',
            comparator: '===',
            requiredState: 'on',
            value: { r: 255, g: 255, b: 255, alpha: 1.0 }
          },

          {
            attributeName: 'switch',
            comparator: '===',
            requiredState: 'off',
            value: { r: 0, g: 0, b: 0, alpha: 1.0 }
          },
        ]
      },

      secondary: {
        enabled: false,
        type: 'none'
      },

      label: {
        enabled: true,
        type: 'text',

        value: '%deviceName%',
        color: { r: 0, g: 0, b: 0, alpha: 1.0 }
      }
    }
  }
];