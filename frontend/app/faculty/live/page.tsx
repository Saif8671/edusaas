"use client";

import { useState } from "react";
import {
  CalendarDays,
  BellRing,
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  PencilLine,
  PlusCircle,
  Trash2,
  Video,
} from "lucide-react";
import { useAppStore, LiveSessionData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LiveSessionForm = {
  title: string;
  batch: string;
  platform: "Zoom" | "Google Meet" | "Microsoft Teams" | "Custom";
  link: string;
  date: string;
  time: string;
  durationMinutes: string;
  status: LiveSessionData["status"];
  notes: string;
};

type ZoomMeetingResponse = {
  demo: boolean;
  meeting: {
    id: number;
    join_url: string;
    start_url: string;
    password?: string;
    topic: string;
    start_time: string;
    timezone: string;
  };
};

const emptySession: LiveSessionForm = {
  title: "",
  batch: "",
  platform: "Zoom",
  link: "",
  date: "",
  time: "",
  durationMinutes: "60",
  status: "Scheduled",
  notes: "",
};

async function createZoomMeeting(form: LiveSessionForm) {
  const response = await fetch("/api/zoom/meetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: form.title,
      batch: form.batch,
      date: form.date,
      time: form.time,
      durationMinutes: Number(form.durationMinutes || 60),
      notes: form.notes,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Unable to create the Zoom meeting.");
  }

  return (await response.json()) as ZoomMeetingResponse;
}

function buildSessionPayload(
  form: LiveSessionForm,
  existing?: LiveSessionData,
  zoomMeeting?: ZoomMeetingResponse["meeting"],
): Omit<LiveSessionData, "id"> {
  const provider = form.platform === "Zoom" ? "Zoom" : form.platform;
  const isZoom = provider === "Zoom";

  return {
    title: form.title.trim(),
    batch: form.batch.trim(),
    platform: form.platform,
    link: isZoom ? zoomMeeting?.join_url ?? existing?.link ?? form.link.trim() : form.link.trim(),
    date: form.date,
    time: form.time,
    status: form.status,
    notes: form.notes.trim(),
    provider,
    meetingId: isZoom ? (zoomMeeting ? String(zoomMeeting.id) : existing?.meetingId) : undefined,
    passcode: isZoom ? zoomMeeting?.password ?? existing?.passcode : undefined,
    startUrl: isZoom ? zoomMeeting?.start_url ?? existing?.startUrl : undefined,
  };
}

export default function FacultyLive() {
  const { liveSessions, addLiveSession, updateLiveSession, deleteLiveSession, addNotification } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LiveSessionForm>(emptySession);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const resetForm = (clearMessage = true) => {
    setEditingId(null);
    setForm(emptySession);
    if (clearMessage) {
      setStatusMessage("");
    }
  };

  const startEdit = (session: LiveSessionData) => {
    setEditingId(session.id);
    setForm({
      title: session.title,
      batch: session.batch,
      platform: (session.provider ?? session.platform) as LiveSessionForm["platform"],
      link: session.link,
      date: session.date,
      time: session.time,
      durationMinutes: "60",
      status: session.status,
      notes: session.notes,
    });
    setStatusMessage("");
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setStatusMessage("Join link copied to clipboard.");
    } catch {
      setStatusMessage("Could not copy the link right now.");
    }
  };

  const notifyClass = (session: LiveSessionData) => {
    addNotification(
      "Live class notification",
      `${session.title} is ready for ${session.batch}. Join link: ${session.link}`,
    );
    setStatusMessage(`Shared ${session.title} with students.`);
  };

  const saveSession = async () => {
    if (!form.title.trim() || !form.batch.trim()) {
      setStatusMessage("Please add a session title and batch before saving.");
      return;
    }

    if (form.platform !== "Zoom" && !form.link.trim()) {
      setStatusMessage("Add a meeting link for non-Zoom sessions.");
      return;
    }

    try {
      setSaving(true);
      setStatusMessage("");

      if (editingId) {
        const existing = liveSessions.find((session) => session.id === editingId);
        const payload = buildSessionPayload(form, existing);
        updateLiveSession(editingId, payload);
        addNotification("Live class updated", `${form.title} was updated for ${form.batch}.`);
        resetForm(false);
        setStatusMessage("Session updated successfully.");
      } else if (form.platform === "Zoom") {
        const zoomResponse = await createZoomMeeting(form);
        const payload = buildSessionPayload(form, undefined, zoomResponse.meeting);
        addLiveSession(payload);
        addNotification(
          "Zoom class scheduled",
          `${form.title} is scheduled for ${form.batch}. Students can join from the Live Classes page.`,
        );
        resetForm(false);
        setStatusMessage(
          zoomResponse.demo
            ? "Demo Zoom meeting created. Add your Zoom credentials in .env to generate real meetings."
            : "Zoom meeting created and shared with students.",
        );
      } else {
        addLiveSession(buildSessionPayload(form));
        addNotification("Live class scheduled", `${form.title} was created for ${form.batch}.`);
        resetForm(false);
        setStatusMessage("Session created successfully.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save the live session.";
      setStatusMessage(message);
      addNotification("Live class error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Session Broadcasts</h2>
        <p className="text-muted-foreground">
          Create, edit, delete, and share live meeting sessions with Zoom join links for students.
        </p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{editingId ? "Edit live session" : "Create live session"}</CardTitle>
          <CardDescription>
            Zoom meetings are created server-side and the join link is stored for students automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Session title</p>
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Quantum States Live Revision"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Batch</p>
            <Input
              value={form.batch}
              onChange={(event) => setForm((current) => ({ ...current, batch: event.target.value }))}
              placeholder="QC-2026"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Platform</p>
            <select
              value={form.platform}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  platform: event.target.value as LiveSessionForm["platform"],
                }))
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Zoom">Zoom</option>
              <option value="Google Meet">Google Meet</option>
              <option value="Microsoft Teams">Microsoft Teams</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Meeting link</p>
            <Input
              value={form.link}
              onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
              placeholder={form.platform === "Zoom" ? "Auto-generated after save" : "https://"}
              disabled={form.platform === "Zoom" && !editingId}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Date</p>
            <Input
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              type="date"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Time</p>
            <Input
              value={form.time}
              onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
              type="text"
              placeholder="10:00 AM or 14:00"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Duration</p>
            <Input
              value={form.durationMinutes}
              onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
              type="number"
              min={1}
              max={1440}
              placeholder="60"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Status</p>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as LiveSessionData["status"],
                }))
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-3">
            <p className="text-xs font-semibold text-muted-foreground">Notes</p>
            <Input
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Revision before unit test 2"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={saveSession} className="rounded-xl gap-2" disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : editingId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {saving ? "Saving..." : editingId ? "Save changes" : "Create session"}
            </Button>
            <Button variant="outline" onClick={() => resetForm()} className="rounded-xl">
              Reset
            </Button>
            {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {liveSessions.map((session) => {
          const isZoom = (session.provider ?? session.platform) === "Zoom";

          return (
            <Card key={session.id} className="glass-card border bg-card/40 backdrop-blur-md">
              <CardHeader>
                <Video className="mb-2 h-8 w-8 text-primary" />
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription>{session.platform}</CardDescription>
                  </div>
                  <Badge variant="outline">{session.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Schedule
                  </span>
                  <span className="font-semibold">
                    {session.date} - {session.time}
                  </span>
                </div>

                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Batch:</span> {session.batch}
                </p>

                <p className="break-all text-muted-foreground">
                  <span className="font-semibold text-foreground">Join link:</span> {session.link}
                </p>

                {isZoom && session.passcode ? (
                  <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Zoom access</p>
                    <p className="mt-1">Passcode: {session.passcode}</p>
                  </div>
                ) : null}

                <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Notes</p>
                  <p className="mt-1">{session.notes}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => notifyClass(session)}>
                    <BellRing className="h-4 w-4" />
                    Notify students
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => copyLink(session.link)}>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(session)}>
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => deleteLiveSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {session.startUrl ? (
                  <div className="flex items-center justify-between rounded-xl border bg-background/70 px-4 py-3 text-xs text-muted-foreground">
                    <span>Host start link available for faculty only</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-2 text-xs"
                      onClick={() => copyLink(session.startUrl ?? "")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Copy host link
                    </Button>
                  </div>
                ) : null}

                {session.meetingId ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Zoom meeting ID: {session.meetingId}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
