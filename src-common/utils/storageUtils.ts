export function load<T> (key: string, defaultValue: T): Promise<T> {
  return chrome.storage.local.get(key)
    .then(res => {
      if (!res[key]) {
        chrome.storage.local.set({ [key]: defaultValue });
        return defaultValue;
      }
      return res[key] as T;
    });
}

export function save<T> (key: string, value: T): Promise<void> {
  return chrome.storage.local.set({ [key]: value });
}
