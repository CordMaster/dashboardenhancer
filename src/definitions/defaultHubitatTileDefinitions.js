export default [
  {
    id: 'def-1',
    label: 'Switch',
    iconName: 'mdiToggleSwitch',

    sections: {
      primary: {
        enabled: true,
        type: 'icon',

        iconName: {
          type: 'icon',

          conditions: [
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
          ]
        },

        color: {
          type: 'color',

          conditions: [
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
        }
      },

      secondary: {
        enabled: false
      },

      label: {
        constant: '%deviceName%'
      }
    }
  }
];