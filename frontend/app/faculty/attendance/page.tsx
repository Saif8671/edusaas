import { AttendanceDashboard } from "@/components/attendance-dashboard";

export default function FacultyAttendancePage() {
  return (
    <AttendanceDashboard
      mode="faculty"
      title="Student Attendance"
      subtitle="Manage and track attendance for your batches"
      actionLabel="Save Attendance"
      secondaryActionLabel="Mark All Present"
      tertiaryActionLabel="Export Report"
    />
  );
}
