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
          type: 'conditional',
          value: [
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
            }
          ]
        },

        color: {
          type: 'conditional',
          value: [
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
            }
          ]
        },

        size: {
          type: 'constant',
          value: '50'
        }
      },

      secondary: {
        enabled: false,
        type: 'none'
      },

      tl: {
        enabled: false,
        type: 'none'
      },

      tr: {
        enabled: false,
        type: 'none'
      },

      bl: {
        enabled: false,
        type: 'none'
      },

      br: {
        enabled: false,
        type: 'none'
      },

      label: {
        enabled: true,
        type: 'text',

        value: {
          type: 'constant',
          value: '%deviceName%'
        },

        color: {
          type: 'none',
        },

        size: {
          type: 'none'
        }
      },

      optionOverrides: {
        backgroundColor: {
          type: 'none',
        }
      }
    }
  } 
];