"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, BellRing } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { routes } from "@/lib/routes";
import { useAppNav } from "@/hooks/use-app-nav";
function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function StudentMessages() {
  const navigate = useAppNav();
  const { currentUser, students, messages } = useAppStore();

  const profile = useMemo(
    () => students.find((student) => student.id === currentUser?.id) ?? students[0],
    [currentUser?.id, students],
  );

  const inbox = useMemo(
    () =>
      messages.filter((message) => {
        const scopeMatches =
          message.scope === "All" ||
          (message.scope === "Batch" && message.targetBatch === profile?.batch) ||
          (message.scope === "Student" && message.targetStudentId === profile?.id);
        return message.audience.includes("Students") && scopeMatches;
      }),
    [messages, profile?.batch, profile?.id],
  );

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Messages"
        description="Faculty notices for your class and direct updates to your profile."
        actions={
          <Button type="button" variant="outline" className="rounded-full" onClick={() => navigate(routes.student.calendar)}>
            View calendar
          </Button>
        }
      />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {profile?.name ?? "Student"} inbox
            <Badge variant="secondary" className="ml-2 rounded-full">
              {inbox.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Messages for {profile?.batch ?? "your batch"} and direct notices from faculty.
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
                  {message.targetStudentName ? (
                    <Badge variant="secondary">Student: {message.targetStudentName}</Badge>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Inbox is empty"
              description="When faculty send class or direct messages, they will appear here."
              actionLabel="Check live classes"
              onAction={() => navigate(routes.student.live)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
