export const startListeningForNavigations = () => {
  const urlFilter = {
    url: [
      { hostSuffix: "youtube.com" },
      { hostSuffix: "twitch.tv" },
      { pathContains: "demos/streaming" },
    ],
  };
  chrome.webNavigation.onCompleted.addListener(onNavigation, urlFilter);
  // chrome.webNavigation.onCommitted.addListener((details) => { console.log(`onCommitted: ${details}`)}, urlFilter);
  // chrome.webNavigation.onBeforeNavigate.addListener((details) => { console.log(`onBeforeNavigate: ${details}`)}, urlFilter);
  // chrome.webNavigation.onDOMContentLoaded.addListener((details) => { console.log(`onDOMContentLoaded: ${details}`)}, urlFilter);
  // chrome.webNavigation.onTabReplaced.addListener((details) => { console.log(`onTabReplaced: ${details}`)}, urlFilter);
  chrome.webNavigation.onHistoryStateUpdated.addListener(
    onNavigation,
    urlFilter
  );
  // chrome.webNavigation.onReferenceFragmentUpdated.addListener((details) => { console.log(`onReferenceFragmentUpdated: ${details}`)}, urlFilter);
};

const onNavigation = (
  details: chrome.webNavigation.WebNavigationFramedCallbackDetails
) => {
  console.log(`Navigated to ${details.url}`);
  chrome.tabs.sendMessage(
    details.tabId,
    { id: "get_video_details" },
    (response) => {
      console.log(`Got details from tab: ${JSON.stringify(response)}`);
    }
  );
};
