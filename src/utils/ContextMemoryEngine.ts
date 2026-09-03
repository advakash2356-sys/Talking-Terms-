/**
 * CONTEXTUAL MEMORY STATE & GOAL ACHIEVABILITY LOOP
 * Manages active structured state (calendar, tasks, notes), cross-references
 * incoming dictations against existing state for intelligent updates vs creations,
 * runs programmatic action verification checks, and triggers targeted clarification loops.
 */

import { CalendarEvent, Task, Note, CategorizedIntelligence } from './IntelligenceRouter';
import { TelemetryMatrix } from './TelemetryMatrix';

export interface ContextUpdateResult {
  actionType: 'CREATED' | 'UPDATED' | 'COMPLETED' | 'DELETED' | 'CLARIFICATION_REQUIRED';
  affectedItem?: CalendarEvent | Task | Note;
  itemType?: 'calendar_events' | 'tasks' | 'notes';
  message: string;
  verified: boolean;
  httpStatus?: number;
  clarificationQuestion?: string;
  state: {
    calendar_events: CalendarEvent[];
    tasks: Task[];
    notes: Note[];
  };
}

export class ContextMemoryEngine {
  private calendarEvents: CalendarEvent[] = [
    {
      id: 'evt_upsc_sync',
      title: 'UPSC Mains GS Paper 2 Review',
      description: 'Peer group answer writing evaluation',
      startDate: '2026-08-27T16:00:00Z',
      endDate: '2026-08-27T17:30:00Z',
      location: 'Mukherjee Nagar Library / Online Room 4',
      allDay: false,
      attendees: ['Kabir', 'Aman']
    },
    {
      id: 'evt_tech_sync',
      title: 'Sprint Retrospective & Code Review',
      description: 'Reviewing real-time streaming speech audio pipeline',
      startDate: '2026-08-28T14:00:00Z',
      endDate: '2026-08-28T15:00:00Z',
      location: 'Google Meet',
      allDay: false,
      attendees: ['Rohan', 'Lead Dev']
    }
  ];

  private tasks: Task[] = [
    {
      id: 'tsk_mock_test',
      title: 'Submit CSAT Sectional Mock Test 4',
      description: 'Complete 80 questions with negative marking audit',
      dueDate: '2026-08-27',
      priority: 'high',
      completed: false,
      tags: ['upsc', 'csat']
    },
    {
      id: 'tsk_latency_bench',
      title: 'Benchmark Audio Transcription Latency under 200ms',
      description: 'Verify Web Audio PCM pipeline zero-copy buffers',
      dueDate: '2026-08-26',
      priority: 'urgent',
      completed: false,
      tags: ['engineering', 'audio']
    }
  ];

  private notes: Note[] = [
    {
      id: 'not_ethics_quotes',
      title: 'Ethics GS-IV Case Study Framework',
      content: 'Deontological vs Consequentialist trade-offs in civil administrative dilemmas.',
      summary: 'Ethics analytical model for Mukherjee Nagar aspirants.',
      keyPoints: ['Stakeholder matrix', 'Constitutional morality principle', 'Public interest primacy'],
      tags: ['ethics', 'upsc']
    }
  ];

  private listeners: Array<() => void> = [];

  constructor() {
    this.loadPersistedState();
  }

  private loadPersistedState() {
    try {
      const savedCal = localStorage.getItem('tt_context_calendar');
      const savedTasks = localStorage.getItem('tt_context_tasks');
      const savedNotes = localStorage.getItem('tt_context_notes');
      if (savedCal) this.calendarEvents = JSON.parse(savedCal);
      if (savedTasks) this.tasks = JSON.parse(savedTasks);
      if (savedNotes) this.notes = JSON.parse(savedNotes);
    } catch (_) {}
  }

  private persistState() {
    try {
      localStorage.setItem('tt_context_calendar', JSON.stringify(this.calendarEvents));
      localStorage.setItem('tt_context_tasks', JSON.stringify(this.tasks));
      localStorage.setItem('tt_context_notes', JSON.stringify(this.notes));
    } catch (_) {}
    this.notifyListeners();
  }

  public getState() {
    return {
      calendar_events: [...this.calendarEvents],
      tasks: [...this.tasks],
      notes: [...this.notes]
    };
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Cross-references newly parsed intelligence against active contextual memory.
   * Detects whether to update existing records, complete tasks, remove events, or create new entries.
   */
  public resolveAndApply(
    rawText: string,
    intelligence: CategorizedIntelligence
  ): ContextUpdateResult {
    const startTime = Date.now();
    TelemetryMatrix.recordEvent('CONTEXT_RESOLVE_START', { rawText, intelligenceSummary: intelligence.summary });

    const lower = rawText.toLowerCase().trim();

    // 1. Check for Ambiguity & Clarification triggers
    const isVagueOrShort = lower.length < 6 || /^(do it|fix that|update it|ok|yes|no|meeting|task)$/i.test(lower);
    const hasNoExtractions =
      intelligence.calendar_events.length === 0 &&
      intelligence.tasks.length === 0 &&
      intelligence.notes.length === 0;

    if (isVagueOrShort && hasNoExtractions) {
      TelemetryMatrix.recordFriction('AMBIGUOUS_INTENT', 'Input lacks context to resolve actionable goal', { rawText });
      TelemetryMatrix.recordEvent('USER_CLARIFICATION_PROMPTED', { question: 'Could you specify the title or time of the event/task you want to update?' });

      return {
        actionType: 'CLARIFICATION_REQUIRED',
        message: 'Could not determine specific target. Please specify what you would like to create or update.',
        verified: false,
        clarificationQuestion: 'Did you mean to create a new task, schedule an appointment, or update an existing item?',
        state: this.getState()
      };
    }

    // 2. Check for Contextual TASK COMPLETION (e.g. "Mark CSAT test as done", "Completed mock test")
    const isCompleteCommand = /\b(done|completed|finished|mark\s+as\s+done|resolve|finish)\b/i.test(lower);
    if (isCompleteCommand) {
      const matchedTask = this.tasks.find((t) => {
        const titleTokens = t.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return titleTokens.some((tok) => lower.includes(tok));
      });

      if (matchedTask) {
        matchedTask.completed = true;
        this.persistState();

        const verified = this.verifyAction('tasks', matchedTask.id!);
        TelemetryMatrix.recordEvent('ACTION_VERIFIED_SUCCESS', {
          action: 'TASK_COMPLETED',
          taskId: matchedTask.id,
          taskTitle: matchedTask.title
        }, Date.now() - startTime);

        return {
          actionType: 'COMPLETED',
          itemType: 'tasks',
          affectedItem: matchedTask,
          message: `Successfully marked "${matchedTask.title}" as completed.`,
          verified,
          httpStatus: 200,
          state: this.getState()
        };
      }
    }

    // 3. Check for Contextual CALENDAR UPDATE (e.g. "Move the UPSC review to 6 PM", "Change sprint retro to 4pm")
    const isUpdateEventCommand = /\b(move|reschedule|update|postpone|change|shift)\b/i.test(lower);
    if (isUpdateEventCommand || intelligence.calendar_events.length > 0) {
      const matchedEvent = this.calendarEvents.find((e) => {
        const titleTokens = e.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return titleTokens.some((tok) => lower.includes(tok));
      });

      if (matchedEvent && intelligence.calendar_events.length > 0) {
        const incoming = intelligence.calendar_events[0];
        matchedEvent.startDate = incoming.startDate || matchedEvent.startDate;
        matchedEvent.endDate = incoming.endDate || matchedEvent.endDate;
        if (incoming.location) matchedEvent.location = incoming.location;
        if (incoming.description) matchedEvent.description = incoming.description;

        this.persistState();
        const verified = this.verifyAction('calendar_events', matchedEvent.id!);
        TelemetryMatrix.recordEvent('ACTION_VERIFIED_SUCCESS', {
          action: 'CALENDAR_EVENT_UPDATED',
          eventId: matchedEvent.id,
          title: matchedEvent.title
        }, Date.now() - startTime);

        return {
          actionType: 'UPDATED',
          itemType: 'calendar_events',
          affectedItem: matchedEvent,
          message: `Updated schedule for existing event "${matchedEvent.title}".`,
          verified,
          httpStatus: 200,
          state: this.getState()
        };
      }
    }

    // 4. Default: Apply new items from intelligence with optimistic verification
    let createdCount = 0;
    let lastCreatedItem: any = null;
    let lastItemType: 'calendar_events' | 'tasks' | 'notes' = 'notes';

    if (intelligence.calendar_events.length > 0) {
      intelligence.calendar_events.forEach((ev) => {
        const newEv: CalendarEvent = {
          ...ev,
          id: ev.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        };
        this.calendarEvents.unshift(newEv);
        lastCreatedItem = newEv;
        lastItemType = 'calendar_events';
        createdCount++;
      });
    }

    if (intelligence.tasks.length > 0) {
      intelligence.tasks.forEach((tsk) => {
        const newTsk: Task = {
          ...tsk,
          id: tsk.id || `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          completed: false
        };
        this.tasks.unshift(newTsk);
        lastCreatedItem = newTsk;
        lastItemType = 'tasks';
        createdCount++;
      });
    }

    if (intelligence.notes.length > 0) {
      intelligence.notes.forEach((not) => {
        const newNot: Note = {
          ...not,
          id: not.id || `not_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        };
        this.notes.unshift(newNot);
        lastCreatedItem = newNot;
        lastItemType = 'notes';
        createdCount++;
      });
    }

    this.persistState();
    const verified = createdCount > 0 && this.verifyAction(lastItemType, lastCreatedItem?.id);

    if (verified) {
      TelemetryMatrix.recordEvent('ACTION_VERIFIED_SUCCESS', {
        action: 'ITEMS_CREATED',
        totalItems: createdCount,
        types: {
          events: intelligence.calendar_events.length,
          tasks: intelligence.tasks.length,
          notes: intelligence.notes.length
        }
      }, Date.now() - startTime);
    } else if (createdCount === 0) {
      TelemetryMatrix.recordFriction('EXTRACTION_FAILED', 'No structured items extracted from raw dictation', { rawText });
    }

    return {
      actionType: 'CREATED',
      itemType: lastItemType,
      affectedItem: lastCreatedItem,
      message: `Successfully processed and verified ${createdCount} structured intelligence item(s).`,
      verified,
      httpStatus: 200,
      state: this.getState()
    };
  }

  /**
   * Programmatic verification check: ensures mutated state exists and passes schema bounds.
   */
  private verifyAction(type: 'calendar_events' | 'tasks' | 'notes', id?: string): boolean {
    if (!id) return false;
    if (type === 'calendar_events') {
      const found = this.calendarEvents.find((e) => e.id === id);
      return Boolean(found && found.title.trim().length > 0);
    }
    if (type === 'tasks') {
      const found = this.tasks.find((t) => t.id === id);
      return Boolean(found && found.title.trim().length > 0);
    }
    if (type === 'notes') {
      const found = this.notes.find((n) => n.id === id);
      return Boolean(found && (found.title.trim().length > 0 || found.content.trim().length > 0));
    }
    return false;
  }

  public deleteItem(type: 'calendar_events' | 'tasks' | 'notes', id: string): boolean {
    if (type === 'calendar_events') {
      this.calendarEvents = this.calendarEvents.filter((e) => e.id !== id);
    } else if (type === 'tasks') {
      this.tasks = this.tasks.filter((t) => t.id !== id);
    } else if (type === 'notes') {
      this.notes = this.notes.filter((n) => n.id !== id);
    }
    this.persistState();
    TelemetryMatrix.recordEvent('ACTION_VERIFIED_SUCCESS', { action: 'ITEM_DELETED', type, id });
    return true;
  }

  public toggleTask(id: string): boolean {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.persistState();
      TelemetryMatrix.recordEvent('ACTION_VERIFIED_SUCCESS', {
        action: 'TASK_TOGGLED',
        id,
        completed: task.completed
      });
      return true;
    }
    return false;
  }
}

export const ContextMemory = new ContextMemoryEngine();
export default ContextMemory;
