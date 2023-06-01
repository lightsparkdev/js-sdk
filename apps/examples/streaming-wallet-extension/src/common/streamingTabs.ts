const URLS = [
  "https://localhost:3000/demos/streaming",
  "http://192.168.86.248:3000/demos/streaming",
  "https://dev.dev.sparkinfra.net/demos/streaming",
  "https://app.lightspark.com/demos/streaming",
];

export const findActiveStreamingDemoTabs = () => {
  const allAndActive = Promise.all([
    new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ url: URLS }, (tabs) => resolve(tabs));
    }),
    new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query(
        { url: URLS, active: true, lastFocusedWindow: true },
        (tabs) => resolve(tabs)
      );
    }),
  ]);
  return allAndActive.then(([all, active]) => {
    if (active.length > 0) {
      return active;
    }
    // Reverse the order so that the most recently opened tab is returned.
    return all.reverse();
  });
};
