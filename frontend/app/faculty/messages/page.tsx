"use client";

import { useMemo, useState } from "react";
import { useAppStore, type MessageAudience, type MessagePriority, type MessageScope } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Send, MessageSquare, Users, UserRound, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { toast } from "@/lib/toast";

const audienceOptions: MessageAudience[] = ["Students", "Parents"];
const scopeOptions: Array<{ value: MessageScope; label: string; helper: string }> = [
  { value: "All", label: "All recipients", helper: "Send to every selected audience member" },
  { value: "Batch", label: "Specific batch", helper: "Target one class or cohort" },
  { value: "Student", label: "Specific student", helper: "Target one student and their parent" },
];
const priorityOptions: MessagePriority[] = ["Normal", "Important", "Urgent"];

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function FacultyMessages() {
  const { currentUser, students, batches, messages, sendMessage } = useAppStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<MessageAudience[]>(["Students", "Parents"]);
  const [scope, setScope] = useState<MessageScope>("All");
  const [targetBatch, setTargetBatch] = useState(batches[0]?.id ?? "");
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id ?? "");
  const [priority, setPriority] = useState<MessagePriority>("Important");

  const sentMessages = useMemo(
    () => messages.filter((message) => message.senderRole === "FACULTY").slice(0, 6),
    [messages],
  );

  const recipientSummary = useMemo(() => {
    const summary = new Set<string>();
    if (audience.includes("Students")) summary.add("Students");
    if (audience.includes("Parents")) summary.add("Parents");
    if (scope === "All") return `${Array.from(summary).join(" and ")} across all groups`;
    if (scope === "Batch") return `${Array.from(summary).join(" and ")} in ${batches.find((batch) => batch.id === targetBatch)?.name ?? "selected batch"}`;
    const student = students.find((item) => item.id === targetStudentId);
    return `${Array.from(summary).join(" and ")} for ${student?.name ?? "the selected student"}`;
  }, [audience, batches, scope, students, targetBatch, targetStudentId]);

  const toggleAudience = (value: MessageAudience) => {
    setAudience((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const handleSend = () => {
    if (!currentUser || !title.trim() || !content.trim() || audience.length === 0) return;

    if (scope === "Batch" && !targetBatch) return;
    if (scope === "Student" && !targetStudentId) return;

    const student = students.find((item) => item.id === targetStudentId);

    sendMessage({
      title: title.trim(),
      content: content.trim(),
      sender: currentUser.name,
      senderRole: currentUser.role,
      audience,
      scope,
      targetBatch: scope === "Batch" ? targetBatch : undefined,
      targetStudentId: scope === "Student" ? targetStudentId : undefined,
      targetStudentName: scope === "Student" ? student?.name : undefined,
      priority,
    });

    setTitle("");
    setContent("");
    setAudience(["Students", "Parents"]);
    setScope("All");
    setTargetBatch(batches[0]?.id ?? "");
    setTargetStudentId(students[0]?.id ?? "");
    setPriority("Important");
    toast.success("Message sent to selected recipients");
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader hideTitle title="Faculty messages"
        description="Send announcements to students, parents, or both, and review what you have sent."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Messages", value: messages.length },
          { label: "Students", value: students.length },
          { label: "Parents", value: students.filter((student) => student.parentName).length },
          { label: "Batches", value: batches.length },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-card/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Compose message
            </CardTitle>
            <CardDescription>Send a direct update to the selected audience and recipient scope.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Audience</p>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={audience.includes(item) ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleAudience(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Recipient scope</p>
                <Select value={scope} onValueChange={(value) => setScope(value as MessageScope)}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-[11px] text-muted-foreground">{option.helper}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Priority</p>
                <Select value={priority} onValueChange={(value) => setPriority(value as MessagePriority)}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {scope === "Batch" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Batch</p>
                <Select value={targetBatch} onValueChange={setTargetBatch}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Choose batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} ({batch.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {scope === "Student" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Student</p>
                <Select value={targetStudentId} onValueChange={setTargetStudentId}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.parentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Title</p>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Type a short subject" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Message</p>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the note you want students or parents to receive..."
                className="min-h-36 rounded-xl"
              />
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Delivery preview
              </p>
              <p className="mt-2 text-muted-foreground">{recipientSummary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                The message will appear in both the role inboxes and the shared notifications feed.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSend} className="flex-1 rounded-xl gap-2">
                <Send className="h-4 w-4" />
                Send message
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTitle("");
                  setContent("");
                  setAudience(["Students", "Parents"]);
                  setScope("All");
                  setTargetBatch(batches[0]?.id ?? "");
                  setTargetStudentId(students[0]?.id ?? "");
                  setPriority("Important");
                }}
                className="rounded-xl"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Sent inbox
            </CardTitle>
            <CardDescription>Recently delivered faculty messages and their target audience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentMessages.length > 0 ? (
              sentMessages.map((message) => (
                <div key={message.id} className="rounded-[1.35rem] border bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{message.title}</p>
                        <Badge variant="outline">{message.priority}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        From {message.sender} on {formatMessageTime(message.sentAt)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      <BellRing className="mr-1 h-3.5 w-3.5" />
                      {message.scope}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message.content}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.audience.map((item) => (
                      <Badge key={item} variant="outline" className="rounded-full">
                        {item === "Students" ? <Users className="mr-1 h-3.5 w-3.5" /> : <UserRound className="mr-1 h-3.5 w-3.5" />}
                        {item}
                      </Badge>
                    ))}
                    {message.targetBatch ? <Badge variant="secondary">Batch: {message.targetBatch}</Badge> : null}
                    {message.targetStudentName ? <Badge variant="secondary">Student: {message.targetStudentName}</Badge> : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No messages have been sent yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
