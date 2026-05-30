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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { facultyBatchCards, attendanceOverview, facultyAttendanceRows, facultyTrend, leaveRequests, monthlyTrend, riskStudents, studentAttendanceRows } from "./constants";
import {
  AttendanceChoice,
  AttendanceLegend,
  AttendanceTableShell,
  BatchMiniCard,
  CalendarGrid,
  ModeTabs,
  QuickActionTile,
  RiskStudentRow,
  SectionHeader,
  SummaryCard,
} from "./components/attendance-ui";
import type { AttendanceDashboardProps, AttendanceStatus, SummaryMetric } from "./types";
import { formatMonthLabel, formatShortDate, sendAttendanceAlert } from "./utils";


export function FacultyAttendanceView({ title, subtitle, actionLabel, secondaryActionLabel, tertiaryActionLabel }: AttendanceDashboardProps) {
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
    <div className="page-shell min-w-0">
        <section className="page-section rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="h-10 rounded-lg">
                <CalendarDays className="h-4 w-4" />
                {formatShortDate(calendarDate)}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button className="h-10 rounded-lg px-4">
                <Download className="h-4 w-4" />
                {tertiaryActionLabel}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ModeTabs mode="faculty" />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" className="h-9 rounded-lg">
                <CheckCheck className="h-4 w-4" />
                {secondaryActionLabel}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-9 rounded-lg"
                onClick={handleBroadcastAttendanceAlerts}
                disabled={sendingAlertFor === "broadcast"}
              >
                <MessageSquare className="h-4 w-4" />
                {sendingAlertFor === "broadcast" ? "Sending…" : "Send attendance note"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <SummaryCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <Card className="attendance-panel">
          <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
            <SectionHeader title="My batches" actionLabel="View all" />
          </CardHeader>
          <CardContent className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
            {facultyBatchCards.map((batch) => (
              <BatchMiniCard key={batch.name} batch={batch} />
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="attendance-panel lg:col-span-8">
            <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
              <SectionHeader title="Take attendance — QC-2026" actionLabel="Bulk actions" />
            </CardHeader>
            <AttendanceTableShell
              footer={
                <Button className="h-10 w-full rounded-lg">
                  <ShieldCheck className="h-4 w-4" />
                  {actionLabel}
                </Button>
              }
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 px-3 py-3 text-xs text-muted-foreground">#</TableHead>
                    <TableHead className="px-3 py-3 text-xs text-muted-foreground">Student</TableHead>
                    <TableHead className="hidden px-3 py-3 text-xs text-muted-foreground sm:table-cell">Roll no.</TableHead>
                    <TableHead className="px-2 py-3 text-center text-xs text-muted-foreground">In</TableHead>
                    <TableHead className="px-2 py-3 text-center text-xs text-muted-foreground">Out</TableHead>
                    <TableHead className="px-2 py-3 text-center text-xs text-muted-foreground">Late</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAttendanceRows.map((student, index) => (
                    <TableRow key={student.rollNo}>
                      <TableCell className="px-3 py-3 text-sm text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="px-3 py-3 text-sm font-medium">{student.name}</TableCell>
                      <TableCell className="hidden px-3 py-3 text-sm text-muted-foreground sm:table-cell">{student.rollNo}</TableCell>
                      <TableCell className="px-2 py-3 text-center">
                        <AttendanceChoice status="present" active={student.status === "present"} />
                      </TableCell>
                      <TableCell className="px-2 py-3 text-center">
                        <AttendanceChoice status="absent" active={student.status === "absent"} />
                      </TableCell>
                      <TableCell className="px-2 py-3 text-center">
                        <AttendanceChoice status="late" active={student.status === "late"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AttendanceTableShell>
          </Card>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <Card className="attendance-panel">
              <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                <SectionHeader title="Students at risk" actionLabel="View all" />
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
                {riskStudents.map((student) => (
                  <RiskStudentRow
                    key={student.rollNo}
                    name={student.name}
                    rollNo={student.rollNo}
                    pct={student.pct}
                    sending={sendingAlertFor === student.rollNo}
                    onNotify={() => handleNotifyParent(student.rollNo)}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="attendance-panel">
              <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                <SectionHeader title="Quick actions" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
                <QuickActionTile label="Bulk upload" helper="CSV / Excel" icon={Upload} tone="bg-violet-500/15 text-violet-600" />
                <QuickActionTile label="Copy yesterday" helper="Reuse last day" icon={Copy} tone="bg-blue-500/15 text-blue-600" />
                <QuickActionTile label="Mark all present" helper="Entire class" icon={CheckCheck} tone="bg-emerald-500/15 text-emerald-600" />
                <QuickActionTile label="Export report" helper="Download" icon={FileDown} tone="bg-orange-500/15 text-orange-600" />
              </CardContent>
            </Card>
          </div>

          <Card className="attendance-panel lg:col-span-6">
            <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
              <SectionHeader title="Attendance trend" />
            </CardHeader>
            <CardContent className="h-[260px] px-3 pb-4 sm:px-5 sm:pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[60, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="attendance-panel lg:col-span-6">
            <CardHeader className="flex flex-col gap-3 px-4 pb-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pt-5">
              <SectionHeader title="Calendar — QC-2026" />
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="min-w-[7rem] text-center text-sm font-medium">{formatMonthLabel(calendarDate)}</p>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <CalendarGrid date={calendarDate} />
              <div className="mt-4">
                <AttendanceLegend />
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <Info className="h-4 w-4 shrink-0 text-amber-500" />
          Lock the session in the table before exporting your report.
        </p>
    </div>
  );
}