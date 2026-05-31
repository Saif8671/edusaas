function normalizeCourse(value) {
  return (value || "").trim().toLowerCase();
}
function normalizeBatch(value) {
  return (value || "").trim().toLowerCase();
}
function resolveBatchRef(value, batches) {
  const normalized = normalizeBatch(value);
  const match = batches.find(
    (batch) => normalizeBatch(batch.id) === normalized || normalizeBatch(batch.name) === normalized,
  );
  return match ? { id: normalizeBatch(match.id), name: normalizeBatch(match.name) } : { id: normalized, name: normalized };
}

function matchesStudentEnrollment(assignment, profile, batches = []) {
  if (normalizeCourse(assignment.course) !== normalizeCourse(profile.course)) {
    return false;
  }
  if (!assignment.batch || !assignment.batch.trim()) {
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

const assignment = { id: "ASM-123", title: "Test", course: "Advanced Quantum Computing", batch: "QC-2026", deadline: "2026-06-03", status: "Pending" };
const profile = { course: "Advanced Quantum Computing", batch: "QC-2026" };
const batches = [ { id: "QC-2026", name: "Quantum-2026" } ];

console.log(matchesStudentEnrollment(assignment, profile, batches));
