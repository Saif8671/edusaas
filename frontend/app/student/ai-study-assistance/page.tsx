"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bot,
  BookOpen,
  FileAudio2,
  FileText,
  LayoutGrid,
  ListChecks,
  Map,
  MoreVertical,
  PanelLeft,
  PanelRight,
  PlayCircle,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Video,
  Presentation,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";

type SourceItem = {
  id: string;
  title: string;
  summary: string;
  type: string;
  selected: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  sources?: string[];
};

type AssistantResponse = {
  reply?: string;
  keyPoints?: string[];
  studySteps?: string[];
  followUps?: string[];
  quiz?: Array<{ question: string; answer: string }>;
  studioPreview?: { title: string; details: string[] };
  sourcesUsed?: Array<{ title: string }>;
  modeLabel?: string;
};

type StudioOption = {
  id: string;
  label: string;
  icon: typeof FileText;
  description: string;
  beta?: boolean;
  accent: string;
};

const studioOptions: StudioOption[] = [
  { id: "audio-overview", label: "Audio Overview", icon: FileAudio2, description: "Create a spoken revision recap.", accent: "from-emerald-500/20 to-emerald-500/5" },
  { id: "slide-deck", label: "Slide Deck", icon: Presentation, description: "Turn the lesson into presentation slides.", beta: true, accent: "from-amber-500/20 to-amber-500/5" },
  { id: "video-overview", label: "Video Overview", icon: Video, description: "Outline a short lesson video.", accent: "from-cyan-500/20 to-cyan-500/5" },
  { id: "mind-map", label: "Mind Map", icon: Map, description: "Show connected concepts visually.", accent: "from-fuchsia-500/20 to-fuchsia-500/5" },
  { id: "reports", label: "Reports", icon: FileText, description: "Summarize the topic in report form.", accent: "from-slate-500/20 to-slate-500/5" },
  { id: "flashcards", label: "Flashcards", icon: BookOpen, description: "Build short revision cards.", accent: "from-orange-500/20 to-orange-500/5" },
  { id: "quiz", label: "Quiz", icon: ListChecks, description: "Test understanding with quick checks.", accent: "from-rose-500/20 to-rose-500/5" },
  { id: "infographic", label: "Infographic", icon: Sparkles, description: "Compress the topic into a visual cheat sheet.", beta: true, accent: "from-violet-500/20 to-violet-500/5" },
  { id: "data-table", label: "Data Table", icon: Table2, description: "Compare concepts in a structured table.", accent: "from-sky-500/20 to-sky-500/5" },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildInitialSources(studentName: string, course: string, batch: string): SourceItem[] {
  return [
    {
      id: "source-syllabus",
      title: `${course} syllabus`,
      summary: `Learning outcomes, weekly plan, and assessment goals for ${batch}.`,
      type: "Course",
      selected: true,
    },
    {
      id: "source-lecture",
      title: `${course} lecture notes`,
      summary: `Key definitions, formulas, and examples covered in today's class.`,
      type: "Notes",
      selected: true,
    },
    {
      id: "source-assignment",
      title: `${studentName}'s recent assignment`,
      summary: "Helpful for spotting weak areas and turning mistakes into revision prompts.",
      type: "Practice",
      selected: false,
    },
    {
      id: "source-recap",
      title: "Recorded class recap",
      summary: "A short recording used to revisit important explanations and examples.",
      type: "Media",
      selected: false,
    },
  ];
}

function studioPrompt(optionId: string) {
  switch (optionId) {
    case "audio-overview":
      return "Create a short audio overview from my selected sources.";
    case "slide-deck":
      return "Turn this topic into a clean slide deck for revision.";
    case "video-overview":
      return "Outline a concise video overview for this lesson.";
    case "mind-map":
      return "Build a mind map of the concept and its branches.";
    case "reports":
      return "Summarize this into a structured study report.";
    case "flashcards":
      return "Create flashcards from the selected sources.";
    case "quiz":
      return "Quiz me on this topic using the selected sources.";
    case "infographic":
      return "Design an infographic-style summary of this topic.";
    case "data-table":
      return "Organize this topic into a data table.";
    default:
      return "Help me study this topic.";
  }
}

export default function StudentAiStudyAssistancePage() {
  const { currentUser, students } = useAppStore();
  const profile = useMemo(
    () => students.find((student) => student.id === currentUser?.id) ?? students[0],
    [currentUser?.id, students],
  );

  const initialSources = useMemo(
    () => buildInitialSources(profile?.name ?? "Student", profile?.course ?? "your course", profile?.batch ?? "your batch"),
    [profile?.batch, profile?.course, profile?.name],
  );

  const [sources, setSources] = useState<SourceItem[]>(initialSources);
  const [sourceSearch, setSourceSearch] = useState("");
  const [newSource, setNewSource] = useState("");
  const [selectedStudio, setSelectedStudio] = useState("audio-overview");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Ask me anything about your course, then I'll explain it, quiz you, or turn it into study assets.",
      time: "Just now",
    },
  ]);
  const [lastResponse, setLastResponse] = useState<AssistantResponse | null>(null);
  const [status, setStatus] = useState("Ready to help");
  const [sending, setSending] = useState(false);
  const newSourceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSources(initialSources);
  }, [initialSources]);

  const filteredSources = useMemo(
    () =>
      sources.filter((source) =>
        `${source.title} ${source.summary} ${source.type}`.toLowerCase().includes(sourceSearch.toLowerCase()),
      ),
    [sourceSearch, sources],
  );

  const selectedSources = useMemo(() => sources.filter((source) => source.selected), [sources]);
  const selectedStudioOption = studioOptions.find((option) => option.id === selectedStudio) ?? studioOptions[0];

  const addSource = () => {
    const value = newSource.trim();
    if (!value) return;

    setSources((current) => [
      {
        id: `custom-${Date.now()}`,
        title: value,
        summary: "Added from your study workspace so the assistant can reference it.",
        type: "Custom",
        selected: true,
      },
      ...current,
    ]);
    setNewSource("");
    setStatus("Source added");
  };

  const toggleSource = (id: string) => {
    setSources((current) => current.map((source) => (source.id === id ? { ...source, selected: !source.selected } : source)));
  };

  const selectAllSources = () => {
    setSources((current) => current.map((source) => ({ ...source, selected: true })));
  };

  const clearSelection = () => {
    setSources((current) => current.map((source) => ({ ...source, selected: false })));
  };

  const handleSend = async (overrideMessage?: string) => {
    const prompt = (overrideMessage ?? message).trim();
    if (!prompt || sending) return;

    if (selectedSources.length === 0) {
      toast.error("Select at least one source for the assistant to use.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      time: formatTime(new Date().toISOString()),
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setSending(true);
    setStatus("Thinking...");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/study-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          studentName: profile?.name,
          course: profile?.course,
          batch: profile?.batch,
          studio: selectedStudio,
          sources: selectedSources.map((source) => ({
            id: source.id,
            title: source.title,
            summary: source.summary,
            type: source.type,
          })),
        }),
      });

      const data = (await response.json()) as AssistantResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "The study assistant could not respond.");
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I prepared a study response, but there was no message text to display.",
        time: "Just now",
        sources: data.sourcesUsed?.map((source) => source.title),
      };

      setMessages((current) => [...current, assistantMessage]);
      setLastResponse(data);
      setStatus(data.modeLabel ? `${data.modeLabel} generated` : "Response ready");
      toast.success("Study response ready");
    } catch (error) {
      const fallbackReply = `I couldn't reach the backend assistant, so here's a quick start: focus on ${profile?.course ?? "the lesson"}, review one source, and try a one-minute self-test.`;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: fallbackReply,
          time: "Just now",
          sources: selectedSources.map((source) => source.title),
        },
      ]);
      setLastResponse({
        reply: fallbackReply,
        followUps: ["Try again", "Switch studio mode", "Add more sources"],
        keyPoints: ["Use the selected sources", "Revise in short bursts", "Test your recall immediately"],
        studySteps: ["Read one source", "Summarize it aloud", "Ask the assistant to quiz you"],
        studioPreview: {
          title: "Fallback study note",
          details: ["Quick revision", "Offline-safe", "Source-driven"],
        },
      });
      setStatus(error instanceof Error ? error.message : "Assistant fallback used");
      toast.error("Using offline fallback — start the backend for live AI.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-shell min-w-0">
      <PageHeader
        hideTitle
        title="AI Study Assistant"
        description="Chat with AI using your course sources and generate quizzes, flashcards, and summaries."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => handleSend(studioPrompt(selectedStudio))} disabled={sending}>
              {sending ? "Generating…" : "Generate"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setMessage(studioPrompt("quiz"));
                setSelectedStudio("quiz");
              }}
            >
              Quick quiz
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 rounded-xl border bg-muted/40 p-3 text-sm">
        <Badge variant="secondary" className="rounded-full">
          {profile?.course ?? "Your course"}
        </Badge>
        <span className="text-muted-foreground">
          {selectedSources.length} source{selectedSources.length === 1 ? "" : "s"} · {selectedStudioOption.label}
        </span>
        <span className="text-muted-foreground">{status}</span>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <Card className="glass-card min-w-0 overflow-hidden border lg:col-span-3 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
          <CardHeader className="space-y-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Sources</CardTitle>
                <CardDescription>Pick the notes, files, and lessons the AI should use.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" aria-label="Sources panel" disabled title="Panel layout is fixed in this view">
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-center rounded-2xl border-dashed"
                onClick={() => newSourceInputRef.current?.focus()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add sources
              </Button>
              <div className="rounded-[1.5rem] border bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Add a note or topic as a source</p>
                <div className="mt-3 flex gap-2">
                  <Input
                    ref={newSourceInputRef}
                    value={newSource}
                    onChange={(event) => setNewSource(event.target.value)}
                    placeholder="Paste a topic, note, or URL"
                    className="h-11 rounded-2xl"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSource();
                      }
                    }}
                  />
                  <Button onClick={addSource} className="h-11 rounded-2xl px-4">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <button className="font-medium text-foreground" onClick={selectAllSources}>
                  Select all
                </button>
                <button className="text-muted-foreground transition hover:text-foreground" onClick={clearSelection}>
                  Clear
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-4">
            {filteredSources.map((source) => (
              <button
                type="button"
                key={source.id}
                aria-pressed={source.selected}
                onClick={() => toggleSource(source.id)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all",
                  source.selected
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/60 bg-background/70 hover:border-primary/20 hover:bg-muted/50",
                )}
              >
                <div className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl", source.selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{source.title}</p>
                    <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-[0.14em]">
                      {source.type}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{source.summary}</p>
                </div>
                <div className={cn("mt-1 flex h-5 w-5 items-center justify-center rounded-full border", source.selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}>
                  <span className={cn("h-2.5 w-2.5 rounded-full", source.selected ? "bg-primary-foreground" : "bg-transparent")} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card flex min-w-0 flex-col overflow-hidden border lg:col-span-6 lg:max-h-[calc(100vh-14rem)]">
          <CardHeader className="shrink-0 border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Chat</CardTitle>
                <CardDescription>Ask a question, request a summary, or generate a study asset.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear chat"
                  onClick={() => {
                    setMessages([
                      {
                        id: "welcome",
                        role: "assistant",
                        content: "Ask me anything about your course, then I'll explain it, quiz you, or turn it into study assets.",
                        time: "Just now",
                      },
                    ]);
                    setLastResponse(null);
                    toast.info("Chat cleared");
                  }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
            <div className="shrink-0 flex items-start justify-between gap-4 rounded-2xl border border-dashed bg-background/75 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{profile?.course ?? "Study assistant"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {selectedSources.length} selected source{selectedSources.length === 1 ? "" : "s"}, the assistant can explain the topic and create structured revision content.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => toast.info(`Studio mode: ${selectedStudioOption.label}`)}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Customize
              </Button>
            </div>

            {lastResponse ? (
              <div className="shrink-0 rounded-2xl border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest AI output</p>
                    <h3 className="mt-1 text-xl font-semibold">{lastResponse.studioPreview?.title ?? "Study response"}</h3>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {lastResponse.modeLabel ?? selectedStudioOption.label}
                  </Badge>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">{lastResponse.reply}</p>

                {lastResponse.keyPoints?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lastResponse.keyPoints.map((point) => (
                      <Badge key={point} variant="outline" className="rounded-full">
                        {point}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {lastResponse.studySteps?.length ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {lastResponse.studySteps.map((step, index) => (
                      <div key={step} className="rounded-2xl border bg-background/80 p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Step {index + 1}</p>
                        <p className="mt-2 text-sm font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "max-w-[92%] rounded-[1.5rem] border px-4 py-3",
                    chat.role === "user"
                      ? "ml-auto border-primary/20 bg-primary text-primary-foreground"
                      : "border-border/70 bg-background/85",
                  )}
                >
                  <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] opacity-70">
                    <span>{chat.role === "user" ? "You" : "AI assistant"}</span>
                    <span>{chat.time}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{chat.content}</p>
                  {chat.sources?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chat.sources.map((source) => (
                        <Badge key={source} variant="secondary" className="rounded-full">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="shrink-0 rounded-2xl border bg-background/85 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quick prompts</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Explain this simply", "Quiz me", "Create flashcards", "Summarize the lesson"].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => setMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border bg-background/85 p-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Ask a question or create something
                  </label>
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={3}
                    aria-label="Message for study assistant"
                    placeholder="Ask for an explanation, a quiz, a summary, or a study asset..."
                    className="min-h-24 rounded-[1.25rem] resize-none"
                  />
                </div>
                <Button
                  onClick={() => handleSend()}
                  disabled={sending}
                  className="h-12 rounded-full px-5"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{status}</span>
              <span>{selectedSources.length} source{selectedSources.length === 1 ? "" : "s"} selected</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card min-w-0 overflow-hidden border lg:col-span-3 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Studio</CardTitle>
                <CardDescription>Transform the same lesson into different learning formats.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" aria-label="Studio panel" disabled title="Studio panel is always visible">
                <PanelRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {studioOptions.map((option) => {
                const Icon = option.icon;
                const active = option.id === selectedStudio;
                return (
                  <button
                    type="button"
                    key={option.id}
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedStudio(option.id);
                      toast.info(`${option.label} mode selected`);
                    }}
                    className={cn(
                      "group rounded-[1.35rem] border p-3 text-left transition-all",
                      active
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border/70 bg-background/80 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted/40",
                    )}
                  >
                    <div className={cn("rounded-[1.1rem] bg-gradient-to-br p-3", option.accent)}>
                      <div className="flex items-center justify-between gap-2">
                        <Icon className="h-4 w-4" />
                        {option.beta ? <Badge className="rounded-full bg-black text-[10px] text-white hover:bg-black">BETA</Badge> : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-end text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            {lastResponse?.studioPreview ? (
              <div className="rounded-[1.35rem] border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current output preview</p>
                <h3 className="mt-2 text-lg font-semibold">{lastResponse.studioPreview.title}</h3>
                <div className="mt-3 space-y-2">
                  {lastResponse.studioPreview.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[1.35rem] border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assistant context</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSources.map((source) => (
                  <Badge key={source.id} variant="secondary" className="rounded-full">
                    {source.title}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Studio output is generated from the same prompt and source set, so the chat and the learning assets stay aligned.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
