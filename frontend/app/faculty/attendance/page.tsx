import { AttendanceDashboard } from "@/components/attendance-dashboard";

export default function FacultyAttendancePage() {
  return (
    <AttendanceDashboard
      mode="faculty"
      title="Attendance Management"
      subtitle="Mark daily attendance, watch the trend line, and alert guardians early when participation drops."
      actionLabel="Start Session"
      secondaryActionLabel="Mark All Present"
      tertiaryActionLabel="Export CSV"
    />
  );
}
