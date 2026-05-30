import type { LucideIcon } from "lucide-react";

export type AttendanceMode = "admin" | "faculty";

export type AttendanceDashboardProps = {
  mode: AttendanceMode;
  title: string;
  subtitle: string;
  actionLabel: string;
  secondaryActionLabel: string;
  tertiaryActionLabel: string;
};

export type AttendanceStatus = "present" | "absent" | "late" | "holiday";

export type CalendarCell = {
  day: number | null;
  isToday: boolean;
  status: AttendanceStatus | null;
};

export type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
  progress?: number;
  progressClass?: string;
};

export type BatchCard = {
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

export type AttendanceRow = {
  rollNo: string;
  name: string;
  status: AttendanceStatus;
  checked: boolean;
};

export type FacultyRow = {
  name: string;
  department: string;
  status: "Present" | "On Leave";
  checkIn: string;
  checkOut: string;
  workingHours: string;
};

export type LeaveRequest = {
  initials: string;
  name: string;
  reason: string;
  from: string;
  to: string;
};

export type AlertTarget = {
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
