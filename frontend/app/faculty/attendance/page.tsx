import { AttendanceDashboard } from "@/components/attendance-dashboard";

export default function FacultyAttendancePage() {
  return (
    <AttendanceDashboard
      mode="faculty"
      title="Attendance Management"
      subtitle="Track batch attendance, mark presence quickly, and flag students at risk before the day ends."
      actionLabel="Start Session"
      secondaryActionLabel="Mark All Present"
      tertiaryActionLabel="Export CSV"
    />
  );
}
