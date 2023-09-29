/**
 * Loads the value associated with the key, with the provided default as a fallback
 * @param key 
 * @param defaultValue 
 * @returns 
 */
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

/**
 * Saves the key-value pair, overwriting whatever was there
 * @param key
 * @param value 
 * @returns 
 */
export function save<T> (key: string, value: T): Promise<T> {
  return chrome.storage.local.set({ [key]: value }).then(() => Promise.resolve(value));
}

/**
 * Updates the value in the key by loading it first, then saving returned value from txFn
 * @param key 
 * @param defaultValue 
 * @param txFn 
 * @returns 
 */
export function update<T> (key: string, defaultValue: T, txFn: (oldVal: T) => T): Promise<T> {
  return load(key, defaultValue).then(oldValue => save(key, txFn(oldValue)));
}
