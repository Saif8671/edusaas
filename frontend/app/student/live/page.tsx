"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Copy, ExternalLink, Link2, Video } from "lucide-react";
import { useAppStore, type LiveSessionData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

function parseSessionTime(time: string) {
  const normalized = time.trim().toUpperCase();

  if (normalized.includes("AM") || normalized.includes("PM")) {
    const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!match) return 0;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3];

    if (meridiem === "AM") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }

    return hours * 60 + minutes;
  }

  const [hoursPart = "0", minutesPart = "0"] = normalized.split(":");
  return Number(hoursPart) * 60 + Number(minutesPart);
}

function sessionSortKey(session: LiveSessionData) {
  const dateKey = new Date(`${session.date}T00:00:00`).getTime();
  return dateKey + parseSessionTime(session.time) * 60_000;
}

export default function StudentLive() {
  const { liveSessions } = useAppStore();
  const [statusMessage, setStatusMessage] = useState("");

  const upcomingSessions = useMemo(
    () =>
      [...liveSessions]
        .filter((session) => session.status !== "Completed")
        .sort((left, right) => sessionSortKey(left) - sessionSortKey(right)),
    [liveSessions],
  );

  const activeSession = upcomingSessions[0] ?? liveSessions[0] ?? null;

  const joinSession = async (session: LiveSessionData) => {
    if (!session.link) {
      setStatusMessage("No join link is available for this session yet.");
      return;
    }

    try {
      window.open(session.link, "_blank", "noopener,noreferrer");
      setStatusMessage(`Opening ${session.title}.`);
    } catch {
      setStatusMessage("Unable to open the meeting link.");
    }
  };

  const copyLink = async (session: LiveSessionData) => {
    if (!session.link) return;

    try {
      await navigator.clipboard.writeText(session.link);
      setStatusMessage("Meeting link copied to clipboard.");
    } catch {
      setStatusMessage("Could not copy the meeting link.");
    }
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Live Classes"
        description="Join Zoom or other scheduled live broadcasts from your faculty."
      />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <Video className="mb-2 h-8 w-8 text-primary" />
          <CardTitle>Next live session</CardTitle>
          <CardDescription>The first upcoming session from your live class schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="space-y-4 rounded-[1.4rem] border bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight">{activeSession.title}</h3>
                    <p className="text-sm text-muted-foreground">{activeSession.batch}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{activeSession.provider ?? activeSession.platform}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                      {activeSession.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="mt-1 font-semibold">
                      {activeSession.date} at {activeSession.time}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Meeting link</p>
                    <p className="mt-1 break-all font-semibold">{activeSession.link || "Not shared yet"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">Notes</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeSession.notes}</p>
                </div>

                {activeSession.passcode ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm font-semibold text-foreground">Zoom passcode</p>
                    <p className="mt-1 text-sm text-muted-foreground">{activeSession.passcode}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="rounded-xl gap-2"
                    onClick={() => joinSession(activeSession)}
                    disabled={!activeSession.link}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Join meeting
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => copyLink(activeSession)}>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </Button>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.4rem] border bg-background/70 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  Quick access
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Batch</p>
                    <p className="mt-1 font-semibold">{activeSession.batch}</p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="mt-1 font-semibold">{activeSession.provider ?? activeSession.platform}</p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="mt-1 font-semibold">{activeSession.status}</p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="mt-1 font-semibold">{activeSession.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed p-6 text-center text-sm text-muted-foreground">
              No live classes have been scheduled yet.
            </div>
          )}

          {statusMessage ? <p className="mt-4 text-sm text-muted-foreground">{statusMessage}</p> : null}
        </CardContent>
      </Card>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Upcoming sessions</CardTitle>
          <CardDescription>These are the live classes currently stored in your class schedule.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <div key={session.id} className="rounded-[1.35rem] border bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{session.title}</h3>
                      {session.provider === "Zoom" || session.platform === "Zoom" ? (
                        <Badge className="bg-sky-500/10 text-sky-700 hover:bg-sky-500/10">Zoom</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{session.batch}</p>
                  </div>
                  <Badge variant="outline">{session.status}</Badge>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <p className="mt-1 text-sm font-semibold">
                      <CalendarDays className="mr-1 inline-block h-4 w-4" />
                      {session.date} - {session.time}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Join link</p>
                    <p className="mt-1 break-all text-sm font-semibold">{session.link}</p>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Access</p>
                    <p className="mt-1 text-sm font-semibold">
                      {session.passcode ? `Passcode ${session.passcode}` : "No passcode required"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-full" onClick={() => joinSession(session)} disabled={!session.link}>
                    Join
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => copyLink(session)}>
                    Copy
                  </Button>
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Shared by faculty
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-dashed p-6 text-center text-sm text-muted-foreground">
              Your upcoming live sessions will appear here once faculty schedules them.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
