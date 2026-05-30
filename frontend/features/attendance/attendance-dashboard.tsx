"use client";

import type { AttendanceDashboardProps } from "./types";
import { AdminAttendanceView } from "./admin-attendance-view";
import { FacultyAttendanceView } from "./faculty-attendance-view";

export function AttendanceDashboard(props: AttendanceDashboardProps) {
  if (props.mode === "faculty") {
    return <FacultyAttendanceView {...props} />;
  }

  return <AdminAttendanceView {...props} />;
}
