"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  GraduationCap,
  Info,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
  CircleCheck,
  CircleX,
  CircleDashed,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AttendanceMode = "admin" | "faculty";

type AttendanceDashboardProps = {
  mode: AttendanceMode;
  title: string;
  subtitle: string;
  actionLabel: string;
  secondaryActionLabel: string;
  tertiaryActionLabel: string;
};

type AttendanceStatus = "present" | "absent" | "late" | "holiday";

type CalendarCell = {
  day: number | null;
  isToday: boolean;
  status: AttendanceStatus | null;
};

type AttendanceRow = {
  rollNo: string;
  name: string;
  status: AttendanceStatus;
  remark?: string;
  checked: boolean;
};

type RecentRecord = {
  date: string;
  subject: string;
  present: number;
  absent: number;
  late: number;
  pct: number;
};

const attendanceStatusMeta: Record<
  AttendanceStatus,
  {
    label: string;
    icon: typeof CircleCheck;
    pillClass: string;
    iconClass: string;
  }
> = {
  present: {
    label: "Present",
    icon: CircleCheck,
    pillClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClass: "text-emerald-600",
  },
  absent: {
    label: "Absent",
    icon: CircleX,
    pillClass: "border-rose-200 bg-rose-50 text-rose-700",
    iconClass: "text-rose-500",
  },
  late: {
    label: "Late",
    icon: Clock3,
    pillClass: "border-amber-200 bg-amber-50 text-amber-700",
    iconClass: "text-amber-500",
  },
  holiday: {
    label: "Holiday",
    icon: CircleDashed,
    pillClass: "border-slate-200 bg-slate-50 text-slate-600",
    iconClass: "text-slate-400",
  },
};

const attendanceRows: AttendanceRow[] = [
  { rollNo: "STU-001", name: "Saif Rahman", status: "present", checked: true },
  { rollNo: "STU-002", name: "Ahmed Khan", status: "present", checked: true },
  { rollNo: "STU-003", name: "Sarah Ali", status: "absent", checked: false },
  { rollNo: "STU-004", name: "John Doe", status: "present", checked: true },
  { rollNo: "STU-005", name: "Fatima Noor", status: "late", remark: "Reached at 10:15 AM", checked: true },
  { rollNo: "STU-006", name: "Ali Hassan", status: "present", checked: true },
  { rollNo: "STU-007", name: "Maria Ahmed", status: "absent", checked: false },
];

const monthlyTrend = [
  { label: "1 May", value: 58 },
  { label: "5 May", value: 66 },
  { label: "8 May", value: 68 },
  { label: "12 May", value: 61 },
  { label: "15 May", value: 74 },
  { label: "18 May", value: 80 },
  { label: "22 May", value: 72 },
  { label: "26 May", value: 78 },
  { label: "30 May", value: 83 },
];

const attendanceOverview = [
  { name: "Present", value: 346, pct: 82.37, color: "#16a34a" },
  { name: "Absent", value: 27, pct: 6.35, color: "#ef4444" },
  { name: "Late", value: 20, pct: 4.76, color: "#f59e0b" },
  { name: "Holiday", value: 27, pct: 6.52, color: "#cbd5e1" },
];

const recentRecords: RecentRecord[] = [
  { date: "30 May 2026", subject: "Advanced Quantum Computing", present: 38, absent: 3, late: 1, pct: 90.48 },
  { date: "28 May 2026", subject: "Quantum Mechanics", present: 37, absent: 4, late: 1, pct: 88.1 },
  { date: "26 May 2026", subject: "Linear Algebra", present: 39, absent: 2, late: 1, pct: 92.86 },
  { date: "24 May 2026", subject: "Probability & Statistics", present: 36, absent: 4, late: 2, pct: 85.71 },
  { date: "22 May 2026", subject: "Python for Quantum", present: 40, absent: 1, late: 1, pct: 95.24 },
];

const riskStudents = [
  { name: "Sarah Ali", rollNo: "STU-003", pct: 68, tone: "bg-rose-500" },
  { name: "John Doe", rollNo: "STU-004", pct: 72, tone: "bg-orange-500" },
];

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCalendarCells(date: Date): CalendarCell[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const todayKey = date.toDateString();

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return { day: null, isToday: false, status: null };
    }

    const dayDate = new Date(date.getFullYear(), date.getMonth(), dayNumber);
    const status: AttendanceStatus =
      dayNumber % 7 === 0 ? "holiday" : dayNumber % 6 === 0 ? "absent" : dayNumber % 5 === 0 ? "late" : "present";

    return {
      day: dayNumber,
      isToday: dayDate.toDateString() === todayKey,
      status,
    };
  });
}

function Sparkline({ data, stroke = "#5b3df5" }: { data: Array<{ value: number }>; stroke?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SummaryStat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  sparkline,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: typeof Users;
  tone: string;
  sparkline?: readonly { value: number }[];
}) {
  return (
    <Card className="rounded-[1.25rem] border-slate-200/80 bg-white/90 shadow-[0_20px_40px_rgba(15,23,42,0.04)] backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", tone)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600">{label}</p>
            <div className="mt-1 text-[1.65rem] font-semibold tracking-tight text-slate-900">{value}</div>
            {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
          </div>
          {sparkline ? (
            <div className="h-14 w-24 pt-1">
              <Sparkline data={sparkline} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function AttendancePill({ status }: { status: AttendanceStatus }) {
  const meta = attendanceStatusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium",
        meta.pillClass,
      )}
    >
      <Icon className={cn("h-4 w-4", meta.iconClass)} />
      {meta.label}
      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
    </span>
  );
}

function FacultyAttendanceView({ actionLabel, secondaryActionLabel, tertiaryActionLabel }: AttendanceDashboardProps) {
  const [calendarDate, setCalendarDate] = useState(() => new Date("2026-05-30T12:00:00+05:30"));
  const calendarCells = useMemo(() => getCalendarCells(calendarDate), [calendarDate]);

  const stats = [
    {
      label: "Total Students",
      value: "42",
      detail: "",
      icon: Users,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Present Today",
      value: "38",
      detail: "90.48%",
      icon: Users,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Absent Today",
      value: "3",
      detail: "7.14%",
      icon: CircleX,
      tone: "bg-rose-100 text-rose-500",
    },
    {
      label: "Late Today",
      value: "1",
      detail: "2.38%",
      icon: Clock3,
      tone: "bg-amber-100 text-amber-500",
    },
    {
      label: "Attendance % (This Month)",
      value: "91.27%",
      detail: "",
      icon: TrendingUp,
      tone: "bg-violet-100 text-violet-600",
      sparkline: [
        { value: 78 },
        { value: 80 },
        { value: 79 },
        { value: 84 },
        { value: 85 },
        { value: 83 },
        { value: 88 },
        { value: 86 },
        { value: 91 },
      ],
    },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(91,61,245,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.08),_transparent_24%),linear-gradient(180deg,#f9fbff_0%,#ffffff_42%,#f7f8ff_100%)] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/75 px-4 py-5 shadow-[0_24px_80px_rgba(91,61,245,0.08)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Student Attendance</h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">Manage and track attendance for your batches</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-white/90 px-4 text-slate-700 shadow-sm hover:bg-white"
              >
                <CalendarDays className="h-4 w-4" />
                {formatShortDate(calendarDate)}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-white shadow-[0_18px_30px_rgba(91,61,245,0.26)] hover:from-violet-500 hover:to-indigo-500">
                <Download className="h-4 w-4" />
                {tertiaryActionLabel}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="w-full md:max-w-[240px]">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Select Batch</label>
              <button
                type="button"
                className="flex h-14 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-base font-medium text-slate-900 shadow-sm transition hover:border-violet-300 hover:shadow-md"
              >
                <span>QC-2026</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <Button variant="ghost" className="h-12 w-fit rounded-full px-2 text-violet-600 hover:bg-violet-50 hover:text-violet-700">
              <Info className="h-4 w-4" />
              Batch Details
            </Button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-5">
            {stats.map((stat) => (
              <SummaryStat key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.92fr)]">
          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="gap-4 px-6 pb-4 pt-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Take Attendance - QC-2026</CardTitle>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-violet-300 bg-white px-4 text-violet-600 hover:bg-violet-50"
                  >
                    {secondaryActionLabel}
                  </Button>
                  <Button className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-white shadow-[0_18px_30px_rgba(91,61,245,0.22)]">
                    <ShieldCheck className="h-4 w-4" />
                    {actionLabel}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Subject</p>
                    <p className="text-sm font-medium text-slate-900">Advanced Quantum Computing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Time</p>
                    <p className="text-sm font-medium text-slate-900">10:00 AM - 11:30 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-900">Lab 3, Block A</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-6 pt-0">
              <div className="overflow-hidden border-t border-slate-200">
                <div className="max-h-[430px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="w-12 px-4 py-4">
                          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                        </TableHead>
                        <TableHead className="w-14 px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">#</TableHead>
                        <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Roll No.</TableHead>
                        <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Student Name</TableHead>
                        <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Status</TableHead>
                        <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Remarks (Optional)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRows.map((student, index) => (
                        <TableRow key={student.rollNo} className="border-slate-100 hover:bg-slate-50/70">
                          <TableCell className="px-4 py-4 align-middle">
                            <input type="checkbox" defaultChecked={student.checked} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                          </TableCell>
                          <TableCell className="px-4 py-4 font-medium text-slate-500">{index + 1}</TableCell>
                          <TableCell className="px-4 py-4 text-slate-700">{student.rollNo}</TableCell>
                          <TableCell className="px-4 py-4 font-medium text-slate-900">{student.name}</TableCell>
                          <TableCell className="px-4 py-4">
                            <AttendancePill status={student.status} />
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <input
                              defaultValue={student.remark}
                              placeholder="Add remark (optional)"
                              className={cn(
                                "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition",
                                "placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100",
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Attendance Calendar</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-full border-slate-200 bg-white p-0 text-slate-700"
                    onClick={() => setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="min-w-[120px] text-center text-sm font-semibold text-slate-700">{formatMonthLabel(calendarDate)}</p>
                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-full border-slate-200 bg-white p-0 text-slate-700"
                    onClick={() => setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((cell, index) => {
                    if (!cell.day) {
                      return <div key={`empty-${index}`} className="h-11 rounded-full" />;
                    }

                    const meta = cell.status ? attendanceStatusMeta[cell.status] : null;
                    const isToday = cell.isToday;

                    return (
                      <div
                        key={cell.day}
                        className={cn(
                          "flex h-11 items-center justify-center rounded-full border text-sm font-medium transition",
                          isToday
                            ? "border-violet-500 bg-violet-600 text-white shadow-[0_12px_20px_rgba(91,61,245,0.25)]"
                            : "border-transparent bg-transparent text-slate-700",
                        )}
                      >
                        {meta ? (
                          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", isToday ? "bg-white/15" : "")}>
                            {meta.icon === CircleCheck ? (
                              <CircleCheck className={cn("h-5 w-5", isToday ? "text-white" : meta.iconClass)} />
                            ) : meta.icon === CircleX ? (
                              <CircleX className={cn("h-5 w-5", isToday ? "text-white" : meta.iconClass)} />
                            ) : meta.icon === Clock3 ? (
                              <Clock3 className={cn("h-5 w-5", isToday ? "text-white" : meta.iconClass)} />
                            ) : (
                              <CircleDashed className={cn("h-5 w-5", isToday ? "text-white" : meta.iconClass)} />
                            )}
                          </span>
                        ) : (
                          <span>{cell.day}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {(["present", "absent", "late", "holiday"] as AttendanceStatus[]).map((status) => {
                    const meta = attendanceStatusMeta[status];
                    const Icon = meta.icon;
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", status === "present" ? "bg-emerald-100" : status === "absent" ? "bg-rose-100" : status === "late" ? "bg-amber-100" : "bg-slate-100")}>
                          <Icon className={cn("h-4 w-4", meta.iconClass)} />
                        </span>
                        <span>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Students at Risk (Below 75%)</CardTitle>
                </div>
                <Button variant="ghost" className="h-9 px-2 text-violet-600 hover:bg-violet-50 hover:text-violet-700">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 pt-0">
                {riskStudents.map((student) => (
                  <div key={student.rollNo} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <CircleX className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-slate-900">{student.name}</p>
                        <span className="text-sm text-slate-500">{student.rollNo}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={student.pct} className="h-2 flex-1 bg-slate-200" />
                        <span className={cn("w-12 text-right text-sm font-semibold", student.pct < 70 ? "text-rose-500" : "text-orange-500")}>
                          {student.pct}%
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-violet-300 px-4 text-violet-600 hover:bg-violet-50">
                      Notify
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_0.95fr_1.4fr]">
          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="px-6 pb-0 pt-6">
              <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Attendance Overview <span className="text-slate-500">(This Month)</span></CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                <div className="relative mx-auto h-56 w-full max-w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attendanceOverview} dataKey="value" innerRadius={64} outerRadius={92} paddingAngle={4} stroke="none">
                        {attendanceOverview.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-semibold tracking-tight text-slate-900">91.27%</div>
                    <div className="text-sm text-slate-500">Attendance</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {attendanceOverview.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="min-w-[64px] text-sm text-slate-600">{item.name}</span>
                      <span className="ml-auto text-sm text-slate-500">{item.pct}% ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <p className="text-sm text-slate-500">Total Classes</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">26</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Classes Held</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">22</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Attendance Trend</CardTitle>
              </div>
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700">
                This Month
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="h-[340px] px-2 pb-6 pt-0 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 12, right: 18, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.75} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#5b3df5" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#5b3df5" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Recent Attendance Records</CardTitle>
              </div>
              <Button variant="ghost" className="h-9 px-2 text-violet-600 hover:bg-violet-50 hover:text-violet-700">
                View All
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-4 pt-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Date</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Subject</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Present</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Absent</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Late</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRecords.map((record) => (
                      <TableRow key={record.date} className="border-slate-100 hover:bg-slate-50/70">
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{record.date}</TableCell>
                        <TableCell className="px-6 py-4 text-sm font-medium text-slate-900">{record.subject}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{record.present}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{record.absent}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{record.late}</TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                            {record.pct.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info className="h-4 w-4 text-amber-500" />
              <span>
                Tip: You can edit today&apos;s attendance until 11:59 PM.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminAttendanceView({ title, subtitle, actionLabel, secondaryActionLabel, tertiaryActionLabel }: AttendanceDashboardProps) {
  const totalFaculty = useAppStore((state) => state.faculty.length);
  const totalStudents = useAppStore((state) => state.students.length);
  const batches = useAppStore((state) => state.batches);

  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Attendance Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full px-4">
            {secondaryActionLabel}
          </Button>
          <Button className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5">
            {actionLabel}
          </Button>
          <Button variant="outline" className="rounded-full px-4">
            {tertiaryActionLabel}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Students" value={totalStudents} detail="Across all batches" icon={Users} tone="bg-violet-100 text-violet-600" />
        <SummaryStat label="Faculty" value={totalFaculty} detail="Active teaching staff" icon={GraduationCap} tone="bg-emerald-100 text-emerald-600" />
        <SummaryStat label="Batches" value={batches.length} detail="Currently available groups" icon={CheckCheck} tone="bg-sky-100 text-sky-600" />
        <SummaryStat label="Quick Status" value="Ready" detail="Admin attendance tools loaded" icon={ShieldCheck} tone="bg-amber-100 text-amber-600" />
      </div>
    </div>
  );
}

export function AttendanceDashboard(props: AttendanceDashboardProps) {
  if (props.mode === "faculty") {
    return <FacultyAttendanceView {...props} />;
  }

  return <AdminAttendanceView {...props} />;
}
