import $ from 'jquery';

const params = new URLSearchParams(window.location.search);

export const endpoint = params.get('endpoint');
export const hubIp = params.get('hubIp');
export const dashboardAppId = params.get('dashboardAppId');
export const access_token = params.get('access_token');

export const devMode = process.env.NODE_ENV === 'development';