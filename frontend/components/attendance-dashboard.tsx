"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleX,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  GraduationCap,
  Info,
  MessageSquare,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  Users2,
  FileDown,
  type LucideIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/lib/store";
import { buildAttendanceAlertHtml, buildAttendanceAlertText } from "@/lib/notifications";
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

type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
  progress?: number;
  progressClass?: string;
};

type BatchCard = {
  name: string;
  students: number;
  attendance: number;
  present: number;
  absent: number;
  late: number;
  tone: string;
  iconTone: string;
  line: string;
  trend: number[];
};

type AttendanceRow = {
  rollNo: string;
  name: string;
  status: AttendanceStatus;
  checked: boolean;
};

type FacultyRow = {
  name: string;
  department: string;
  status: "Present" | "On Leave";
  checkIn: string;
  checkOut: string;
  workingHours: string;
};

type LeaveRequest = {
  initials: string;
  name: string;
  reason: string;
  from: string;
  to: string;
};

const attendanceStatusMeta: Record<
  AttendanceStatus,
  {
    label: string;
    icon: LucideIcon;
    dotClass: string;
    iconClass: string;
  }
> = {
  present: {
    label: "Present",
    icon: CircleCheck,
    dotClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClass: "text-emerald-600",
  },
  absent: {
    label: "Absent",
    icon: CircleX,
    dotClass: "border-rose-200 bg-rose-50 text-rose-700",
    iconClass: "text-rose-500",
  },
  late: {
    label: "Late",
    icon: Clock3,
    dotClass: "border-amber-200 bg-amber-50 text-amber-700",
    iconClass: "text-amber-500",
  },
  holiday: {
    label: "Holiday",
    icon: CircleDashed,
    dotClass: "border-slate-200 bg-slate-50 text-slate-600",
    iconClass: "text-slate-400",
  },
};

const adminBatchCards: BatchCard[] = [
  {
    name: "QC-2026",
    students: 42,
    attendance: 92,
    present: 38,
    absent: 2,
    late: 2,
    tone: "border-emerald-200/80 bg-emerald-50/70",
    iconTone: "bg-emerald-100 text-emerald-600",
    line: "#16a34a",
    trend: [64, 68, 66, 71, 69, 74, 73, 78, 77, 84, 82, 92],
  },
  {
    name: "AI-2026",
    students: 35,
    attendance: 88,
    present: 31,
    absent: 3,
    late: 1,
    tone: "border-blue-200/80 bg-blue-50/70",
    iconTone: "bg-blue-100 text-blue-600",
    line: "#2563eb",
    trend: [72, 70, 74, 69, 77, 74, 80, 76, 81, 79, 83, 88],
  },
  {
    name: "ML-2026",
    students: 51,
    attendance: 90,
    present: 45,
    absent: 4,
    late: 2,
    tone: "border-violet-200/80 bg-violet-50/70",
    iconTone: "bg-violet-100 text-violet-600",
    line: "#6d28d9",
    trend: [71, 68, 73, 70, 75, 73, 78, 76, 80, 79, 81, 90],
  },
  {
    name: "DS-2026",
    students: 28,
    attendance: 95,
    present: 26,
    absent: 1,
    late: 1,
    tone: "border-orange-200/80 bg-orange-50/70",
    iconTone: "bg-orange-100 text-orange-600",
    line: "#f97316",
    trend: [69, 65, 68, 66, 71, 70, 75, 74, 79, 81, 80, 95],
  },
];

const facultyBatchCards: BatchCard[] = [
  {
    name: "QC-2026",
    students: 42,
    attendance: 95,
    present: 18,
    absent: 1,
    late: 0,
    tone: "border-indigo-200/80 bg-indigo-50/70",
    iconTone: "bg-indigo-100 text-indigo-600",
    line: "#4f46e5",
    trend: [82, 84, 83, 85, 86, 88, 87, 90, 89, 91, 93, 95],
  },
  {
    name: "Lab A",
    students: 24,
    attendance: 89,
    present: 21,
    absent: 2,
    late: 1,
    tone: "border-cyan-200/80 bg-cyan-50/70",
    iconTone: "bg-cyan-100 text-cyan-600",
    line: "#0891b2",
    trend: [76, 78, 77, 80, 79, 83, 81, 84, 85, 87, 88, 89],
  },
];

const studentAttendanceRows: AttendanceRow[] = [
  { rollNo: "STU-001", name: "Saif Rahman", status: "present", checked: true },
  { rollNo: "STU-002", name: "Ahmed Khan", status: "absent", checked: false },
  { rollNo: "STU-003", name: "Sarah Ali", status: "late", checked: true },
  { rollNo: "STU-004", name: "John Doe", status: "present", checked: true },
  { rollNo: "STU-005", name: "Fatima Noor", status: "present", checked: true },
  { rollNo: "STU-006", name: "Ali Hassan", status: "absent", checked: false },
];

const facultyAttendanceRows: FacultyRow[] = [
  { name: "Dr. Sharma", department: "Computer Science", status: "Present", checkIn: "09:03 AM", checkOut: "05:58 PM", workingHours: "8h 55m" },
  { name: "Prof. Ahmed", department: "Mathematics", status: "Present", checkIn: "09:10 AM", checkOut: "06:02 PM", workingHours: "8h 52m" },
  { name: "Dr. Neha", department: "Data Science", status: "On Leave", checkIn: "-", checkOut: "-", workingHours: "-" },
  { name: "Prof. John", department: "AI & ML", status: "Present", checkIn: "09:05 AM", checkOut: "05:45 PM", workingHours: "8h 40m" },
  { name: "Dr. Priya", department: "Physics", status: "Present", checkIn: "09:12 AM", checkOut: "09:01 PM", workingHours: "8h 49m" },
];

const riskStudents = [
  { name: "Sarah Ali", rollNo: "STU-003", pct: 68, tone: "bg-rose-500" },
  { name: "John Doe", rollNo: "STU-004", pct: 72, tone: "bg-orange-500" },
];

const leaveRequests: LeaveRequest[] = [
  { initials: "DN", name: "Dr. Neha Sharma", reason: "Sick Leave", from: "12 Jun 2026", to: "14 Jun 2026" },
  { initials: "PA", name: "Prof. Ahmed", reason: "Personal Leave", from: "18 Jun 2026", to: "19 Jun 2026" },
];

type AlertTarget = {
  id: string;
  name: string;
  batch: string;
  attendancePct: number;
  course: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  fallbackEmail: string;
  fallbackPhone: string;
};

const attendanceOverview = [
  { name: "Present", value: 346, pct: 82.37, color: "#16a34a" },
  { name: "Absent", value: 27, pct: 6.35, color: "#ef4444" },
  { name: "Late", value: 20, pct: 4.76, color: "#f59e0b" },
  { name: "Holiday", value: 27, pct: 6.52, color: "#cbd5e1" },
];

const monthlyTrend = [
  { label: "Jan", value: 78 },
  { label: "Feb", value: 82 },
  { label: "Mar", value: 84 },
  { label: "Apr", value: 87 },
  { label: "May", value: 91 },
];

const facultyTrend = [
  { label: "Jan", sharma: 99, ahmed: 86, neha: 64 },
  { label: "Feb", sharma: 98, ahmed: 87, neha: 62 },
  { label: "Mar", sharma: 100, ahmed: 85, neha: 63 },
  { label: "Apr", sharma: 97, ahmed: 88, neha: 57 },
  { label: "May", sharma: 100, ahmed: 80, neha: 49 },
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

function Sparkline({ data, stroke }: { data: Array<{ value: number }>; stroke: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SummaryCard({ label, value, detail, icon: Icon, tone, progress, progressClass }: SummaryMetric) {
  return (
    <Card className="rounded-[1.4rem] border-slate-200/80 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", tone)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600">{label}</p>
            <div className="mt-1 text-[1.65rem] font-semibold tracking-tight text-slate-900">{value}</div>
            <p className="mt-1 text-sm text-slate-500">{detail}</p>
          </div>
        </div>
        {typeof progress === "number" ? (
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="h-2 bg-slate-200" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Today</span>
              <span className={cn("font-semibold", progressClass)}>{progress}%</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ModeTabs({ mode }: { mode: AttendanceMode }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition",
          mode === "admin"
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_12px_24px_rgba(91,61,245,0.25)]"
            : "text-slate-600 hover:bg-slate-50",
        )}
      >
        <Users2 className="h-4 w-4" />
        Student Attendance
      </button>
      <button
        type="button"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition",
          mode === "faculty"
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_12px_24px_rgba(91,61,245,0.25)]"
            : "text-slate-600 hover:bg-slate-50",
        )}
      >
        <GraduationCap className="h-4 w-4" />
        Faculty Attendance
      </button>
    </div>
  );
}

function BatchMiniCard({ batch }: { batch: BatchCard }) {
  return (
    <div className={cn("rounded-[1.35rem] border p-4 shadow-sm", batch.tone)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", batch.iconTone)}>
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-900">{batch.name}</p>
            <p className="text-sm text-slate-500">{batch.students} Students</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", batch.iconTone)}>{batch.attendance}%</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className={cn("text-3xl font-semibold tracking-tight", batch.name === "DS-2026" ? "text-orange-500" : batch.name === "AI-2026" ? "text-blue-600" : batch.name === "ML-2026" ? "text-violet-600" : "text-emerald-600")}>
            {batch.attendance}%
          </p>
          <p className="text-sm text-slate-600">Attendance</p>
        </div>
        <div className="h-14 w-28">
          <Sparkline data={batch.trend.map((value) => ({ value }))} stroke={batch.line} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
        <div className="rounded-xl bg-white/70 px-2 py-2 text-center">
          <span className="block font-semibold text-emerald-600">{batch.present} Present</span>
        </div>
        <div className="rounded-xl bg-white/70 px-2 py-2 text-center">
          <span className="block font-semibold text-rose-600">{batch.absent} Absent</span>
        </div>
        <div className="rounded-xl bg-white/70 px-2 py-2 text-center">
          <span className="block font-semibold text-amber-600">{batch.late} Late</span>
        </div>
      </div>
    </div>
  );
}

function AttendanceChoice({ status, active }: { status: AttendanceStatus; active?: boolean }) {
  const meta = attendanceStatusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full border transition",
        active ? meta.dotClass : "border-slate-300 bg-white text-slate-400",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", active ? meta.iconClass : "text-slate-300")} />
    </span>
  );
}

function CalendarGrid({ date }: { date: Date }) {
  const cells = useMemo(() => getCalendarCells(date), [date]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((cell, index) => {
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
                ? "border-violet-500 bg-violet-600 text-white shadow-[0_12px_20px_rgba(91,61,245,0.24)]"
                : "border-transparent bg-transparent text-slate-700",
            )}
          >
            {meta ? (
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", isToday ? "bg-white/15" : "")}>
                <meta.icon className={cn("h-5 w-5", isToday ? "text-white" : meta.iconClass)} />
              </span>
            ) : (
              <span>{cell.day}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AttendanceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
      {(["present", "absent", "late", "holiday"] as AttendanceStatus[]).map((status) => {
        const meta = attendanceStatusMeta[status];
        const Icon = meta.icon;

        return (
          <div key={status} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                status === "present"
                  ? "bg-emerald-100"
                  : status === "absent"
                    ? "bg-rose-100"
                    : status === "late"
                      ? "bg-amber-100"
                      : "bg-slate-100",
              )}
            >
              <Icon className={cn("h-4 w-4", meta.iconClass)} />
            </span>
            <span>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">{title}</CardTitle>
      {actionLabel ? (
        <Button variant="ghost" className="h-9 px-2 text-violet-600 hover:bg-violet-50 hover:text-violet-700" onClick={onAction}>
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

function normalizeWhatsAppRecipient(phone: string) {
  const trimmed = phone.replace(/\s+/g, "");
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Request to ${url} failed.`);
  }

  return (await response.json()) as T;
}

async function sendAttendanceAlert(target: AlertTarget) {
  const alertText = buildAttendanceAlertText({
    studentName: target.name,
    attendancePct: target.attendancePct,
    course: target.course,
    batch: target.batch,
    recipientName: target.parentName,
    note: "Attendance is below the 75% threshold. Please contact the faculty team for support.",
  });

  const alertHtml = buildAttendanceAlertHtml({
    studentName: target.name,
    attendancePct: target.attendancePct,
    course: target.course,
    batch: target.batch,
    recipientName: target.parentName,
    note: "Attendance is below the 75% threshold. Please contact the faculty team for support.",
  });

  const emailRecipient = target.parentEmail || target.fallbackEmail;
  const phoneRecipient = target.parentPhone || target.fallbackPhone;

  await Promise.all([
    postJson("/api/notifications/email", {
      to: emailRecipient,
      subject: `Attendance alert for ${target.name}`,
      html: alertHtml,
      text: alertText,
    }),
    postJson("/api/notifications/whatsapp", {
      to: normalizeWhatsAppRecipient(phoneRecipient),
      body: alertText,
    }),
  ]);
}

function AdminAttendanceView({ title, subtitle, actionLabel, secondaryActionLabel, tertiaryActionLabel }: AttendanceDashboardProps) {
  const totalFaculty = useAppStore((state) => state.faculty.length);
  const totalStudents = useAppStore((state) => state.students.length);
  const batches = useAppStore((state) => state.batches);
  const students = useAppStore((state) => state.students);
  const addNotification = useAppStore((state) => state.addNotification);
  const [calendarDate, setCalendarDate] = useState(() => new Date("2026-05-30T12:00:00+05:30"));
  const [sendingAlertFor, setSendingAlertFor] = useState<string | null>(null);
  const selectedBatch = batches.find((batch) => batch.id === "QC-2026") ?? batches[0];

  const handleNotifyParent = async (rollNo: string) => {
    const student = students.find((candidate) => candidate.id === rollNo);

    if (!student) {
      addNotification("Attendance alert failed", "Could not locate the selected student record.");
      return;
    }

    try {
      setSendingAlertFor(rollNo);
      await sendAttendanceAlert({
        id: student.id,
        name: student.name,
        batch: student.batch,
        attendancePct: student.attendancePct,
        course: student.course,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        fallbackEmail: student.email,
        fallbackPhone: student.phone,
      });
      addNotification(
        "Parent alert sent",
        `${student.name}'s attendance update was sent through WhatsApp and email.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send the attendance alert.";
      addNotification("Attendance alert failed", message);
    } finally {
      setSendingAlertFor(null);
    }
  };

  const metrics: SummaryMetric[] = [
    {
      label: "Student Attendance Today",
      value: "91%",
      detail: "420 / 460 Present",
      icon: Users2,
      tone: "bg-emerald-100 text-emerald-600",
      progress: 91,
      progressClass: "text-emerald-600",
    },
    {
      label: "Faculty Attendance Today",
      value: "95%",
      detail: "18 / 19 Present",
      icon: GraduationCap,
      tone: "bg-blue-100 text-blue-600",
      progress: 95,
      progressClass: "text-blue-600",
    },
    {
      label: "Total Students",
      value: String(totalStudents),
      detail: "Across 4 Batches",
      icon: Users,
      tone: "bg-violet-100 text-violet-600",
    },
    {
      label: "Total Faculty",
      value: String(totalFaculty),
      detail: "Across All Departments",
      icon: UserCog,
      tone: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(91,61,245,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.08),_transparent_20%),linear-gradient(180deg,#f8fbff_0%,#ffffff_36%,#f8faff_100%)] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 px-4 py-5 shadow-[0_24px_80px_rgba(91,61,245,0.08)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-white/95 px-4 text-slate-700 shadow-sm hover:bg-white"
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

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ModeTabs mode="admin" />
            <Button variant="ghost" className="h-11 w-fit rounded-full px-3 text-violet-600 hover:bg-violet-50 hover:text-violet-700">
              <Info className="h-4 w-4" />
              Attendance Guide
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <SummaryCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <SectionHeader title="Batch Overview (Student Attendance)" actionLabel="View All Batches" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {adminBatchCards.map((batch) => (
                    <BatchMiniCard key={batch.name} batch={batch} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
              <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
                <CardHeader className="px-6 pb-4 pt-6">
                  <SectionHeader title="Attendance Trend (All Batches)" />
                </CardHeader>
                <CardContent className="h-[330px] px-4 pb-6 pt-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 12, right: 16, left: -6, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#5b3df5"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 0, fill: "#5b3df5" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
                <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
                  <SectionHeader title={`Attendance Calendar - ${selectedBatch?.id ?? "QC-2026"}`} />
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
                  <CalendarGrid date={calendarDate} />
                  <div className="mt-5">
                    <AttendanceLegend />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <div className="flex flex-col gap-4">
                  <SectionHeader title={`Take Attendance - ${selectedBatch?.id ?? "QC-2026"}`} />
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700">
                      <ChevronDown className="h-4 w-4" />
                      {secondaryActionLabel}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-4 pt-0">
                <div className="overflow-hidden border-t border-slate-200">
                  <div className="max-h-[430px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-white">
                        <TableRow className="border-slate-200 hover:bg-transparent">
                          <TableHead className="w-12 px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">#</TableHead>
                          <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Student Name</TableHead>
                          <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Roll No.</TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Present
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Absent
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Late
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentAttendanceRows.map((student, index) => (
                          <TableRow key={student.rollNo} className="border-slate-100 hover:bg-slate-50/70">
                            <TableCell className="px-4 py-4 font-medium text-slate-500">{index + 1}</TableCell>
                            <TableCell className="px-4 py-4 font-medium text-slate-900">{student.name}</TableCell>
                            <TableCell className="px-4 py-4 text-slate-600">{student.rollNo}</TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <AttendanceChoice status="present" active={student.status === "present"} />
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <AttendanceChoice status="absent" active={student.status === "absent"} />
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <AttendanceChoice status="late" active={student.status === "late"} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_18px_30px_rgba(91,61,245,0.22)]">
                  <ShieldCheck className="h-4 w-4" />
                  Save Attendance
                </Button>
              </div>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
                <SectionHeader title="Students At Risk (Below 75%)" actionLabel="View All" />
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
                    <Button
                      variant="outline"
                      className="rounded-xl border-violet-300 px-4 text-violet-600 hover:bg-violet-50"
                      onClick={() => handleNotifyParent(student.rollNo)}
                      disabled={sendingAlertFor === student.rollNo}
                    >
                      {sendingAlertFor === student.rollNo ? "Sending..." : "Notify Parent"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <SectionHeader title="Quick Actions (Student Attendance)" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Bulk Upload", helper: "Upload CSV / Excel", icon: Upload, tone: "bg-violet-100 text-violet-600" },
                    { label: "Copy Yesterday", helper: "Copy Attendance", icon: Copy, tone: "bg-blue-100 text-blue-600" },
                    { label: "Mark All Present", helper: "Entire Class", icon: CheckCheck, tone: "bg-emerald-100 text-emerald-600" },
                    { label: "Export Report", helper: "Download Report", icon: FileDown, tone: "bg-orange-100 text-orange-600" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md"
                      >
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", action.tone)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-900">{action.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{action.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_1fr_1.2fr]">
          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="px-6 pb-0 pt-6">
              <SectionHeader title="Faculty Overview" actionLabel="View All Faculty" />
            </CardHeader>
            <CardContent className="px-0 pb-4 pt-2">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">#</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Faculty Name</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Department</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Check In</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Check Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facultyAttendanceRows.map((faculty, index) => (
                      <TableRow key={faculty.name} className="border-slate-100 hover:bg-slate-50/70">
                        <TableCell className="px-6 py-4 text-sm text-slate-600">{index + 1}</TableCell>
                        <TableCell className="px-6 py-4 text-sm font-medium text-slate-900">{faculty.name}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-600">{faculty.department}</TableCell>
                        <TableCell className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                              faculty.status === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                            )}
                          >
                            <span className={cn("h-2 w-2 rounded-full", faculty.status === "Present" ? "bg-emerald-500" : "bg-amber-500")} />
                            {faculty.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{faculty.checkIn}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{faculty.checkOut}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="px-6 pb-4 pt-6">
              <SectionHeader title="Faculty Attendance Trend" />
            </CardHeader>
            <CardContent className="h-[340px] px-4 pb-6 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={facultyTrend} margin={{ top: 12, right: 16, left: -8, bottom: 4 }}>
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
                  <Line type="monotone" dataKey="sharma" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#4f46e5" }} />
                  <Line type="monotone" dataKey="ahmed" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#2563eb" }} />
                  <Line type="monotone" dataKey="neha" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#f97316" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
            <CardHeader className="px-6 pb-4 pt-6">
              <SectionHeader title="Leave Requests" actionLabel="View All" />
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6 pt-0">
              {leaveRequests.map((request) => (
                <div key={request.name} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {request.initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{request.name}</p>
                      <p className="text-sm text-slate-500">{request.reason}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm text-slate-600">
                    <div>{request.from}</div>
                    <div className="text-xs text-slate-400">to</div>
                    <div>{request.to}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-emerald-300 px-4 text-emerald-600 hover:bg-emerald-50">
                      Approve
                    </Button>
                    <Button variant="outline" className="rounded-xl border-rose-300 px-4 text-rose-600 hover:bg-rose-50">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 shadow-sm backdrop-blur">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info className="h-4 w-4 text-amber-500" />
              <span>Tip: You can edit today&apos;s attendance until 11:59 PM.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FacultyAttendanceView({ title, subtitle, actionLabel, secondaryActionLabel, tertiaryActionLabel }: AttendanceDashboardProps) {
  const totalFaculty = useAppStore((state) => state.faculty.length);
  const totalStudents = useAppStore((state) => state.students.length);
  const students = useAppStore((state) => state.students);
  const addNotification = useAppStore((state) => state.addNotification);
  const [calendarDate, setCalendarDate] = useState(() => new Date("2026-05-30T12:00:00+05:30"));
  const [sendingAlertFor, setSendingAlertFor] = useState<string | null>(null);

  const dispatchAlert = async (rollNo: string) => {
    const student = students.find((candidate) => candidate.id === rollNo);

    if (!student) {
      throw new Error("Could not locate the selected student record.");
    }

    await sendAttendanceAlert({
      id: student.id,
      name: student.name,
      batch: student.batch,
      attendancePct: student.attendancePct,
      course: student.course,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      fallbackEmail: student.email,
      fallbackPhone: student.phone,
    });
  };

  const handleNotifyParent = async (rollNo: string) => {
    try {
      setSendingAlertFor(rollNo);
      await dispatchAlert(rollNo);
      const student = students.find((candidate) => candidate.id === rollNo);
      addNotification(
        "Parent alert sent",
        `${student?.name ?? "The student"}'s attendance update was sent through WhatsApp and email.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send the attendance alert.";
      addNotification("Attendance alert failed", message);
    } finally {
      setSendingAlertFor(null);
    }
  };

  const handleBroadcastAttendanceAlerts = async () => {
    try {
      setSendingAlertFor("broadcast");
      await Promise.all(riskStudents.map((riskStudent) => dispatchAlert(riskStudent.rollNo)));
      addNotification("Attendance alerts dispatched", "Risk student reminders were sent to parents.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "One or more attendance notifications could not be delivered.";
      addNotification("Attendance alert failed", message);
    } finally {
      setSendingAlertFor(null);
    }
  };

  const metrics: SummaryMetric[] = [
    {
      label: "Faculty Attendance Today",
      value: "95%",
      detail: "18 / 19 Present",
      icon: GraduationCap,
      tone: "bg-indigo-100 text-indigo-600",
      progress: 95,
      progressClass: "text-indigo-600",
    },
    {
      label: "Students Present",
      value: "38",
      detail: "In QC-2026 Today",
      icon: Users2,
      tone: "bg-emerald-100 text-emerald-600",
      progress: 90,
      progressClass: "text-emerald-600",
    },
    {
      label: "My Batches",
      value: "2",
      detail: "Assigned for this term",
      icon: ClipboardList,
      tone: "bg-violet-100 text-violet-600",
    },
    {
      label: "Department Coverage",
      value: String(totalFaculty),
      detail: `${totalStudents} Students across campus`,
      icon: Building2,
      tone: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(91,61,245,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,153,51,0.08),_transparent_20%),linear-gradient(180deg,#f8fbff_0%,#ffffff_36%,#f8faff_100%)] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 px-4 py-5 shadow-[0_24px_80px_rgba(91,61,245,0.08)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-white/95 px-4 text-slate-700 shadow-sm hover:bg-white"
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

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ModeTabs mode="faculty" />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white px-4 text-slate-700">
                <CheckCheck className="h-4 w-4" />
                {secondaryActionLabel}
              </Button>
              <Button
                variant="ghost"
                className="h-11 w-fit rounded-full px-3 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                onClick={handleBroadcastAttendanceAlerts}
                disabled={sendingAlertFor === "broadcast"}
              >
                <MessageSquare className="h-4 w-4" />
                {sendingAlertFor === "broadcast" ? "Sending..." : "Send Attendance Note"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <SummaryCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <SectionHeader title="Batch Overview (Faculty Attendance)" actionLabel="View My Batches" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {facultyBatchCards.map((batch) => (
                    <BatchMiniCard key={batch.name} batch={batch} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
              <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
                <CardHeader className="px-6 pb-4 pt-6">
                  <SectionHeader title="Attendance Trend" />
                </CardHeader>
                <CardContent className="h-[330px] px-4 pb-6 pt-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 12, right: 16, left: -6, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#5b3df5"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 0, fill: "#5b3df5" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
                <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-4 pt-6">
                  <SectionHeader title={`Attendance Calendar - QC-2026`} />
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
                  <CalendarGrid date={calendarDate} />
                  <div className="mt-5">
                    <AttendanceLegend />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <SectionHeader title={`Take Attendance - QC-2026`} actionLabel="Bulk Actions" />
              </CardHeader>
              <CardContent className="px-0 pb-4 pt-0">
                <div className="overflow-hidden border-t border-slate-200">
                  <div className="max-h-[430px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-white">
                        <TableRow className="border-slate-200 hover:bg-transparent">
                          <TableHead className="w-12 px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">#</TableHead>
                          <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Student Name</TableHead>
                          <TableHead className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Roll No.</TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Present
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Absent
                          </TableHead>
                          <TableHead className="px-4 py-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Late
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentAttendanceRows.map((student, index) => (
                          <TableRow key={student.rollNo} className="border-slate-100 hover:bg-slate-50/70">
                            <TableCell className="px-4 py-4 font-medium text-slate-500">{index + 1}</TableCell>
                            <TableCell className="px-4 py-4 font-medium text-slate-900">{student.name}</TableCell>
                            <TableCell className="px-4 py-4 text-slate-600">{student.rollNo}</TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <AttendanceChoice status="present" active={student.status === "present"} />
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <AttendanceChoice status="absent" active={student.status === "absent"} />
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <AttendanceChoice status="late" active={student.status === "late"} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_18px_30px_rgba(91,61,245,0.22)]">
                  <ShieldCheck className="h-4 w-4" />
                  {actionLabel}
                </Button>
              </div>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <SectionHeader title="Students At Risk (Below 75%)" actionLabel="View All" />
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
                    <Button
                      variant="outline"
                      className="rounded-xl border-violet-300 px-4 text-violet-600 hover:bg-violet-50"
                      onClick={() => handleNotifyParent(student.rollNo)}
                      disabled={sendingAlertFor === student.rollNo}
                    >
                      {sendingAlertFor === student.rollNo ? "Sending..." : "Notify Parent"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur">
              <CardHeader className="px-6 pb-4 pt-6">
                <SectionHeader title="Quick Actions" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Bulk Upload", helper: "Upload CSV / Excel", icon: Upload, tone: "bg-violet-100 text-violet-600" },
                    { label: "Copy Yesterday", helper: "Copy Attendance", icon: Copy, tone: "bg-blue-100 text-blue-600" },
                    { label: "Mark All Present", helper: "Entire Class", icon: CheckCheck, tone: "bg-emerald-100 text-emerald-600" },
                    { label: "Export Report", helper: "Download Report", icon: FileDown, tone: "bg-orange-100 text-orange-600" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md"
                      >
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", action.tone)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-900">{action.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{action.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 shadow-sm backdrop-blur">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info className="h-4 w-4 text-amber-500" />
              <span>Use the attendance table to lock a session before exporting your report.</span>
            </div>
          </CardContent>
        </Card>
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
