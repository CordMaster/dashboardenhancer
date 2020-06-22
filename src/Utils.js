import { devMode } from './Constants.js';

export function pushHistoryPreserve(history, location) {
  history.push(`${location}${window.location.search}`);
}

export function toSentence(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function rectOverlaps(a, b) {
  const blIn = (a.x > b.x && a.x < b.x + b.w) && (a.y > b.y && a.y < b.y + b.h);
  const tlIn = (a.x + a.w > b.x && a.x + a.w < b.x + b.w) && (a.y + a.h > b.y && a.y + a.h < b.y + b.h);

  return blIn || tlIn;
}

export function rectInside(a, b) {
  const blIn = (a.x > b.x && a.x < b.x + b.w) && (a.y > b.y && a.y < b.y + b.h);
  const tlIn = (a.x + a.w > b.x && a.x + a.w < b.x + b.w) && (a.y + a.h > b.y && a.y + a.h < b.y + b.h);

  return blIn && tlIn;
}

export function expandRect(rect, x) {
  return {
    x: rect.x - 1,
    y: rect.y - 1,
    w: rect.w + 1,
    h: rect.h + 1
  }
}

export function devLog(str) {
  if(devMode) console.log(str);
}