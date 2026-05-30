import { AttendanceDashboard } from "@/components/attendance-dashboard";

export default function AdminAttendancePage() {
  return (
    <AttendanceDashboard
      mode="admin"
      title="Attendance Management"
      subtitle="Manage student and faculty attendance efficiently from a single control surface."
      actionLabel="Take Attendance"
      secondaryActionLabel="Bulk Upload"
      tertiaryActionLabel="Export Report"
    />
  );
}
