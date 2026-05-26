"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { AlertCircle, CalendarDays, TrendingUp } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentAttendance() {
  const { students } = useAppStore();
  const profile = students.find((student) => student.id === "STU-001") || students[0];

  const attendanceTrend = useMemo(
    () => [
      { day: "Mon", attendance: Math.max(profile?.attendancePct - 8, 60) },
      { day: "Tue", attendance: Math.max(profile?.attendancePct - 4, 60) },
      { day: "Wed", attendance: profile?.attendancePct ?? 0 },
      { day: "Thu", attendance: Math.min((profile?.attendancePct ?? 0) + 2, 100) },
      { day: "Fri", attendance: Math.min((profile?.attendancePct ?? 0) + 4, 100) },
      { day: "Sat", attendance: Math.max(profile?.attendancePct - 6, 60) },
    ],
    [profile],
  );

  const monthlyBreakdown = useMemo(
    () => [
      { month: "Jan", present: 22 },
      { month: "Feb", present: 24 },
      { month: "Mar", present: 26 },
      { month: "Apr", present: 23 },
      { month: "May", present: 25 },
      { month: "Jun", present: profile?.attendancePct ? Math.round((profile.attendancePct / 100) * 26) : 0 },
    ],
    [profile],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Analytics</h2>
        <p className="text-muted-foreground">A graphical view of your attendance trends and monthly presence.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardDescription>Overall rate</CardDescription>
            <CardTitle className="text-4xl">{profile?.attendancePct}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="h-4 w-4 text-primary" />
                Current course
              </div>
              <p className="mt-2 text-muted-foreground">{profile?.course}</p>
            </div>

            {profile?.attendancePct < 75 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  Critical attendance alert
                </div>
                <p className="mt-2 text-sm">Your attendance is below the 75% threshold, so please keep up with upcoming classes.</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Parent: {profile?.parentName}</Badge>
              <Badge variant="secondary">Batch: {profile?.batch}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly attendance graph
            </CardTitle>
            <CardDescription>Day-by-day attendance heat map for your week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#attendanceFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Monthly attendance summary</CardTitle>
          <CardDescription>Presence count per month shown as bars.</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
