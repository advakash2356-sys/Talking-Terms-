/**
 * Local Call History Database using native browser IndexedDB
 * Ensures 100% user privacy by never syncing truncated call metadata to remote servers.
 */

export interface LocalCallRecord {
  id: string;
  callerMonikerTruncated: string; // e.g. "Anonym...84"
  topicTruncated: string; // Max 35 chars, e.g. "UPSC Mains GS3 Anxiety..."
  category: string;
  escalatedFromPersona: string;
  durationSeconds: number;
  durationFormatted: string;
  earnedInr: number;
  timestamp: string;
  timestampEpoch: number;
  status: 'completed' | 'disconnected_by_caller' | 'transferred';
  zkEncryptedOfflineTag: string;
}

const DB_NAME = 'TalkingTerms_ListenerDB';
const DB_VERSION = 1;
const STORE_NAME = 'local_call_history';

/**
 * Opens or upgrades the IndexedDB database
 */
export function openLocalCallHistoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestampEpoch', 'timestampEpoch', { unique: false });
        objectStore.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves a truncated call record to IndexedDB
 */
export async function saveLocalCallRecord(record: LocalCallRecord): Promise<void> {
  const db = await openLocalCallHistoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Retrieves all truncated call records from IndexedDB, sorted newest first
 */
export async function getAllLocalCallRecords(): Promise<LocalCallRecord[]> {
  const db = await openLocalCallHistoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const records: LocalCallRecord[] = req.result || [];
      // Sort newest first
      records.sort((a, b) => b.timestampEpoch - a.timestampEpoch);
      resolve(records);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Deletes a single record by ID
 */
export async function deleteLocalCallRecord(id: string): Promise<void> {
  const db = await openLocalCallHistoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Clears all local call records from IndexedDB (Secure Local Shred)
 */
export async function clearAllLocalCallRecords(): Promise<void> {
  const db = await openLocalCallHistoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Helper to populate initial truncated sample records if IndexedDB is empty
 */
export async function seedInitialLocalHistoryIfEmpty(): Promise<LocalCallRecord[]> {
  try {
    const existing = await getAllLocalCallRecords();
    if (existing.length > 0) {
      return existing;
    }

    const initialSeed: LocalCallRecord[] = [
      {
        id: `call_seed_${Date.now() - 3600000 * 2}`,
        callerMonikerTruncated: 'Anon-Del***82',
        topicTruncated: 'UPSC Mains GS-3 syllabus panic...',
        category: 'Career & Exams',
        escalatedFromPersona: 'Kabir (UPSC Senior)',
        durationSeconds: 384,
        durationFormatted: '6m 24s',
        earnedInr: 48,
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
        timestampEpoch: Date.now() - 3600000 * 2,
        status: 'completed',
        zkEncryptedOfflineTag: 'OFFLINE_INDEXED_DB_LOCAL_STORAGE',
      },
      {
        id: `call_seed_${Date.now() - 3600000 * 7}`,
        callerMonikerTruncated: 'Anon-Ncr***49',
        topicTruncated: 'Late night loneliness in PG room...',
        category: 'Isolation & Loneliness',
        escalatedFromPersona: 'Simran (Late Night RJ)',
        durationSeconds: 512,
        durationFormatted: '8m 32s',
        earnedInr: 64,
        timestamp: new Date(Date.now() - 3600000 * 7).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
        timestampEpoch: Date.now() - 3600000 * 7,
        status: 'completed',
        zkEncryptedOfflineTag: 'OFFLINE_INDEXED_DB_LOCAL_STORAGE',
      },
      {
        id: `call_seed_${Date.now() - 3600000 * 26}`,
        callerMonikerTruncated: 'Anon-Ggn***15',
        topicTruncated: 'Gurgaon tech appraisal anxiety...',
        category: 'Corporate Burnout',
        escalatedFromPersona: 'Aryan (Cyberhub Techie)',
        durationSeconds: 430,
        durationFormatted: '7m 10s',
        earnedInr: 54,
        timestamp: 'Yesterday, 10:15 PM',
        timestampEpoch: Date.now() - 3600000 * 26,
        status: 'completed',
        zkEncryptedOfflineTag: 'OFFLINE_INDEXED_DB_LOCAL_STORAGE',
      }
    ];

    for (const item of initialSeed) {
      await saveLocalCallRecord(item);
    }

    return await getAllLocalCallRecords();
  } catch (e) {
    console.warn('Could not seed local IndexedDB history', e);
    return [];
  }
}
