import { devMode } from './Constants.js';

export function pushHistoryPreserve(history, location) {
  history.push(`${location}${window.location.search}`);
}

export function toSentence(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function devLog(str) {
  if(devMode) console.log(str);
}