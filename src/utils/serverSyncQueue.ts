import { voiceSnippetDB, VoiceSnippetRecord } from './voiceSnippetDB';

type QueueListener = (queue: VoiceSnippetRecord[]) => void;

class ServerSyncQueueService {
  private isProcessing = false;
  private listeners: Set<QueueListener> = new Set();

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    this.emitQueueUpdate();
    return () => this.listeners.delete(listener);
  }

  private async emitQueueUpdate() {
    try {
      const all = await voiceSnippetDB.getAllSnippets();
      this.listeners.forEach((fn) => fn(all));
    } catch {
      // Ignore background errors
    }
  }

  /**
   * Enqueues a snippet for server-side speech intelligence / calendar & notes sync.
   */
  public async enqueueForServerProcessing(snippet: VoiceSnippetRecord): Promise<void> {
    const updated: VoiceSnippetRecord = {
      ...snippet,
      status: 'queued',
      updatedAt: Date.now(),
    };
    await voiceSnippetDB.saveSnippet(updated);
    this.emitQueueUpdate();
    this.triggerQueueProcessor();
  }

  /**
   * Background processor: iterates through 'queued' items, processes them,
   * handles retry backoff, and sets status to 'synced' or 'failed'.
   */
  public async triggerQueueProcessor(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const all = await voiceSnippetDB.getAllSnippets();
      const pending = all.filter((s) => s.status === 'queued' || (s.status === 'failed' && s.retryCount < 3));

      for (const item of pending) {
        // Mark as syncing
        item.status = 'syncing';
        item.updatedAt = Date.now();
        await voiceSnippetDB.saveSnippet(item);
        this.emitQueueUpdate();

        try {
          // Simulated server processing pipeline (AI structuring, transcript validation, cloud sync)
          await this.mockServerProcess(item);

          // Mark as successfully synced
          item.status = 'synced';
          item.updatedAt = Date.now();
          item.aiMetadata = {
            summary: item.transcript.length > 50 ? item.transcript.slice(0, 48) + '...' : item.transcript,
            actionItems: ['Review voice note', 'Auto-tagged in Delhi NCR Cloud'],
            sentiment: 'Productive / Confident',
          };
          await voiceSnippetDB.saveSnippet(item);
          this.emitQueueUpdate();
        } catch (err: any) {
          item.status = 'failed';
          item.retryCount = (item.retryCount || 0) + 1;
          item.error = err?.message || 'Network sync timeout';
          item.updatedAt = Date.now();
          await voiceSnippetDB.saveSnippet(item);
          this.emitQueueUpdate();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async mockServerProcess(item: VoiceSnippetRecord): Promise<void> {
    // 1.2 second simulated server roundtrip
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Fail-safe validation
        if (!item.transcript.trim()) {
          reject(new Error('Empty transcript payload.'));
        } else {
          resolve();
        }
      }, 1200);
    });
  }
}

export const serverSyncQueue = new ServerSyncQueueService();
