"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, MessageSquareMore, PencilLine, Send, Trash2, Users } from "lucide-react";

const audienceOptions = ["Faculty", "Students", "Parents", "Institute"] as const;

export default function AdminAnnouncements() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"General" | "Exam" | "Holiday" | "Placement">("General");
  const [recipients, setRecipients] = useState<Array<(typeof audienceOptions)[number]>>(["Students"]);

  const selectedAnnouncement = useMemo(
    () => announcements.find((announcement) => announcement.id === editingId) ?? null,
    [announcements, editingId],
  );

  const startEdit = (id: string) => {
    const item = announcements.find((announcement) => announcement.id === id);
    if (!item) return;
    setEditingId(id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setRecipients(item.recipients?.length ? item.recipients : ["Students"]);
  };

  const resetComposer = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCategory("General");
    setRecipients(["Students"]);
  };

  const toggleRecipient = (audience: (typeof audienceOptions)[number]) => {
    setRecipients((current) =>
      current.includes(audience) ? current.filter((item) => item !== audience) : [...current, audience],
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      updateAnnouncement(editingId, { title, content, category, recipients });
    } else {
      addAnnouncement(title, content, category, recipients);
    }

    resetComposer();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.6rem] border bg-gradient-to-r from-sky-500/10 via-background to-primary/10 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Institute Messaging</h2>
          <p className="max-w-2xl text-muted-foreground">
            Send WhatsApp-style notices to faculty, students, parents, or the entire institute with targeted audience
            selection.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border bg-background/70 px-4 py-3">
          <MessageSquareMore className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">{announcements.length} total messages</p>
            <p className="text-xs text-muted-foreground">Broadcasts, alerts, and quick updates</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Message board
            </CardTitle>
            <CardDescription>Conversation-style feed of institute announcements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-[1.4rem] border bg-background/80 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{announcement.title}</p>
                      <Badge variant="outline">{announcement.category}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      From {announcement.sender} on {announcement.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(announcement.id)}>
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{announcement.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(announcement.recipients ?? ["Students"]).map((recipient) => (
                    <Badge key={recipient} variant="secondary" className="rounded-full">
                      <Users className="mr-1 h-3.5 w-3.5" />
                      {recipient}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>{editingId ? "Edit message" : "Compose message"}</CardTitle>
            <CardDescription>
              Send to the selected people exactly like a targeted chat broadcast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Target audience</p>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((audience) => (
                  <Button
                    key={audience}
                    type="button"
                    variant={recipients.includes(audience) ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleRecipient(audience)}
                  >
                    {audience}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Category</p>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as typeof category)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="General">General</option>
                <option value="Exam">Exam</option>
                <option value="Holiday">Holiday</option>
                <option value="Placement">Placement</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Title</p>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Message title" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Message</p>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Type the announcement like a message you would send on WhatsApp..."
                className="min-h-32 rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1 rounded-xl gap-2">
                <Send className="h-4 w-4" />
                {editingId ? "Update message" : "Send message"}
              </Button>
              <Button variant="outline" onClick={resetComposer} className="rounded-xl">
                Clear
              </Button>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4 text-sm">
              <p className="font-semibold">Preview</p>
              <p className="mt-2 text-muted-foreground">
                {selectedAnnouncement ? "Editing existing announcement" : "Draft your broadcast before sending it."}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Recipients: {recipients.join(", ") || "Choose at least one audience"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
