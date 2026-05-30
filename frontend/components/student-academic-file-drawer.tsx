"use client";

import { useMemo } from "react";
import {
  ArrowDownToLine,
  BookOpen,
  Brain,
  Flame,
  LineChart,
  Medal,
  PartyPopper,
  Radar,
  Send,
  Sparkles,
  Star,
  Users,
  UserRound,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppStore, type StudentData } from "@/lib/store";
import { cn } from "@/lib/utils";

type StudentAcademicFileDrawerProps = {
  student: StudentData;
  trigger?: React.ReactNode;
  triggerClassName?: string;
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const subjectPalette = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-orange-500",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getGrade(score: number) {
  if (score >= 93) return "A+";
  if (score >= 86) return "A";
  if (score >= 80) return "B+";
  if (score >= 72) return "B";
  if (score >= 65) return "C+";
  return "Needs support";
}

function getLevel(score: number) {
  if (score >= 88) return "Excellent";
  if (score >= 76) return "Good";
  if (score >= 62) return "In Progress";
  return "Needs Attention";
}

function getRiskLabel(score: number) {
  if (score >= 84) return "Low";
  if (score >= 70) return "Medium";
  return "High";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StudentAcademicFileDrawer({ student, trigger, triggerClassName }: StudentAcademicFileDrawerProps) {
  const { addNotification } = useAppStore();

  const insights = useMemo(() => {
    const overallScore = clamp(Math.round(student.attendancePct * 0.55 + student.progress * 0.45), 0, 100);
    const gpa = (overallScore / 10).toFixed(1);
    const completion = clamp(student.progress, 0, 100);
    const attendance = clamp(student.attendancePct, 0, 100);
    const assignmentsTotal = 26;
    const assignmentsCompleted = clamp(Math.round((completion / 100) * assignmentsTotal), 0, assignmentsTotal);
    const submittedOnTime = clamp(Math.round(assignmentsCompleted - Math.max(0, (100 - attendance) / 18)), 0, assignmentsTotal);
    const lateSubmissions = clamp(Math.round((100 - attendance) / 20), 0, assignmentsTotal);
    const missingAssignments = clamp(assignmentsTotal - assignmentsCompleted, 0, assignmentsTotal);
    const chartData = monthLabels.map((month, index) => ({
      month,
      score: clamp(
        Math.round(overallScore - 15 + index * 4 + (index === 5 ? 3 : 0)),
        48,
        98,
      ),
    }));
    const subjectRows = [
      {
        subject: student.course,
        score: clamp(Math.round(completion + 7), 55, 97),
      },
      {
        subject: "Attendance Discipline",
        score: attendance,
      },
      {
        subject: "Assignment Mastery",
        score: clamp(Math.round(completion + (attendance - 75) * 0.55), 48, 98),
      },
      {
        subject: "Participation",
        score: clamp(Math.round(attendance * 0.8 + completion * 0.2), 45, 96),
      },
      {
        subject: "Assessment Readiness",
        score: overallScore,
      },
    ];
    const achievementPool = [
      {
        label: "Perfect Attendance",
        tone: "bg-emerald-500/10 text-emerald-600",
        active: attendance >= 95,
        description: "Attendance streak above 95%",
      },
      {
        label: "Top Performer",
        tone: "bg-amber-500/10 text-amber-600",
        active: overallScore >= 85,
        description: "High composite performance",
      },
      {
        label: "Completed",
        tone: "bg-sky-500/10 text-sky-600",
        active: completion >= 80,
        description: "Course milestones unlocked",
      },
      {
        label: "Consistent Learner",
        tone: "bg-violet-500/10 text-violet-600",
        active: attendance >= 80 && completion >= 60,
        description: "Stable engagement across weeks",
      },
      {
        label: "Parent Linked",
        tone: "bg-rose-500/10 text-rose-600",
        active: Boolean(student.parentName),
        description: "Parent contact connected",
      },
      {
        label: "Fast Mover",
        tone: "bg-orange-500/10 text-orange-600",
        active: completion >= 65 && attendance >= 85,
        description: "Pacing ahead of the cohort",
      },
    ];

    return {
      overallScore,
      gpa,
      completion,
      attendance,
      assignmentsTotal,
      assignmentsCompleted,
      submittedOnTime,
      lateSubmissions,
      missingAssignments,
      chartData,
      subjectRows,
      achievementPool,
    };
  }, [student]);

  const overallLevel = getLevel(insights.overallScore);
  const grade = getGrade(insights.overallScore);
  const riskLabel = getRiskLabel(insights.overallScore);
  const hasLowAttendance = insights.attendance < 75;
  const parentName = student.parentName || "Parent not linked";
  const parentLastLogin = insights.attendance >= 90 ? "2 days ago" : "1 week ago";
  const remarks =
    insights.overallScore >= 88
      ? "Excellent understanding of concepts. Shows strong consistency and keeps pace with the batch at a healthy level."
      : insights.overallScore >= 75
        ? "Good academic rhythm with a few areas to sharpen. Continued assignment discipline will push performance higher."
        : "Needs closer guidance on attendance and syllabus momentum. A short improvement plan will help restore pace.";

  const handleDownload = () => {
    addNotification("Student report ready", `A report snapshot for ${student.name} has been prepared for download.`);
  };

  const handleSendToParent = () => {
    addNotification("Parent update queued", `Progress summary for ${student.name} is ready to share with ${parentName}.`);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger ?? <Button className={cn("rounded-xl", triggerClassName)}>Open preview</Button>}</DrawerTrigger>
      <DrawerContent className="h-dvh w-full max-w-none border-l bg-gradient-to-br from-background via-background to-slate-50 p-0 shadow-2xl data-[vaul-drawer-direction=right]:sm:max-w-[1200px]">
        <div className="flex h-full flex-col overflow-hidden">
          <DrawerHeader className="sticky top-0 z-20 border-b bg-background/95 px-6 py-5 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-2xl">Student Performance</DrawerTitle>
                <DrawerDescription>Comprehensive overview of academic progress, attendance, and parent connections.</DrawerDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={handleDownload} className="rounded-full gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={handleSendToParent} className="rounded-full gap-2">
                  <Send className="h-4 w-4" />
                  Send to Parent
                </Button>
                <DrawerClose asChild>
                  <Button variant="ghost" className="rounded-full">
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                <CardContent className="grid gap-6 p-6 xl:grid-cols-[1.2fr_1fr_1fr_1fr] xl:items-center">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-500 text-2xl font-semibold text-white">
                          {initials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
                    </div>

                    <div className="min-w-0 space-y-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-semibold tracking-tight">{student.name}</h3>
                          <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                            {grade}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Student ID: {student.id} · Batch: {student.batch}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full">
                          {student.course}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-violet-500/20 bg-violet-500/10 text-violet-600">
                          {overallLevel}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-sky-500/20 bg-sky-500/10 text-sky-600">
                          Parent: {parentName}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border bg-background/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Overall Performance</span>
                      <span className="font-medium text-foreground">{insights.overallScore}/100</span>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <div className="text-4xl font-semibold tracking-tight text-violet-600">{insights.overallScore}</div>
                      <div className="pb-1 text-xl text-muted-foreground">/100</div>
                    </div>
                    <Badge className="mt-3 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                      {overallLevel}
                    </Badge>
                  </div>

                  <div className="rounded-3xl border bg-background/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Attendance</span>
                      <span className="font-medium text-foreground">{insights.attendance}%</span>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <div className="text-4xl font-semibold tracking-tight text-emerald-600">{insights.attendance}%</div>
                    </div>
                    <Badge className="mt-3 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                      {insights.attendance >= 90 ? "Good" : "Watch closely"}
                    </Badge>
                  </div>

                  <div className="rounded-3xl border bg-background/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Course Completion</span>
                      <span className="font-medium text-foreground">{insights.completion}%</span>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <div className="text-4xl font-semibold tracking-tight text-orange-500">{insights.completion}%</div>
                    </div>
                    <Badge className="mt-3 rounded-full bg-orange-500/10 text-orange-600 hover:bg-orange-500/10">
                      {insights.completion >= 80 ? "On Track" : "In Progress"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { title: "GPA", value: `${insights.gpa}/10`, helper: "Very Good", tone: "text-violet-600", icon: LineChart },
                  { title: "Attendance", value: `${insights.attendance}%`, helper: "Good", tone: "text-emerald-600", icon: Users },
                  { title: "Assignments", value: `${insights.assignmentsCompleted}/${insights.assignmentsTotal}`, helper: "Completed", tone: "text-sky-600", icon: BookOpen },
                  { title: "Completion", value: `${insights.completion}%`, helper: "In Progress", tone: "text-orange-500", icon: Medal },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="rounded-[1.4rem] border-border/60 bg-background/90 shadow-sm">
                      <CardContent className="flex items-center gap-4 p-5">
                        <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/70", item.tone)}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                          <p className="text-3xl font-semibold tracking-tight">{item.value}</p>
                          <p className={cn("text-sm", item.tone)}>{item.helper}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                    <div>
                      <CardTitle className="text-xl">Performance Trend</CardTitle>
                      <CardDescription>Recent score trajectory built from attendance and course progress.</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      6 Months
                    </Badge>
                  </CardHeader>
                  <CardContent className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={insights.chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`student-score-${student.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis domain={[40, 100]} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill={`url(#student-score-${student.id})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Subject-wise Performance</CardTitle>
                    <CardDescription>Key learning areas mapped from the current student record.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.subjectRows.map((row, index) => {
                      const gradeLabel = getGrade(row.score);
                      return (
                        <div key={row.subject} className="space-y-2 rounded-2xl border bg-background/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-medium">{row.subject}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Benchmark</span>
                                <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">
                                  {gradeLabel}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{row.score}%</p>
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className={cn("h-full rounded-full", subjectPalette[index % subjectPalette.length])} style={{ width: `${row.score}%` }} />
                          </div>
                        </div>
                      );
                    })}

                    <Button variant="outline" className="w-full rounded-2xl">
                      View All Subjects
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Attendance Analytics</CardTitle>
                    <CardDescription>Presence, absence, and late arrivals summarised in one glance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                      <div
                        className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(rgb(34 197 94) 0 ${insights.attendance}%, rgb(248 113 113) ${insights.attendance}% ${Math.min(100, insights.attendance + 8)}%, rgb(250 204 21) ${Math.min(100, insights.attendance + 8)}% 100%)`,
                        }}
                      >
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-background text-center shadow-inner">
                          <div>
                            <div className="text-3xl font-semibold">{insights.attendance}%</div>
                            <p className="text-xs text-muted-foreground">Present</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: "Present", value: `${insights.attendance}%`, tone: "bg-emerald-500" },
                          { label: "Absent", value: `${Math.max(0, 100 - insights.attendance - 4)}%`, tone: "bg-rose-500" },
                          { label: "Late", value: `${Math.min(4, Math.max(0, 100 - insights.attendance))}%`, tone: "bg-amber-400" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2.5 w-2.5 rounded-full", item.tone)} />
                              <span className="text-sm text-muted-foreground">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <p className="text-muted-foreground">Total Classes</p>
                        <p className="mt-1 text-2xl font-semibold">250</p>
                      </div>
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <p className="text-muted-foreground">Classes Attended</p>
                        <p className="mt-1 text-2xl font-semibold">{Math.round((insights.attendance / 100) * 250)}</p>
                      </div>
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <p className="text-muted-foreground">Classes Missed</p>
                        <p className="mt-1 text-2xl font-semibold">{Math.round((100 - insights.attendance) * 2)}</p>
                      </div>
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <p className="text-muted-foreground">Late Arrivals</p>
                        <p className="mt-1 text-2xl font-semibold">{Math.min(10, Math.max(1, Math.round((100 - insights.attendance) / 4)))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Assignment Performance</CardTitle>
                    <CardDescription>Submission health and completion rate for the current workload.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                      <div
                        className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(rgb(99 102 241) 0 ${insights.completion}%, rgb(229 231 235) ${insights.completion}% 100%)`,
                        }}
                      >
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-background text-center shadow-inner">
                          <div>
                            <div className="text-3xl font-semibold">{Math.round((insights.submittedOnTime / Math.max(insights.assignmentsTotal, 1)) * 100)}%</div>
                            <p className="text-xs text-muted-foreground">Average Score</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: "Submitted On Time", value: insights.submittedOnTime, tone: "bg-emerald-500" },
                          { label: "Late Submission", value: insights.lateSubmissions, tone: "bg-amber-400" },
                          { label: "Missing", value: insights.missingAssignments, tone: "bg-rose-500" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2.5 w-2.5 rounded-full", item.tone)} />
                              <span className="text-sm text-muted-foreground">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <p className="text-muted-foreground">Total Assignments</p>
                        <p className="mt-1 text-2xl font-semibold">{insights.assignmentsTotal}</p>
                      </div>
                      <div className="rounded-2xl border bg-background/70 p-4">
                        <p className="text-muted-foreground">Completion Rate</p>
                        <p className="mt-1 text-2xl font-semibold">{Math.round((insights.assignmentsCompleted / insights.assignmentsTotal) * 100)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1.1fr]">
                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Faculty Remarks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl border bg-muted/20 p-4">
                      <p className="text-sm leading-6 text-foreground">{remarks}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-slate-800 text-white">DN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Dr. Neha Sharma</p>
                        <p className="text-xs text-muted-foreground">{student.course} Faculty</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Review date: June 10, 2026</div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Parent / Guardian Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4 rounded-3xl border bg-emerald-500/5 p-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                        <UserRound className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Parent / Guardian</p>
                        <p className="text-lg font-semibold">{parentName}</p>
                        <p className="text-sm text-muted-foreground">Last Login: {parentLastLogin}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl border bg-violet-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Parent Engagement Score</p>
                        <Sparkles className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="mt-2 flex items-end gap-2">
                        <p className="text-3xl font-semibold text-violet-600">{clamp(Math.round(insights.attendance + 8), 50, 98)}%</p>
                        <span className="pb-1 text-emerald-600">↗</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Active & supportive</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">AI Student Health Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 rounded-3xl border bg-background/70 p-4">
                      {[
                        { label: "Academic Risk", value: "Low", tone: "text-emerald-600", dot: "bg-emerald-500" },
                        { label: "Attendance Risk", value: hasLowAttendance ? "Medium" : "Low", tone: hasLowAttendance ? "text-orange-600" : "text-emerald-600", dot: hasLowAttendance ? "bg-orange-500" : "bg-emerald-500" },
                        { label: "Assignment Risk", value: insights.completion < 70 ? "Medium" : "Low", tone: insights.completion < 70 ? "text-orange-600" : "text-emerald-600", dot: insights.completion < 70 ? "bg-orange-500" : "bg-emerald-500" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-3 py-2">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Brain className="h-4 w-4 text-violet-600" />
                            {item.label}
                          </span>
                          <span className={cn("flex items-center gap-2 text-sm font-medium", item.tone)}>
                            {item.value}
                            <span className={cn("h-2.5 w-2.5 rounded-full", item.dot)} />
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <div className="flex items-center gap-2 font-medium text-amber-700">
                        <PartyPopper className="h-4 w-4" />
                        Recommendation
                      </div>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        Focus on {student.course.toLowerCase()} and keep the syllabus momentum steady over the next 3 weeks.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-[1.8rem] border-border/60 bg-background/90 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 pb-4">
                  <Star className="h-5 w-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-xl">Achievements</CardTitle>
                    <CardDescription>Celebrated milestones that can be shared with student and parent alike.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    {insights.achievementPool.map((achievement) => (
                      <div
                        key={achievement.label}
                        className={cn(
                          "flex min-h-[150px] flex-col items-center justify-center rounded-[1.6rem] border p-4 text-center transition-transform hover:-translate-y-0.5",
                          achievement.active ? achievement.tone : "bg-muted/30 text-muted-foreground",
                        )}
                      >
                        <div className={cn("flex h-16 w-16 items-center justify-center rounded-full text-2xl", achievement.active ? achievement.tone : "bg-background")}>
                          {achievement.active ? <Medal className="h-8 w-8" /> : <Flame className="h-8 w-8 opacity-40" />}
                        </div>
                        <p className="mt-4 text-sm font-semibold">{achievement.label}</p>
                        <p className="mt-1 text-xs">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                <span>Last updated: May 30, 2026</span>
                <span className="flex items-center gap-2">
                  <Radar className="h-4 w-4 text-violet-600" />
                  {riskLabel} risk profile
                </span>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
