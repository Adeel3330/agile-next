// Settings Cache Utility
// Centralized cache management for settings

let settingsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function getCachedSettings() {
  const now = Date.now();
  if (settingsCache && (now - settingsCache.timestamp) < CACHE_DURATION) {
    return settingsCache.data;
  }
  return null;
}

export function setCachedSettings(data: any) {
  settingsCache = {
    data,
    timestamp: Date.now()
  };
}

export function clearSettingsCache() {
  settingsCache = null;
}
