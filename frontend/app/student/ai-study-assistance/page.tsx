"use client";

import { type ChangeEvent, type ComponentType, useMemo, useRef, useState } from "react";

import {
  ArrowRight,
  FileText,
  Globe,
  Loader2,
  Menu,
  MessageSquare,
  Mic,
  MoreVertical,
  MoveRight,
  PanelLeft,
  PanelsTopLeft,
  Plus,
  Send,
  Sparkles,
  Upload,
  Video,
  Workflow,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { toast } from "@/lib/toast";
import { useAppStore } from "@/lib/store";
import {
  askStudyAssistant,
  createMessage,
  createSource,
  searchWebSources,
  STUDIO_SLUGS,
  summarizeStudySources,
  type StudyAssistantResponse,
  type StudyChatMessage,
  type StudySource,
} from "@/lib/study-assistant";

const promptSuggestions = [
  "Start a project",
  "Learn or understand something",
  "Create a study plan",
  "Summarize my notes",
];

const studioItems = [
  { title: "Audio Overview", description: "Quick podcast style summary", accent: "from-indigo-500/30 to-emerald-500/30", icon: Mic },
  { title: "Slide Deck", description: "Turn key points into slides", accent: "from-amber-500/30 to-orange-500/20", icon: PanelsTopLeft, beta: true },
  { title: "Video Overview", description: "Create a short visual recap", accent: "from-emerald-500/25 to-cyan-500/20", icon: Video },
  { title: "Mind Map", description: "Connect ideas and concepts", accent: "from-fuchsia-500/20 to-pink-500/20", icon: Workflow },
  { title: "Reports", description: "Generate a polished brief", accent: "from-yellow-500/20 to-amber-500/20", icon: FileText },
  { title: "Flashcards", description: "Build quick revision cards", accent: "from-rose-500/20 to-orange-500/20", icon: Sparkles },
  { title: "Quiz", description: "Check your understanding", accent: "from-sky-500/20 to-blue-500/20", icon: MessageSquare },
  { title: "Infographic", description: "Turn ideas into visuals", accent: "from-purple-500/20 to-violet-500/20", icon: PanelsTopLeft, beta: true },
  { title: "Data Table", description: "Organize facts at a glance", accent: "from-slate-500/20 to-zinc-500/20", icon: FileText },
];

function SectionTitle({ label, icon: Icon }: { label: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StudioOutputPanel({
  output,
  loading,
  activeLabel,
}: {
  output: StudyAssistantResponse | null;
  loading: boolean;
  activeLabel?: string | null;
}) {
  if (loading) {
    return (
      <div className="rounded-[1.25rem] border border-white/10 bg-background/30 p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="font-medium text-foreground">Generating {activeLabel ?? "studio asset"}…</p>
            <p className="text-xs">Results appear here without filling your chat thread.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-background/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/60 text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">Studio outputs appear here</p>
            <p className="truncate text-xs text-muted-foreground">Add notes, generate assets, or explore another format.</p>
          </div>
        </div>
      </div>
    );
  }

  const { studioPreview, quiz, flashcards, mindMap, slides, report, infographic, dataTable, audioScript, videoOutline } = output;

  return (
    <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-background/30 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{studioPreview.title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {studioPreview.details.map((detail) => (
            <span key={detail} className="rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              {detail}
            </span>
          ))}
        </div>
      </div>

      {output.keyPoints.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Key points</p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {output.keyPoints.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {quiz.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Quiz</p>
          {quiz.slice(0, 3).map((item) => (
            <div key={item.question} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
              <p className="font-medium text-foreground">{item.question}</p>
              <p className="mt-1 text-xs text-muted-foreground">Answer: {item.answer}</p>
            </div>
          ))}
        </div>
      ) : null}

      {flashcards.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {flashcards.slice(0, 4).map((card) => (
            <div key={card.front} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
              <p className="font-medium text-foreground">{card.front}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.back}</p>
            </div>
          ))}
        </div>
      ) : null}

      {mindMap?.branches?.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mind map</p>
          <p className="mt-1 text-sm font-medium text-foreground">{mindMap.central}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {mindMap.branches.map((branch) => (
              <div key={branch.label} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
                <p className="font-medium">{branch.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{branch.children.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {slides.length > 0 ? (
        <div className="space-y-2">
          {slides.slice(0, 3).map((slide) => (
            <div key={slide.title} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
              <p className="font-medium text-foreground">{slide.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{slide.bullets.join(" · ")}</p>
            </div>
          ))}
        </div>
      ) : null}

      {report?.sections?.length ? (
        <div className="space-y-2">
          {report.sections.slice(0, 2).map((section) => (
            <div key={section.heading} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
              <p className="font-medium text-foreground">{section.heading}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.content}</p>
            </div>
          ))}
        </div>
      ) : null}

      {infographic?.highlights?.length ? (
        <div className="grid grid-cols-2 gap-2">
          {infographic.highlights.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {dataTable?.rows?.length ? (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-background/60">
              <tr>
                {dataTable.headers.map((header) => (
                  <th key={header} className="px-3 py-2 font-semibold text-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataTable.rows.slice(0, 4).map((row) => (
                <tr key={row.join("-")} className="border-t border-white/5">
                  {row.map((cell) => (
                    <td key={cell} className="px-3 py-2 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {audioScript?.length ? (
        <div className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Audio script</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {audioScript.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ) : null}

      {videoOutline?.length ? (
        <div className="space-y-2">
          {videoOutline.map((scene) => (
            <div key={scene.scene} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm">
              <p className="font-medium text-foreground">{scene.scene}</p>
              <p className="mt-1 text-xs text-muted-foreground">{scene.notes}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AiStudyAssistancePage() {
  const { currentUser, students } = useAppStore();
  const studentProfile = students.find((student) => student.id === currentUser?.id) ?? students[0];

  const [messages, setMessages] = useState<StudyChatMessage[]>([]);
  const [sources, setSources] = useState<StudySource[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<string>("chat");
  const [studioOutput, setStudioOutput] = useState<StudyAssistantResponse | null>(null);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [webSearchQuery, setWebSearchQuery] = useState("");
  const [webSearching, setWebSearching] = useState(false);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [studioGenerating, setStudioGenerating] = useState(false);
  const [activeStudioLabel, setActiveStudioLabel] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const studentName = studentProfile?.name ?? "Student";
  const course = studentProfile?.course ?? "Your course";
  const batch = studentProfile?.batch ?? "";

  const hasStarted = messages.length > 0;

  const providerLabel = useMemo(() => {
    if (!studioOutput?.providers) return null;
    if (studioOutput.demo) return "Demo mode";
    const parts = [];
    if (studioOutput.providers.grok) parts.push("Grok chat");
    if (studioOutput.providers.gemini) parts.push("Gemini studio");
    return parts.join(" · ");
  }, [studioOutput]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const submitMessage = async (message: string, studio = selectedStudio) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setMessages((prev) => [...prev, createMessage("user", trimmed)]);

    try {
      const response = await askStudyAssistant({
        message: trimmed,
        studentName,
        course,
        batch,
        studio,
        sources,
      });

      setStudioOutput(response);
      setMessages((prev) => [...prev, createMessage("assistant", response.reply)]);
      scrollToBottom();

      if (response.demo) {
        toast.info("Running in demo mode. Add XAI_API_KEY and GEMINI_API_KEY to the backend for live AI.");
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to reach the study assistant.";
      toast.error(text);
      setMessages((prev) => [...prev, createMessage("assistant", text)]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleAddSource = async () => {
    const title = sourceTitle.trim();
    const content = sourceContent.trim();
    if (!title || !content) {
      toast.error("Add both a title and content for the source.");
      return;
    }

    await persistSources([...sources, createSource(title, content)]);
    setSourceTitle("");
    setSourceContent("");
    setShowSourceForm(false);
  };

  const persistSources = async (nextSources: StudySource[], notify = true) => {
    setSources(nextSources);

    try {
      const summarized = await summarizeStudySources(nextSources);
      setSources(summarized);
      if (notify) toast.success("Source added");
    } catch {
      if (notify) toast.success("Source added");
    }
  };

  const readUploadedFile = (file: File) =>
    new Promise<{ title: string; content: string; type: StudySource["type"] }>((resolve, reject) => {
      const title = file.name.replace(/\.[^.]+$/, "") || file.name;
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

      if (file.type.startsWith("audio/")) {
        resolve({
          title,
          content: `Audio file uploaded: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB). Use this as a spoken revision reference.`,
          type: "audio",
        });
        return;
      }

      if (file.type.startsWith("video/")) {
        resolve({
          title,
          content: `Video file uploaded: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB). Use this as a visual revision reference.`,
          type: "video",
        });
        return;
      }

      if (extension === "pdf" || file.type === "application/pdf") {
        resolve({
          title,
          content: `PDF uploaded: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB). Treat this document as study material for summarization and quiz generation.`,
          type: "pdf",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const content = String(reader.result ?? "").trim();
        resolve({
          title,
          content: content || `Uploaded file: ${file.name}`,
          type: "text",
        });
      };
      reader.onerror = () => reject(new Error("Unable to read the selected file."));
      reader.readAsText(file);
    });

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingSource(true);
    try {
      const uploaded = await readUploadedFile(file);
      await persistSources([...sources, createSource(uploaded.title, uploaded.content, uploaded.type)]);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to upload the selected file.";
      toast.error(text);
    } finally {
      setUploadingSource(false);
    }
  };

  const handleWebSearch = async (mode: "web" | "smart") => {
    const query = webSearchQuery.trim() || course;
    if (!query) {
      toast.error("Enter a topic to search the web.");
      return;
    }

    setWebSearching(true);
    try {
      const found = await searchWebSources({
        query,
        course,
        mode,
        limit: mode === "smart" ? 5 : 3,
      });

      if (found.length === 0) {
        toast.info("No web sources found. Try a broader search term.");
        return;
      }

      await persistSources([...sources, ...found], false);
      setWebSearchQuery("");
      toast.success(`${found.length} web source${found.length === 1 ? "" : "s"} added`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Web search failed.";
      toast.error(text);
    } finally {
      setWebSearching(false);
    }
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id));
  };

  const generateStudioAsset = async (title: string) => {
    const slug = STUDIO_SLUGS[title] ?? "chat";
    const topicHint = sources[0]?.title || input.trim() || course;

    setSelectedStudio(slug);
    setActiveStudioLabel(title);
    setStudioGenerating(true);

    try {
      const response = await askStudyAssistant({
        message: `Create a ${title.toLowerCase()} about ${topicHint} using my uploaded sources.`,
        studentName,
        course,
        batch,
        studio: slug,
        sources,
      });

      setStudioOutput(response);

      if (response.demo) {
        toast.info("Running in demo mode. Add XAI_API_KEY and GEMINI_API_KEY to the backend for live AI.");
      } else {
        toast.success(`${title} ready in Studio`);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to generate this studio asset.";
      toast.error(text);
    } finally {
      setStudioGenerating(false);
      setActiveStudioLabel(null);
    }
  };

  const handleStudioClick = (title: string) => {
    const slug = STUDIO_SLUGS[title] ?? "chat";
    setSelectedStudio(slug);
    void generateStudioAsset(title);
  };

  return (
    <div className="min-w-0 space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.csv,.json,.pdf,audio/*,video/*"
        className="hidden"
        onChange={(event) => void handleFileUpload(event)}
      />

      <ResizablePanelGroup direction="horizontal" className="min-h-[720px] gap-3 rounded-[1.75rem]">
        <ResizablePanel defaultSize={22} minSize={18} maxSize={34}>
        <Card className="flex h-full min-h-[720px] overflow-hidden rounded-[1.75rem] border-white/10 bg-card/90 py-0 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex min-h-0 flex-1 flex-col">
            <SectionTitle label="Sources" icon={PanelLeft} />

            <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 justify-center rounded-full border-white/10 bg-background/40 text-sm font-semibold shadow-none hover:bg-accent/60"
                  onClick={() => setShowSourceForm((value) => !value)}
                >
                  <Plus className="h-4 w-4" />
                  Paste note
                </Button>
                <Button
                  variant="outline"
                  className="h-11 justify-center rounded-full border-white/10 bg-background/40 text-sm font-semibold shadow-none hover:bg-accent/60"
                  disabled={uploadingSource}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingSource ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload file
                </Button>
              </div>

              {showSourceForm ? (
                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-background/40 p-3">
                  <input
                    value={sourceTitle}
                    onChange={(event) => setSourceTitle(event.target.value)}
                    placeholder="Source title"
                    className="w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={sourceContent}
                    onChange={(event) => setSourceContent(event.target.value)}
                    placeholder="Paste notes, article text, or lecture summary"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm outline-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-full" onClick={() => void handleAddSource()}>
                      Save source
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setShowSourceForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-white/10 bg-background/40 p-3">
                <p className="text-sm text-muted-foreground">Search the web for new sources</p>
                <Input
                  value={webSearchQuery}
                  onChange={(event) => setWebSearchQuery(event.target.value)}
                  placeholder={`Search ${course}`}
                  className="mt-3 rounded-full border-white/10 bg-background/60"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleWebSearch("web");
                    }
                  }}
                />
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/10 bg-background/60 px-3"
                    disabled={webSearching}
                    onClick={() => void handleWebSearch("web")}
                  >
                    {webSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                    <span className="text-xs">Web</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/10 bg-background/60 px-3"
                    disabled={webSearching}
                    onClick={() => void handleWebSearch("smart")}
                  >
                    {webSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span className="text-xs">Smart</span>
                  </Button>
                </div>
              </div>

              {sources.length > 0 ? (
                <div className="space-y-2 overflow-y-auto">
                  {sources.map((source) => (
                    <div key={source.id} className="rounded-[1.25rem] border border-white/10 bg-background/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{source.title}</p>
                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
                            {source.summary || source.content}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={() => removeSource(source.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-background/20 px-4 py-10 text-center">
                  <div className="max-w-[220px] space-y-3">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-background/50 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Saved sources will appear here</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Click Add source above to add PDFs, websites, text, videos, or audio files.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-transparent" />

        <ResizablePanel defaultSize={46} minSize={34}>
        <Card className="flex h-full min-h-[720px] overflow-hidden rounded-[1.75rem] border-white/10 bg-card/90 py-0 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
              <div>
                <span className="text-sm font-semibold text-foreground">Chat</span>
                {providerLabel ? <p className="text-[11px] text-muted-foreground">{providerLabel}</p> : null}
              </div>
              <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                {!hasStarted ? (
                  <>
                    <div className="space-y-4 pt-8">
                      <div className="text-4xl">👋</div>
                      <div className="max-w-2xl space-y-4">
                        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                          Let&apos;s start your notebook...
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                          Ask questions, upload notes, and generate quizzes, flashcards, slides, and more with Grok and Gemini.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">What would you like this notebook to help you do?</p>
                      <div className="flex flex-col gap-3 sm:max-w-md">
                        {promptSuggestions.map((label) => (
                          <Button
                            key={label}
                            variant="outline"
                            className="h-11 justify-start rounded-full border-white/10 bg-background/40 px-5 text-sm font-medium shadow-none hover:bg-accent/60"
                            onClick={() => void submitMessage(label)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[92%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "mr-auto border border-white/10 bg-background/50 text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                    {loading ? (
                      <div className="mr-auto flex items-center gap-2 rounded-[1.25rem] border border-white/10 bg-background/50 px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    ) : null}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {studioOutput?.followUps?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {studioOutput.followUps.map((followUp) => (
                      <Button
                        key={followUp}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/10 bg-background/40"
                        onClick={() => void submitMessage(followUp)}
                      >
                        {followUp}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-background/40 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
                <div className="flex items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="sr-only" htmlFor="study-prompt">
                      Ask a question or create something
                    </label>
                    <textarea
                      id="study-prompt"
                      rows={2}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void submitMessage(input);
                        }
                      }}
                      placeholder="Ask a question or create something"
                      className="min-h-[56px] w-full resize-none rounded-2xl border border-transparent bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-transparent focus:ring-0"
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-1">
                    <span className="whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
                      {sources.length} source{sources.length === 1 ? "" : "s"}
                    </span>
                    <Button size="icon-sm" className="rounded-full" disabled={loading || !input.trim()} onClick={() => void submitMessage(input)}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                AI responses can be inaccurate; please double-check important facts.
              </p>
            </div>
          </div>
        </Card>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-transparent" />

        <ResizablePanel defaultSize={32} minSize={24} maxSize={42}>
        <Card className="flex h-full min-h-[720px] overflow-hidden rounded-[1.75rem] border-white/10 bg-card/90 py-0 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex min-h-0 flex-1 flex-col">
            <SectionTitle label="Studio" icon={Menu} />

            <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-indigo-500/25 via-slate-500/15 to-emerald-500/20 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Create an Audio Overview in:
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    हिंदी, বাংলা, ગુજરાતી, ಕನ್ನಡ, മലയാളം, मराठी, नेपाली, தமிழ், తెలుగు
                  </span>
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {studioItems.map((item) => {
                  const Icon = item.icon;
                  const slug = STUDIO_SLUGS[item.title] ?? "chat";
                  const active = selectedStudio === slug;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      disabled={loading || studioGenerating}
                      onClick={() => handleStudioClick(item.title)}
                      className={`group relative overflow-hidden rounded-[1.25rem] border p-3 text-left transition-transform hover:-translate-y-0.5 ${
                        active ? "border-primary/40 ring-1 ring-primary/30" : "border-white/10"
                      } bg-gradient-to-br ${item.accent}`}
                    >
                      {(studioGenerating && activeStudioLabel === item.title) ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-sm">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </span>
                      ) : null}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/40 text-foreground">
                              <Icon className="h-4 w-4" />
                            </span>
                            {item.beta ? (
                              <span className="rounded-md bg-black px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                                Beta
                              </span>
                            ) : null}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/40 text-muted-foreground transition-colors group-hover:text-foreground">
                          <MoveRight className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto border-t border-white/5 pt-4">
                <StudioOutputPanel output={studioOutput} loading={studioGenerating} activeLabel={activeStudioLabel} />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button className="rounded-full px-5" onClick={() => fileInputRef.current?.click()} disabled={uploadingSource}>
                    {uploadingSource ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-background/40 px-5"
                    disabled={loading || studioGenerating}
                    onClick={() => void generateStudioAsset(studioItems.find((item) => STUDIO_SLUGS[item.title] === selectedStudio)?.title ?? "Reports")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
