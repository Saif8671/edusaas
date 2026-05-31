export type StudySource = {
  id: string;
  title: string;
  summary?: string;
  type: "text" | "pdf" | "web" | "video" | "audio";
  content?: string;
};

export type StudyChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type QuizQuestion = {
  question: string;
  answer: string;
  options: string[];
};

export type Flashcard = {
  front: string;
  back: string;
};

export type MindMap = {
  central: string;
  branches: Array<{ label: string; children: string[] }>;
};

export type Slide = {
  title: string;
  bullets: string[];
};

export type StudyReport = {
  title: string;
  sections: Array<{ heading: string; content: string }>;
};

export type Infographic = {
  title: string;
  highlights: Array<{ label: string; value: string }>;
  steps: string[];
  tip: string;
};

export type DataTable = {
  headers: string[];
  rows: string[][];
};

export type StudioPreview = {
  title: string;
  details: string[];
};

export type StudyAssistantResponse = {
  demo?: boolean;
  error?: string;
  reply: string;
  topic: string;
  keyPoints: string[];
  studySteps: string[];
  followUps: string[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  mindMap: MindMap;
  slides: Slide[];
  report: StudyReport;
  infographic: Infographic;
  dataTable: DataTable;
  audioScript?: string[] | null;
  videoOutline?: Array<{ scene: string; notes: string }> | null;
  studioPreview: StudioPreview;
  sourcesUsed: StudySource[];
  modeLabel: string;
  teachingMode: boolean;
  providers?: {
    grok: boolean;
    gemini: boolean;
    chatModel?: string;
    structuredModel?: string;
  };
};

export type StudyAssistantRequest = {
  message: string;
  studentName?: string;
  course?: string;
  batch?: string;
  studio?: string;
  sources?: StudySource[];
  testTopic?: string;
  questionCount?: number;
};

export const STUDIO_SLUGS: Record<string, string> = {
  "Audio Overview": "audio-overview",
  "Slide Deck": "slide-deck",
  "Video Overview": "video-overview",
  "Mind Map": "mind-map",
  Reports: "reports",
  Flashcards: "flashcards",
  Quiz: "quiz",
  Infographic: "infographic",
  "Data Table": "data-table",
};

export async function askStudyAssistant(payload: StudyAssistantRequest): Promise<StudyAssistantResponse> {
  const response = await fetch("/api/study-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as StudyAssistantResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Study assistant is unavailable.");
  }

  return data;
}

export async function summarizeStudySources(sources: StudySource[]): Promise<StudySource[]> {
  const response = await fetch("/api/study-assistant/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources }),
  });

  const data = (await response.json()) as { sources?: StudySource[]; error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Unable to summarize sources.");
  }

  return data.sources ?? sources;
}

export async function searchWebSources(payload: {
  query: string;
  course?: string;
  mode?: "web" | "smart";
  limit?: number;
}): Promise<StudySource[]> {
  const response = await fetch("/api/study-assistant/web-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { sources?: StudySource[]; error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Unable to search the web.");
  }

  return data.sources ?? [];
}

export function createSource(title: string, content: string, type: StudySource["type"] = "text"): StudySource {
  return {
    id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    summary: content.slice(0, 180),
    type,
  };
}

export function createMessage(role: StudyChatMessage["role"], content: string): StudyChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
