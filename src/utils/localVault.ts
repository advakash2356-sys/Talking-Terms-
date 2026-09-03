// Local Encrypted Context Memory Vault (100% Client-Side, Zero Server Transfer)

export interface UserContextMemory {
  enabled: boolean;
  userTopicSummary: string;
  preferredTone: 'direct' | 'gentle' | 'listening';
  recentVibeTags: string[];
  lastCallDate: string;
}

const MEMORY_KEY = 'talking_terms_client_context_vault';

export function getClientContextMemory(): UserContextMemory {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    enabled: true,
    userTopicSummary: '',
    preferredTone: 'listening',
    recentVibeTags: [],
    lastCallDate: new Date().toISOString(),
  };
}

export function saveClientContextMemory(data: Partial<UserContextMemory>): UserContextMemory {
  const current = getClientContextMemory();
  const updated: UserContextMemory = { ...current, ...data };
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save client context memory', e);
  }
  return updated;
}

export function purgeAllClientData(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
    // Clear indexedDB databases if any
    if (window.indexedDB && window.indexedDB.databases) {
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        });
      });
    }
  } catch (e) {
    console.error('Failed to purge client data', e);
  }
}
