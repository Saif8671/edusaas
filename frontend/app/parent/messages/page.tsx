"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, BellRing } from "lucide-react";

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ParentMessages() {
  const { currentUser, students, messages } = useAppStore();

  const child = useMemo(
    () => students.find((student) => student.parentName === currentUser?.name) ?? students[0],
    [currentUser?.name, students],
  );

  const inbox = useMemo(
    () =>
      messages.filter((message) => {
        const scopeMatches =
          message.scope === "All" ||
          (message.scope === "Batch" && message.targetBatch === child?.batch) ||
          (message.scope === "Student" && message.targetStudentId === child?.id);
        return message.audience.includes("Parents") && scopeMatches;
      }),
    [child?.batch, child?.id, messages],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.6rem] border bg-gradient-to-r from-amber-500/10 via-background to-rose-500/10 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Parent Messages</h2>
          <p className="max-w-2xl text-muted-foreground">
            Keep track of faculty notices that are addressed to you or to your child&apos;s class.
          </p>
        </div>
        <div className="rounded-2xl border bg-background/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Inbox count</p>
          <p className="mt-1 text-2xl font-bold">{inbox.length}</p>
        </div>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {child?.parentName ?? "Parent"} inbox
          </CardTitle>
          <CardDescription>
            Messages for {child?.name ?? "your child"} and direct notices from faculty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inbox.length > 0 ? (
            inbox.map((message) => (
              <div key={message.id} className="rounded-[1.35rem] border bg-background/80 p-4">
                <div className="flex items-start justify-between gap-4">
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
                      <Users className="mr-1 h-3.5 w-3.5" />
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
              No faculty messages are available for your child yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
