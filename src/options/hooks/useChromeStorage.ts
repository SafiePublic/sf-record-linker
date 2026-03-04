import { useState, useEffect } from "preact/hooks";
import type { ObjectSettings } from "../../lib/types";

export function useChromeStorage(): [
  ObjectSettings,
  (settings: ObjectSettings) => Promise<void>,
] {
  const [settings, setSettings] = useState<ObjectSettings>({});

  useEffect(() => {
    chrome.storage.sync.get({ objectSettings: {} }, (result) => {
      setSettings(result.objectSettings as ObjectSettings);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.objectSettings) {
        setSettings(changes.objectSettings.newValue as ObjectSettings);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const save = (newSettings: ObjectSettings): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ objectSettings: newSettings }, () => {
        setSettings(newSettings);
        resolve();
      });
    });
  };

  return [settings, save];
}
