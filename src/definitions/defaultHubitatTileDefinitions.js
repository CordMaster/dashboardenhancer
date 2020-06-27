export default [
  {
    id: 'def-1',
    label: 'Switch',
    iconName: 'mdiToggleSwitch',

    properties: {
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
            value: 'primary'
          },

          {
            attributeName: 'switch',
            comparator: '===',
            requiredState: 'off',
            value: 'secondary'
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

        constant: '%deviceName%'
      }
    }
  }
];