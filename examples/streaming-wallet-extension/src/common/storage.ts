export const INSTANCE_ID_KEY = "instanceID";

export const clearStorageKeepingInstanceId = async () => {
  const instanceId = (await chrome.storage.local.get(INSTANCE_ID_KEY))
    ?.instanceID;
  await chrome.storage.local.clear();
  await chrome.storage.local.set({ [INSTANCE_ID_KEY]: instanceId });
};
