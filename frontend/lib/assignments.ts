import type { AssignmentData } from "@/lib/store";
import { CheckCircle2, CircleAlert, Sparkles } from "lucide-react";

export type EnrollmentProfile = { course: string; batch: string };
export type BatchLookup = { id: string; name: string };

function normalizeCourse(value: string) {
  return value.trim().toLowerCase();
}

function normalizeBatch(value: string) {
  return value.trim().toLowerCase();
}

function resolveBatchRef(value: string, batches: BatchLookup[]) {
  const normalized = normalizeBatch(value);
  const match = batches.find(
    (batch) => normalizeBatch(batch.id) === normalized || normalizeBatch(batch.name) === normalized,
  );
  return match ? { id: normalizeBatch(match.id), name: normalizeBatch(match.name) } : { id: normalized, name: normalized };
}

export function matchesStudentEnrollment(
  assignment: AssignmentData,
  profile: EnrollmentProfile,
  batches: BatchLookup[] = [],
) {
  if (normalizeCourse(assignment.course) !== normalizeCourse(profile.course)) {
    return false;
  }

  if (!assignment.batch?.trim()) {
    return true;
  }

  const assignmentRef = resolveBatchRef(assignment.batch, batches);
  const studentRef = resolveBatchRef(profile.batch, batches);

  return (
    assignmentRef.id === studentRef.id ||
    assignmentRef.id === studentRef.name ||
    assignmentRef.name === studentRef.id ||
    assignmentRef.name === studentRef.name
  );
}

export function filterStudentsForAssignment<T extends EnrollmentProfile>(
  students: T[],
  assignment: Pick<AssignmentData, "course" | "batch">,
  batches: BatchLookup[] = [],
) {
  return students.filter((student) => matchesStudentEnrollment(
    { ...assignment, id: "", title: "", deadline: "", status: "Pending" },
    student,
    batches,
  ));
}

export type AssignmentFilter = "all" | "pending" | "submitted" | "reviewed" | "needs-attention";

export const assignmentFilters: Array<{ key: AssignmentFilter; label: string }> = [
  { key: "all", label: "All Assignments" },
  { key: "pending", label: "Pending Review" },
  { key: "reviewed", label: "AI Evaluated" },
  { key: "needs-attention", label: "Needs Attention" },
];

export const assignmentStatusIcons: Record<AssignmentData["status"], typeof CheckCircle2> = {
  Pending: CircleAlert,
  Submitted: Sparkles,
  Reviewed: CheckCircle2,
  Late: CircleAlert,
};

const gradeScores: Record<string, number> = {
  "A+": 98,
  A: 95,
  "A-": 91,
  "B+": 88,
  B: 84,
  "B-": 80,
  "C+": 76,
  C: 72,
  "C-": 68,
  D: 62,
  F: 48,
};

export function formatAssignmentDeadline(deadline: string) {
  if (!deadline) return "No deadline set";
  const date = new Date(`${deadline}T23:59:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function scoreFromGrade(grade?: string) {
  if (!grade) return 0;
  const normalized = grade.trim().toUpperCase();
  if (gradeScores[normalized] != null) return gradeScores[normalized];

  const numeric = Number.parseFloat(normalized);
  if (!Number.isNaN(numeric)) return Math.max(0, Math.min(100, numeric));

  return 0;
}

export function getAssignmentState(assignment: AssignmentData) {
  const submissions = assignment.submissions ?? [];
  const reviewedSubmissions = submissions.filter((item) => item.status === "Reviewed").length;
  const totalSubmissions = submissions.length;
  const progress =
    totalSubmissions === 0
      ? assignment.status === "Reviewed"
        ? 100
        : 0
      : Math.round((reviewedSubmissions / totalSubmissions) * 100);

  return {
    submissions,
    reviewedSubmissions,
    totalSubmissions,
    progress,
    score: assignment.grade ? scoreFromGrade(assignment.grade) : progress,
    hasSubmissions: totalSubmissions > 0,
  };
}

export function filterAssignments(assignments: AssignmentData[], activeFilter: AssignmentFilter) {
  return assignments.filter((assignment) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return assignment.status === "Pending" || assignment.status === "Late";
    if (activeFilter === "reviewed") return assignment.status === "Reviewed";
    return assignment.status === "Pending" || assignment.status === "Late";
  });
}

export function computeAssignmentMetrics(assignments: AssignmentData[]) {
  const reviewedCount = assignments.filter((assignment) => assignment.status === "Reviewed").length;
  const submittedCount = assignments.filter((assignment) => assignment.status === "Submitted").length;
  const attentionCount = assignments.filter(
    (assignment) => assignment.status === "Pending" || assignment.status === "Late",
  ).length;
  const totalSubmissions = assignments.reduce((count, assignment) => count + (assignment.submissions?.length ?? 0), 0);
  const reviewedAssignments = assignments.filter((assignment) => assignment.status === "Reviewed");
  const averageScore = reviewedAssignments.length
    ? Math.round(
        reviewedAssignments.reduce((sum, assignment) => sum + scoreFromGrade(assignment.grade), 0) /
          reviewedAssignments.length,
      )
    : 0;

  const courseSummary = assignments.reduce<Record<string, number>>((accumulator, assignment) => {
    accumulator[assignment.course] = (accumulator[assignment.course] ?? 0) + 1;
    return accumulator;
  }, {});
  const topCourse = Object.entries(courseSummary).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "No active course";

  return {
    totalAssignments: assignments.length,
    reviewedCount,
    submittedCount,
    attentionCount,
    totalSubmissions,
    averageScore,
    topCourse,
  };
}
