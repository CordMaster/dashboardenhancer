export function pushHistoryPreserve(history, location) {
  history.push(`${location}${window.location.search}`);
}

export function toSentence(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}