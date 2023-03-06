export const findActiveStreamingDemoTabs = () => {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query(
      {
        url: [
          "https://localhost:3000/demos/streaming",
          "http://192.168.86.248:3000/demos/streaming",
          "https://dev.dev.sparkinfra.net/demos/streaming",
          "https://app.lightspark.com/demos/streaming",
        ],
      },
      (tabs) => resolve(tabs)
    );
  });
};
