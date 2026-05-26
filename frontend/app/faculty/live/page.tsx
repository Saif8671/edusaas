"use client";

import { useState } from "react";
import { CalendarDays, PencilLine, PlusCircle, Trash2, Video, BellRing } from "lucide-react";
import { useAppStore, LiveSessionData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LiveSessionForm = {
  title: string;
  batch: string;
  platform: string;
  link: string;
  date: string;
  time: string;
  status: LiveSessionData["status"];
  notes: string;
};

const emptySession: LiveSessionForm = {
  title: "",
  batch: "",
  platform: "Google Meet",
  link: "",
  date: "",
  time: "",
  status: "Scheduled" as const,
  notes: "",
};

export default function FacultyLive() {
  const { liveSessions, addLiveSession, updateLiveSession, deleteLiveSession, addNotification } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LiveSessionForm>(emptySession);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptySession);
  };

  const startEdit = (session: LiveSessionData) => {
    setEditingId(session.id);
    setForm({
      title: session.title,
      batch: session.batch,
      platform: session.platform,
      link: session.link,
      date: session.date,
      time: session.time,
      status: session.status,
      notes: session.notes,
    });
  };

  const saveSession = () => {
    if (!form.title.trim() || !form.batch.trim()) return;

    if (editingId) {
      updateLiveSession(editingId, form);
      addNotification("Live class updated", `${form.title} was updated for ${form.batch}`);
    } else {
      addLiveSession(form);
      addNotification("Live class scheduled", `${form.title} was created for ${form.batch}`);
    }
    resetForm();
  };

  const notifyClass = (session: LiveSessionData) => {
    addNotification("Live class notification", `${session.title} has been shared with students for ${session.batch}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Live Session Broadcasts</h2>
        <p className="text-muted-foreground">Create, edit, delete, and notify students about live meeting sessions.</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{editingId ? "Edit live session" : "Create live session"}</CardTitle>
          <CardDescription>Schedule meetings and send the class notice to learners.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["title", "Session title"],
            ["batch", "Batch"],
            ["platform", "Platform"],
            ["link", "Meeting link"],
            ["date", "Date"],
            ["time", "Time"],
            ["notes", "Notes"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
                type={key === "date" ? "date" : "text"}
              />
            </div>
          ))}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Status</p>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as LiveSessionData["status"] }))}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={saveSession} className="rounded-xl gap-2">
              {editingId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {editingId ? "Save changes" : "Create session"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="rounded-xl">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {liveSessions.map((session) => (
          <Card key={session.id} className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader>
              <Video className="mb-2 h-8 w-8 text-primary" />
              <div className="flex items-start justify-between gap-4">
                <div>
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
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Link:</span> {session.link}
              </p>
              <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Notes</p>
                <p className="mt-1">{session.notes}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => notifyClass(session)}>
                  <BellRing className="h-4 w-4" />
                  Notify students
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
