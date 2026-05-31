import { CircleCheck, CircleDashed, CircleX, Clock3, type LucideIcon } from "lucide-react";
import type { AttendanceRow, AttendanceStatus, BatchCard, FacultyRow, LeaveRequest } from "./types";

export const attendanceStatusMeta: Record<
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

export const adminBatchCards: BatchCard[] = [
  {
    name: "QC-2026",
    students: 42,
    attendance: 92,
    present: 38,
    absent: 2,
    late: 2,
    tone: "border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/12",
    iconTone: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
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
    tone: "border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/12",
    iconTone: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
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
    tone: "border-violet-500/20 bg-violet-500/10 dark:bg-violet-500/12",
    iconTone: "bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
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
    tone: "border-orange-500/20 bg-orange-500/10 dark:bg-orange-500/12",
    iconTone: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    line: "#f97316",
    trend: [69, 65, 68, 66, 71, 70, 75, 74, 79, 81, 80, 95],
  },
];

export const facultyBatchCards: BatchCard[] = [
  {
    name: "QC-2026",
    students: 42,
    attendance: 95,
    present: 18,
    absent: 1,
    late: 0,
    tone: "border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/12",
    iconTone: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
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
    tone: "border-cyan-500/20 bg-cyan-500/10 dark:bg-cyan-500/12",
    iconTone: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    line: "#0891b2",
    trend: [76, 78, 77, 80, 79, 83, 81, 84, 85, 87, 88, 89],
  },
];

export const studentAttendanceRows: AttendanceRow[] = [
  { rollNo: "STU-001", name: "Saif Rahman", status: "present", checked: true },
  { rollNo: "STU-002", name: "Ahmed Khan", status: "absent", checked: false },
  { rollNo: "STU-003", name: "Sarah Ali", status: "late", checked: true },
  { rollNo: "STU-004", name: "John Doe", status: "present", checked: true },
  { rollNo: "STU-005", name: "Fatima Noor", status: "present", checked: true },
  { rollNo: "STU-006", name: "Ali Hassan", status: "absent", checked: false },
];

export const facultyAttendanceRows: FacultyRow[] = [
  { name: "Dr. Sharma", department: "Computer Science", status: "Present", checkIn: "09:03 AM", checkOut: "05:58 PM", workingHours: "8h 55m" },
  { name: "Prof. Ahmed", department: "Mathematics", status: "Present", checkIn: "09:10 AM", checkOut: "06:02 PM", workingHours: "8h 52m" },
  { name: "Dr. Neha", department: "Data Science", status: "On Leave", checkIn: "-", checkOut: "-", workingHours: "-" },
  { name: "Prof. John", department: "AI & ML", status: "Present", checkIn: "09:05 AM", checkOut: "05:45 PM", workingHours: "8h 40m" },
  { name: "Dr. Priya", department: "Physics", status: "Present", checkIn: "09:12 AM", checkOut: "09:01 PM", workingHours: "8h 49m" },
];

export const riskStudents = [
  { name: "Sarah Ali", rollNo: "STU-003", pct: 68, tone: "bg-rose-500" },
  { name: "John Doe", rollNo: "STU-004", pct: 72, tone: "bg-orange-500" },
];

export const leaveRequests: LeaveRequest[] = [
  { initials: "DN", name: "Dr. Neha Sharma", reason: "Sick Leave", from: "12 Jun 2026", to: "14 Jun 2026" },
  { initials: "PA", name: "Prof. Ahmed", reason: "Personal Leave", from: "18 Jun 2026", to: "19 Jun 2026" },
];

export const attendanceOverview = [
  { name: "Present", value: 346, pct: 82.37, color: "#16a34a" },
  { name: "Absent", value: 27, pct: 6.35, color: "#ef4444" },
  { name: "Late", value: 20, pct: 4.76, color: "#f59e0b" },
  { name: "Holiday", value: 27, pct: 6.52, color: "#cbd5e1" },
];

export const monthlyTrend = [
  { label: "Jan", value: 78 },
  { label: "Feb", value: 82 },
  { label: "Mar", value: 84 },
  { label: "Apr", value: 87 },
  { label: "May", value: 91 },
];

export const facultyTrend = [
  { label: "Jan", sharma: 99, ahmed: 86, neha: 64 },
  { label: "Feb", sharma: 98, ahmed: 87, neha: 62 },
  { label: "Mar", sharma: 100, ahmed: 85, neha: 63 },
  { label: "Apr", sharma: 97, ahmed: 88, neha: 57 },
  { label: "May", sharma: 100, ahmed: 80, neha: 49 },
];
