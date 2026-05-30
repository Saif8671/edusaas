import { AttendanceDashboard } from "@/components/attendance-dashboard";

export default function AdminAttendancePage() {
  return (
    <AttendanceDashboard
      mode="admin"
      title="Attendance Management"
      subtitle="Manage and track student attendance efficiently from a single control surface."
      actionLabel="Take Attendance"
      secondaryActionLabel="Bulk Upload"
      tertiaryActionLabel="Export Report"
    />
  );
}
