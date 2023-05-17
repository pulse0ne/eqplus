export default function loadStorageValue<T> (key: string, defaultValue: T): Promise<T> {
  return chrome.storage.local.get(key)
    .then(res => {
      if (!res[key]) {
        chrome.storage.local.set({ [key]: defaultValue });
        return defaultValue;
      }
      return res[key] as T;
    });
}
