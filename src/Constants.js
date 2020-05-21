import $ from 'jquery';

export const endpoint = $('meta[name="endpoint"]').attr('content');
const search = window.location.search;
export const access_token = search.indexOf('access_token=') !== -1 ? search.substring(search.indexOf('access_token=') + 'access_token='.length, search.indexOf('&') === -1 ? search.length : search.indexOf('&')) : '';