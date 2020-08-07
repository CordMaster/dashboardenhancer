function registerSW() {
  if(navigator.serviceWorker) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js').then(() => {
        console.log('Service worker registered!');
      }, () => {
        console.error('Error registering service worker');
      });
    });
  }
}

self.addEventListener('install', event => {
  return true;
});

self.addEventListener('fetch', event => {
  return(fetch(event.request));
});