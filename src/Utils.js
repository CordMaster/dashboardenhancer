import { devMode } from './Constants.js';

export function pushHistoryPreserve(history, location) {
  history.push(`${location}${window.location.search}`);
}

export function toSentence(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function rectOverlaps(a, b) {
  return !(a.x >= b.x + b.w || a.x + a.w <= b.x || a.y >= b.y + b.h || a.y + a.y <= b.h);
}

export function rectInside(a, b) {
  return (a.x >= b.x && a.y >= b.y && a.x <= b.x + b.w && a.y <= b.y + b.h) && (a.x + a.w >= b.x && a.y + a.h >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h);
}

export function expandRect(rect, delta) {
  return {
    x: rect.x * -delta,
    y: rect.y * -delta,
    w: rect.w + delta * 2,
    h: rect.h + delta * 2
  }
}

export function devLog(str) {
  if(devMode) console.log(str);
}