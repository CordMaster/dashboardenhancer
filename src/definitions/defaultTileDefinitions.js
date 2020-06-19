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
          conditions: [
            {
              attribute: 'switch',
              requiredState: 'on',
              value: 'mdiToggleSwitch'
            },

            {
              attribute: 'switch',
              requiredState: 'off',
              value: 'mdiToggleSwitchOff'
            },
          ]
        },

        color: {
          conditions: [
            {
              attribute: 'switch',
              requiredState: 'on',
              value: 'primary'
            },

            {
              attribute: 'switch',
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