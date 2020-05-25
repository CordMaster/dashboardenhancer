const params = new URLSearchParams(window.location.search);

export const devMode = process.env.NODE_ENV === 'development';

export const hubIp = !devMode ? window.location.host : '192.168.1.211';
const path = window.location.pathname;
export const endpoint = `http://${hubIp}${path.substring(0, path.indexOf('/main'))}/`;
export const dashboardAppId = params.get('dashboardAppId');
export const dashboardAccessToken = params.get('dashboardAccessToken');
export const access_token = params.get('access_token');