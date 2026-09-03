/**
 * Robust IndexedDB Storage & Offline Queue Engine for Voice Snippets
 * Ensures zero data loss across page refreshes and tab crashes.
 */

export interface VoiceSnippetRecord {
  id: string;
  transcript: string;
  interimText?: string;
  audioBlob?: Blob;
  audioUrl?: string;
  durationSeconds: number;
  language: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'saved' | 'queued' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
  aiMetadata?: {
    summary?: string;
    actionItems?: string[];
    sentiment?: string;
  };
}

const DB_NAME = 'TalkingTermsVoiceDB';
const DB_VERSION = 1;
const STORE_NAME = 'voice_snippets';

class VoiceSnippetDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB.'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Saves or updates a snippet in IndexedDB.
   */
  async saveSnippet(snippet: VoiceSnippetRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(snippet);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves a single snippet by ID.
   */
  async getSnippet(id: string): Promise<VoiceSnippetRecord | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Gets all voice snippets, sorted by most recent first.
   */
  async getAllSnippets(): Promise<VoiceSnippetRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const results: VoiceSnippetRecord[] = request.result || [];
        // Sort newest first
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves the active or most recent in-progress draft snippet if one exists.
   */
  async getLatestDraft(): Promise<VoiceSnippetRecord | undefined> {
    const all = await this.getAllSnippets();
    return all.find((s) => s.status === 'draft' || s.status === 'saved');
  }

  /**
   * Deletes a snippet by ID.
   */
  async deleteSnippet(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clears all stored snippets.
   */
  async clearAll(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const voiceSnippetDB = new VoiceSnippetDB();
