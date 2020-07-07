const params = new URLSearchParams(window.location.search);

export const devMode = process.env.NODE_ENV === 'development';

export const hubIp = !devMode ? window.location.host : '192.168.1.211';
const path = window.location.pathname;
export const endpoint = `http://${hubIp}${path.substring(0, path.indexOf('/main'))}/`;
export const dashboardAppId = params.get('dashboardAppId');
export const dashboardAccessToken = params.get('dashboardAccessToken');
export const access_token = params.get('access_token');

export const openWeatherToken = params.get('openWeatherToken');

export const defaultDashboards = !devMode ? [] : [
  {
    id: 'dev_1',
    iconName: "mdiHome",
    label: 'Main Panel',
    lock: false,
    backgroundColor: { r: 255, g: 255, b: 255, alpha: 1 },

    tiles: [
      {
        id: 't1',
        type: 'iframeTile',
        options: {
          label: {
            showLabel: true,
            label: 'Tile 1'
          },

          colors: {
            backgroundColor: { r: 255, g: 255, b: 255, alpha: 1.0 },
            foregroundColor: { r: 0, g: 0, b: 0, alpha: 1.0 },
          },

          iframe: {
            src: ''
          }
        },
        position: {
          x: 1,
          y: 1,
          w: 4,
          h: 4
        }
      },

      {
        id: 't2',
        type: 'hubitatTile',
        options: {
          label: {
            showLabel: true,
            label: 'Tile 2'
          },

          colors: {
            backgroundColor: { r: 255, g: 255, b: 255, alpha: 1.0 },
            foregroundColor: { r: 0, g: 0, b: 0, alpha: 1.0 },
          },

          deviceInfo: {

          }
        },
        position: {
          x: 6,
          y: 6,
          w: 4,
          h: 4
        }
      }
    ],
  }
];