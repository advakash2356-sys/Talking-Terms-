import { GoogleGenAI, Type } from "@google/genai";
import { TelemetryMatrix } from "./TelemetryMatrix";

/**
 * Interface definition for a structured Calendar Event item extracted from raw text.
 */
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  allDay?: boolean;
  attendees?: string[];
  recurrence?: string;
  reminderMinutes?: number;
}

/**
 * Interface definition for a structured Task item extracted from raw text.
 */
export interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  completed?: boolean;
  tags?: string[];
  estimatedMinutes?: number;
}

/**
 * Interface definition for a structured Note item extracted from raw text.
 */
export interface Note {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  summary?: string;
  keyPoints?: string[];
  references?: string[];
}

/**
 * Unified response format categorizing raw input into the three distinct JSON structures.
 */
export interface CategorizedIntelligence {
  calendar_events: CalendarEvent[];
  tasks: Task[];
  notes: Note[];
  rawText: string;
  summary?: string;
  primaryCategory: "calendar_events" | "tasks" | "notes" | "mixed";
  metadata?: {
    totalItems: number;
    processedAt: string;
    modelUsed?: string;
    latencyMs?: number;
    source?: "gemini_api" | "server_proxy" | "heuristic_fallback";
  };
}

/**
 * Options for configuring the Intelligence Router execution.
 */
export interface RouterOptions {
  apiKey?: string;
  model?: string;
  apiEndpoint?: string;
  includeSummary?: boolean;
  referenceDate?: string;
  timeoutMs?: number;
}

/**
 * System instruction defining the precise categorization logic for Gemini.
 */
const INTELLIGENCE_ROUTER_SYSTEM_INSTRUCTION = `
You are an expert Intelligence Router & Semantic Categorizer.
Your goal is to parse unorganized, ambiguous, or structured raw text input and accurately extract and categorize items into THREE distinct JSON categories:

1. calendar_events:
   - Specific meetings, appointments, events, flights, calls, webinars, or occurrences tied to explicit or relative times/dates (e.g. "tomorrow at 3pm", "August 28 2026", "next Monday team sync").
   - Extract title, description, startDate (ISO-8601 formatted or explicit readable string if relative), endDate, location (physical place or virtual link), allDay flag, and attendees.

2. tasks:
   - Action items, todos, deliverables, follow-ups, chores, work items, or commitments that need completion (e.g. "Review CSAT mock test", "Submit pull request", "Call landlord").
   - Extract actionable title, detailed description, dueDate, priority ("low", "medium", "high", "urgent"), completed status (default false), and relevant tags.

3. notes:
   - Informational content, insights, brain dumps, study summaries, emotional journal reflections, reference materials, links, ideas, or meeting minutes that are not strictly time-blocked events or single todo items.
   - Extract a clear descriptive title, comprehensive content, brief summary, key bullet points, and contextual tags.

Categorization rules:
- If a sentence has a specific meeting time with someone, prioritize placing it in calendar_events (and add a task only if an explicit prep task exists).
- If text is a bulleted to-do list, prioritize tasks.
- If text is reference notes, thoughts, or general explanations, prioritize notes.
- If input spans multiple categories, extract each part into its respective category array and set primaryCategory to "mixed".
- Always output clean, valid, non-empty structures for populated items.
`;

/**
 * Response schema conforming to @google/genai SDK structured output specifications.
 */
export const INTELLIGENCE_ROUTER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    calendar_events: {
      type: Type.ARRAY,
      description: "List of calendar events, meetings, webinars, and time-bound commitments.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title or summary of the event" },
          description: { type: Type.STRING, description: "Detailed description or context" },
          startDate: { type: Type.STRING, description: "Start date and time (ISO format or explicit string)" },
          endDate: { type: Type.STRING, description: "End date and time if specified" },
          location: { type: Type.STRING, description: "Physical location, room, or online meeting URL" },
          allDay: { type: Type.BOOLEAN, description: "Whether this event spans the entire day" },
          attendees: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of people, emails, or participants involved"
          },
          recurrence: { type: Type.STRING, description: "Recurrence rule if repeating (e.g. weekly, daily)" }
        },
        required: ["title"]
      }
    },
    tasks: {
      type: Type.ARRAY,
      description: "List of actionable tasks, todos, action items, and follow-ups.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Concise, actionable task title" },
          description: { type: Type.STRING, description: "Detailed task instructions or notes" },
          dueDate: { type: Type.STRING, description: "Deadline or target completion date" },
          priority: {
            type: Type.STRING,
            description: "Priority tier: 'low', 'medium', 'high', or 'urgent'"
          },
          completed: { type: Type.BOOLEAN, description: "Completion status (default false)" },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Categorical tags (e.g. 'work', 'study', 'urgent')"
          }
        },
        required: ["title"]
      }
    },
    notes: {
      type: Type.ARRAY,
      description: "List of general knowledge notes, ideas, reflections, and informational text.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Descriptive title for the note" },
          content: { type: Type.STRING, description: "Full informative text and details" },
          summary: { type: Type.STRING, description: "One-sentence high-level summary" },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key bullet points and takeaways"
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Relevant topic tags"
          }
        },
        required: ["title", "content"]
      }
    },
    primaryCategory: {
      type: Type.STRING,
      description: "Primary intent: 'calendar_events', 'tasks', 'notes', or 'mixed'"
    },
    summary: {
      type: Type.STRING,
      description: "Concise summary of the overall categorized content"
    }
  },
  required: ["calendar_events", "tasks", "notes"]
};

/**
 * Intelligent Router class providing static and instance methods to categorize raw text.
 */
export class IntelligenceRouter {
  private apiKey?: string;
  private model: string;
  private apiEndpoint: string;

  constructor(options: RouterOptions = {}) {
    this.apiKey = options.apiKey || (typeof process !== "undefined" ? process.env.GEMINI_API_KEY : undefined);
    this.model = options.model || "gemini-3.1-flash-lite";
    this.apiEndpoint = options.apiEndpoint || "/api/intelligence/route";
  }


  /**
   * Main entry point: parses raw text into calendar_events, tasks, and notes.
   */
  public async route(rawText: string, options: RouterOptions = {}): Promise<CategorizedIntelligence> {
    const startTime = Date.now();
    const cleanText = (rawText || "").trim();

    TelemetryMatrix.recordEvent('LLM_ROUTING_START', {
      textLength: cleanText.length,
      sample: cleanText.substring(0, 60)
    });

    if (!cleanText) {
      TelemetryMatrix.recordFriction('TRANSCRIPT_EMPTY', 'Attempted routing on empty text string');
      return {
        calendar_events: [],
        tasks: [],
        notes: [],
        rawText: "",
        summary: "Empty input provided.",
        primaryCategory: "notes",
        metadata: {
          totalItems: 0,
          processedAt: new Date().toISOString(),
          latencyMs: 0,
          source: "heuristic_fallback"
        }
      };
    }

    const mergedOptions: RouterOptions = {
      model: options.model || this.model,
      apiKey: options.apiKey || this.apiKey,
      apiEndpoint: options.apiEndpoint || this.apiEndpoint,
      referenceDate: options.referenceDate || new Date().toISOString(),
      ...options
    };

    // 1. If running in server-side Node.js environment with direct API key access
    const isServerEnvironment = typeof window === "undefined" || (typeof process !== "undefined" && process.versions?.node);
    if (isServerEnvironment && mergedOptions.apiKey) {
      try {
        const result = await this.routeDirectWithGemini(cleanText, mergedOptions);
        const durationMs = Date.now() - startTime;
        result.metadata = {
          totalItems: result.calendar_events.length + result.tasks.length + result.notes.length,
          processedAt: new Date().toISOString(),
          modelUsed: mergedOptions.model,
          latencyMs: durationMs,
          source: "gemini_api"
        };
        TelemetryMatrix.recordEvent('LLM_ROUTING_SUCCESS', {
          source: 'gemini_api',
          items: result.metadata.totalItems,
          primaryCategory: result.primaryCategory
        }, durationMs);
        return result;
      } catch (err: any) {
        console.warn("[IntelligenceRouter] Direct Gemini invocation failed, falling back:", err);
        TelemetryMatrix.recordFriction('LLM_PARSE_ERROR', err?.message || 'Direct Gemini API error');
      }
    }

    // 2. If running in client browser, invoke server proxy endpoint
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const result = await this.routeViaServerProxy(cleanText, mergedOptions);
        const durationMs = Date.now() - startTime;
        result.metadata = {
          totalItems: result.calendar_events.length + result.tasks.length + result.notes.length,
          processedAt: new Date().toISOString(),
          modelUsed: mergedOptions.model,
          latencyMs: durationMs,
          source: "server_proxy"
        };
        TelemetryMatrix.recordEvent('LLM_ROUTING_SUCCESS', {
          source: 'server_proxy',
          items: result.metadata.totalItems,
          primaryCategory: result.primaryCategory
        }, durationMs);
        return result;
      } catch (err: any) {
        console.warn("[IntelligenceRouter] Server proxy call failed, applying pattern heuristic:", err);
        TelemetryMatrix.recordFriction('API_HTTP_ERROR', err?.message || 'Server proxy connection failed');
      }
    }

    // 3. Fallback heuristic for offline or unconfigured environments
    const fallbackResult = IntelligenceRouter.createPatternMatchingFallback(cleanText);
    const durationMs = Date.now() - startTime;
    fallbackResult.metadata = {
      totalItems: fallbackResult.calendar_events.length + fallbackResult.tasks.length + fallbackResult.notes.length,
      processedAt: new Date().toISOString(),
      latencyMs: durationMs,
      source: "heuristic_fallback"
    };
    TelemetryMatrix.recordEvent('LLM_ROUTING_SUCCESS', {
      source: 'heuristic_fallback',
      items: fallbackResult.metadata.totalItems,
      primaryCategory: fallbackResult.primaryCategory
    }, durationMs);
    return fallbackResult;
  }

  /**
   * Direct server-side call using @google/genai SDK.
   */
  private async routeDirectWithGemini(rawText: string, options: RouterOptions): Promise<CategorizedIntelligence> {
    const ai = new GoogleGenAI({
      apiKey: options.apiKey!,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const userPrompt = `Current Reference Date/Time: ${options.referenceDate || new Date().toISOString()}

Analyze the following raw input and categorize every discrete element into calendar_events, tasks, or notes:
"""
${rawText}
"""`;

    const response = await ai.models.generateContent({
      model: options.model || "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: INTELLIGENCE_ROUTER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: INTELLIGENCE_ROUTER_SCHEMA,
        temperature: 0.2
      }
    });

    const responseText = response.text?.trim() || "{}";
    const parsed = JSON.parse(responseText);

    return IntelligenceRouter.normalizeResult(parsed, rawText);
  }

  /**
   * Browser client proxy call to application server.
   */
  private async routeViaServerProxy(rawText: string, options: RouterOptions): Promise<CategorizedIntelligence> {
    const endpoint = options.apiEndpoint || "/api/intelligence/route";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: rawText,
        model: options.model,
        referenceDate: options.referenceDate
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return IntelligenceRouter.normalizeResult(data, rawText);
  }

  /**
   * Normalizes and validates parsed output into strict typed structures.
   */
  public static normalizeResult(data: any, rawText: string): CategorizedIntelligence {
    const events: CalendarEvent[] = Array.isArray(data?.calendar_events)
      ? data.calendar_events.map((e: any, idx: number) => ({
          id: e.id || `event_${Date.now()}_${idx}`,
          title: String(e.title || "Untitled Event").trim(),
          description: e.description ? String(e.description).trim() : undefined,
          startDate: e.startDate ? String(e.startDate).trim() : undefined,
          endDate: e.endDate ? String(e.endDate).trim() : undefined,
          location: e.location ? String(e.location).trim() : undefined,
          allDay: Boolean(e.allDay),
          attendees: Array.isArray(e.attendees) ? e.attendees.map(String) : undefined,
          recurrence: e.recurrence ? String(e.recurrence) : undefined
        }))
      : [];

    const tasks: Task[] = Array.isArray(data?.tasks)
      ? data.tasks.map((t: any, idx: number) => ({
          id: t.id || `task_${Date.now()}_${idx}`,
          title: String(t.title || "Untitled Task").trim(),
          description: t.description ? String(t.description).trim() : undefined,
          dueDate: t.dueDate ? String(t.dueDate).trim() : undefined,
          priority: ["low", "medium", "high", "urgent"].includes(String(t.priority).toLowerCase())
            ? (String(t.priority).toLowerCase() as Task["priority"])
            : "medium",
          completed: Boolean(t.completed),
          tags: Array.isArray(t.tags) ? t.tags.map(String) : []
        }))
      : [];

    const notes: Note[] = Array.isArray(data?.notes)
      ? data.notes.map((n: any, idx: number) => ({
          id: n.id || `note_${Date.now()}_${idx}`,
          title: String(n.title || "Untitled Note").trim(),
          content: String(n.content || "").trim(),
          summary: n.summary ? String(n.summary).trim() : undefined,
          keyPoints: Array.isArray(n.keyPoints) ? n.keyPoints.map(String) : [],
          tags: Array.isArray(n.tags) ? n.tags.map(String) : []
        }))
      : [];

    // Determine primary category
    let primary: "calendar_events" | "tasks" | "notes" | "mixed" = "notes";
    const counts = [
      { key: "calendar_events" as const, count: events.length },
      { key: "tasks" as const, count: tasks.length },
      { key: "notes" as const, count: notes.length }
    ].filter((c) => c.count > 0);

    if (counts.length > 1) {
      primary = "mixed";
    } else if (counts.length === 1) {
      primary = counts[0].key;
    } else if (data?.primaryCategory && ["calendar_events", "tasks", "notes", "mixed"].includes(data.primaryCategory)) {
      primary = data.primaryCategory;
    }

    return {
      calendar_events: events,
      tasks,
      notes,
      rawText,
      summary: data?.summary ? String(data.summary) : undefined,
      primaryCategory: primary
    };
  }

  /**
   * Deterministic pattern-matching fallback parser when offline or without API connectivity.
   */
  public static createPatternMatchingFallback(rawText: string): CategorizedIntelligence {
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const events: CalendarEvent[] = [];
    const tasks: Task[] = [];
    const noteLines: string[] = [];

    const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)|\d{1,2}:\d{2})\b/;
    const dateKeywords = /\b(today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
    const taskKeywords = /^(?:[-*•]\s*\[\s*\]|[-*•]\s*(?:todo|task|need to|must|have to|buy|call|email|review|submit|prepare|send|finish|complete)|todo:|task:)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Task pattern check
      if (taskKeywords.test(line) || /^\[\s*\]/.test(line)) {
        const cleanTitle = line.replace(/^(?:[-*•]\s*\[\s*\]|[-*•]|\[\s*\]|todo:|task:)\s*/i, "").trim();
        const hasUrgent = /\b(urgent|asap|priority|crucial|immediately)\b/i.test(line);
        tasks.push({
          id: `task_${Date.now()}_${i}`,
          title: cleanTitle || line,
          completed: false,
          priority: hasUrgent ? "high" : "medium",
          tags: ["extracted"]
        });
        continue;
      }

      // 2. Calendar Event pattern check (contains specific time + date words or meeting/call)
      const hasTime = timeRegex.test(line);
      const hasDate = dateKeywords.test(line);
      const isMeeting = /\b(meeting|sync|call|appointment|interview|webinar|flight|dinner|lunch|breakfast|session|party)\b/i.test(line);

      if ((hasTime && (hasDate || isMeeting)) || (isMeeting && hasDate)) {
        events.push({
          id: `event_${Date.now()}_${i}`,
          title: line.replace(/^[-*•]\s*/, ""),
          startDate: hasTime ? line.match(timeRegex)?.[0] : undefined,
          allDay: !hasTime
        });
        continue;
      }

      // 3. Otherwise accumulate into Notes
      noteLines.push(line);
    }

    const notes: Note[] = [];
    if (noteLines.length > 0) {
      const firstLine = noteLines[0].replace(/^#+\s*/, "").replace(/^[-*•]\s*/, "");
      notes.push({
        id: `note_${Date.now()}_0`,
        title: firstLine.length > 50 ? firstLine.substring(0, 47) + "..." : firstLine || "General Note",
        content: noteLines.join("\n"),
        keyPoints: noteLines.slice(1).map((l) => l.replace(/^[-*•]\s*/, "")).filter(Boolean)
      });
    }

    let primary: "calendar_events" | "tasks" | "notes" | "mixed" = "notes";
    const counts = [
      { key: "calendar_events" as const, count: events.length },
      { key: "tasks" as const, count: tasks.length },
      { key: "notes" as const, count: notes.length }
    ].filter((c) => c.count > 0);

    if (counts.length > 1) primary = "mixed";
    else if (counts.length === 1) primary = counts[0].key;

    return {
      calendar_events: events,
      tasks,
      notes,
      rawText,
      summary: `Extracted ${events.length} event(s), ${tasks.length} task(s), and ${notes.length} note(s).`,
      primaryCategory: primary
    };
  }

  // --- Static Convenience Methods ---

  /**
   * Static helper to route raw text using default router settings.
   */
  public static async route(rawText: string, options: RouterOptions = {}): Promise<CategorizedIntelligence> {
    const router = new IntelligenceRouter(options);
    return router.route(rawText, options);
  }

  /**
   * Static helper to extract only calendar events from raw text.
   */
  public static async extractEvents(rawText: string, options: RouterOptions = {}): Promise<CalendarEvent[]> {
    const result = await IntelligenceRouter.route(rawText, options);
    return result.calendar_events;
  }

  /**
   * Static helper to extract only actionable tasks from raw text.
   */
  public static async extractTasks(rawText: string, options: RouterOptions = {}): Promise<Task[]> {
    const result = await IntelligenceRouter.route(rawText, options);
    return result.tasks;
  }

  /**
   * Static helper to extract only notes from raw text.
   */
  public static async extractNotes(rawText: string, options: RouterOptions = {}): Promise<Note[]> {
    const result = await IntelligenceRouter.route(rawText, options);
    return result.notes;
  }
}

/**
 * Functional export for quick categorization of raw text strings.
 */
export async function routeIntelligence(
  rawText: string,
  options?: RouterOptions
): Promise<CategorizedIntelligence> {
  return IntelligenceRouter.route(rawText, options);
}

/**
 * Alias export for semantic categorization.
 */
export async function categorizeRawText(
  rawText: string,
  options?: RouterOptions
): Promise<CategorizedIntelligence> {
  return IntelligenceRouter.route(rawText, options);
}

export default IntelligenceRouter;
