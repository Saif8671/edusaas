"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  Clock3,
  FileText,
  Loader2,
  Megaphone,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAppStore, type AssignmentData, type AssignmentSubmission, type StudentData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app/page-header";
import { assignmentStatusStyles as statusStyles } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { buildAssignmentFollowUpText, deliverWhatsAppNotification } from "@/lib/notifications";
import { assignmentStatusIcons as statusIcons, computeAssignmentMetrics, formatAssignmentDeadline } from "@/lib/assignments";

type AssignmentForm = {
  title: string;
  course: string;
  batch: string;
  deadline: string;
};

type AttentionItem = {
  assignment: AssignmentData;
  student: StudentData;
  reason: string;
};

type PendingReviewItem = {
  assignment: AssignmentData;
  submission: AssignmentSubmission;
};

const emptyAssignment: AssignmentForm = {
  title: "",
  course: "",
  batch: "",
  deadline: "",
};

function formatSubmissionTime(value: string) {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getDeadlineDate(deadline: string) {
  const date = new Date(`${deadline}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSubmissionLate(submission: AssignmentSubmission, deadline: string) {
  const deadlineDate = getDeadlineDate(deadline);
  if (!deadlineDate) return false;

  const submittedAt = new Date(submission.submittedAt.includes("T") ? submission.submittedAt : submission.submittedAt.replace(" ", "T"));
  if (Number.isNaN(submittedAt.getTime())) return false;
  return submittedAt > deadlineDate;
}

export default function FacultyAssignments() {
  const { assignments, addAssignment, deleteAssignment, reviewAssignmentSubmission, students, batches, courses, addNotification } = useAppStore();
  const [form, setForm] = useState<AssignmentForm>(emptyAssignment);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [evaluatingSubmissionId, setEvaluatingSubmissionId] = useState<string | null>(null);
  const [evaluationPreview, setEvaluationPreview] = useState<{
    score: number;
    grade: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    studentName: string;
    assignmentTitle: string;
  } | null>(null);
  const [sendingReminderFor, setSendingReminderFor] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  const courseOptions = courses.map((course) => course.title);
  const batchOptions = batches.map((batch) => ({
    value: batch.id,
    label: `${batch.name} - ${batch.facultyName}`,
  }));

  const metrics = useMemo(() => computeAssignmentMetrics(assignments), [assignments]);

  const visibleAssignments = useMemo(() => {
    const normalized = filterText.trim().toLowerCase();
    if (!normalized) return assignments;

    return assignments.filter((assignment) =>
      `${assignment.title} ${assignment.course} ${assignment.batch ?? ""} ${assignment.status}`.toLowerCase().includes(normalized),
    );
  }, [assignments, filterText]);

  const pendingReviewItems = useMemo<PendingReviewItem[]>(
    () =>
      assignments.flatMap((assignment) =>
        (assignment.submissions ?? [])
          .filter((submission) => submission.status === "Submitted")
          .map((submission) => ({ assignment, submission })),
      ),
    [assignments],
  );

  const aiEvaluatedItems = useMemo<PendingReviewItem[]>(
    () =>
      assignments.flatMap((assignment) =>
        (assignment.submissions ?? [])
          .filter((submission) => submission.status === "Reviewed")
          .map((submission) => ({ assignment, submission })),
      ),
    [assignments],
  );

  const attentionItems = useMemo<AttentionItem[]>(() => {
    const now = new Date();

    return assignments.flatMap((assignment) => {
      const enrolled = students.filter(
        (student) => student.course === assignment.course && (!assignment.batch || student.batch === assignment.batch),
      );
      const submissions = assignment.submissions ?? [];
      const deadlineDate = getDeadlineDate(assignment.deadline);
      const deadlinePassed = deadlineDate ? now > deadlineDate : false;

      if (!deadlinePassed) return [];

      return enrolled
        .map((student) => {
          const submission = submissions.find((item) => item.studentId === student.id);
          if (!submission) {
            return {
              assignment,
              student,
              reason: "Assignment deadline passed with no submission on record.",
            };
          }

          if (isSubmissionLate(submission, assignment.deadline)) {
            return {
              assignment,
              student,
              reason: "The submission arrived after the deadline.",
            };
          }

          return null;
        })
        .filter(Boolean) as AttentionItem[];
    });
  }, [assignments, students]);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId],
  );

  const selectedSubmission = useMemo(() => {
    if (!selectedAssignment) return null;
    return selectedAssignment.submissions?.find((submission) => submission.id === selectedSubmissionId) ?? selectedAssignment.submissions?.[0] ?? null;
  }, [selectedAssignment, selectedSubmissionId]);

  const openAiModal = (assignment: AssignmentData, submission?: AssignmentSubmission) => {
    setSelectedAssignmentId(assignment.id);
    setSelectedSubmissionId(submission?.id ?? assignment.submissions?.[0]?.id ?? null);
    setAiModalOpen(true);
  };

  const createAssignment = () => {
    if (!form.title.trim() || !form.course.trim()) return;

    addAssignment({
      title: form.title.trim(),
      course: form.course.trim(),
      batch: form.batch || undefined,
      deadline: form.deadline,
    });
    addNotification("Assignment created", `${form.title.trim()} was added to ${form.course.trim()}.`);
    toast.success("Assignment created");
    setForm(emptyAssignment);
  };

  const sendFollowUp = async (item: AttentionItem) => {
    try {
      setSendingReminderFor(`${item.assignment.id}-${item.student.id}`);
      await deliverWhatsAppNotification({
        toPhone: item.student.parentPhone ?? item.student.phone ?? "",
        body: buildAssignmentFollowUpText({
          assignmentTitle: item.assignment.title,
          studentName: item.student.name,
          course: item.assignment.course,
          batch: item.assignment.batch,
          dueDate: item.assignment.deadline,
          reason: item.reason,
        }),
      });
      addNotification("Assignment reminder sent", `${item.student.name} was notified about ${item.assignment.title}.`);
      toast.success("Assignment reminder sent");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send the assignment reminder.";
      addNotification("Assignment reminder failed", message);
      toast.error(message);
    } finally {
      setSendingReminderFor(null);
    }
  };

  const runAiEvaluation = async (assignment: AssignmentData, submission: AssignmentSubmission) => {
    try {
      setEvaluatingSubmissionId(submission.id);
      const response = await fetch("/api/assignments/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentTitle: assignment.title,
          course: assignment.course,
          batch: assignment.batch,
          studentName: submission.studentName,
          fileName: submission.fileName,
          notes: submission.notes,
          submittedAt: submission.submittedAt,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        score?: number;
        grade?: string;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to evaluate the submission.");
      }

      const marks = `${data.score ?? 0}/100`;
      reviewAssignmentSubmission(assignment.id, submission.id, {
        marks,
        grade: data.grade,
        feedback: data.feedback ?? "AI review completed.",
        strengths: data.strengths,
        improvements: data.improvements,
        evaluatedAt: new Date().toISOString(),
      });
      setEvaluationPreview({
        score: data.score ?? 0,
        grade: data.grade ?? marks,
        feedback: data.feedback ?? "AI review completed.",
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        studentName: submission.studentName,
        assignmentTitle: assignment.title,
      });
      setAiModalOpen(false);
      addNotification("AI evaluation complete", `${submission.studentName} received ${data.grade ?? marks} for ${assignment.title}.`);
      toast.success("AI evaluation saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to evaluate the submission.";
      addNotification("AI evaluation failed", message);
      toast.error(message);
    } finally {
      setEvaluatingSubmissionId(null);
    }
  };

  const handleImport = () => {
    addNotification("Import ready", "Use the creator to add assignments for now; file import will connect to the backend next.");
    toast.info("Assignment import is ready for the next backend pass");
  };

  const sectionTitleClass = "text-lg font-semibold tracking-tight";

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Assignments"
        description="Create assignments, evaluate student work with AI, and keep late submissions visible."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <CloudUpload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button
              size="sm"
              onClick={() => document.getElementById("assignment-creator")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              New assignment
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All", value: metrics.totalAssignments, detail: "Assignments in circulation", icon: FileText, tone: "text-sky-500" },
          { label: "Pending review", value: pendingReviewItems.length, detail: "Ready for AI evaluation", icon: Clock3, tone: "text-amber-500" },
          { label: "AI evaluated", value: aiEvaluatedItems.length, detail: "Reviewed and graded", icon: CheckCircle2, tone: "text-emerald-500" },
          { label: "Need attention", value: attentionItems.length, detail: "Missing or late submissions", icon: ShieldAlert, tone: "text-rose-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card rounded-[1.6rem]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl tracking-tight">{stat.value}</CardTitle>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/60 ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent className="pb-5">
                <p className="text-sm text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card id="assignment-creator" className="glass-card rounded-[1.8rem]">
        <CardHeader>
          <CardTitle className="text-xl">Create assignment</CardTitle>
          <CardDescription>Title, course, batch, and due date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Assignment title"
              className="h-11 rounded-2xl sm:col-span-2 lg:col-span-4"
            />

            <Select value={form.course} onValueChange={(value) => setForm((current) => ({ ...current, course: value }))}>
              <SelectTrigger className="h-11 w-full rounded-2xl">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={form.batch} onValueChange={(value) => setForm((current) => ({ ...current, batch: value }))}>
              <SelectTrigger className="h-11 w-full rounded-2xl">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                {batchOptions.map((batch) => (
                  <SelectItem key={batch.value} value={batch.value}>
                    {batch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={form.deadline}
              onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
              type="date"
              className="h-11 rounded-2xl"
            />

            <Button onClick={createAssignment} className="h-11 rounded-2xl sm:col-span-2 lg:col-span-1">
              <Sparkles className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border bg-card/70 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Filter assignments</p>
          <p className="text-sm text-muted-foreground">Search the current queue before opening a section.</p>
        </div>
        <div className="flex w-full gap-2 lg:w-auto lg:min-w-[340px]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={filterText} onChange={(event) => setFilterText(event.target.value)} placeholder="Search assignments" className="h-11 rounded-full pl-9" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="glass-card rounded-[1.8rem]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className={sectionTitleClass}>All Assignments</CardTitle>
              <CardDescription>{visibleAssignments.length} assignment{visibleAssignments.length === 1 ? "" : "s"} shown in the active queue.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full">
              Live
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleAssignments.map((assignment) => {
              const Icon = statusIcons[assignment.status];
              const state = assignment.submissions?.length ? assignment.submissions.length : 0;

              return (
                <div key={assignment.id} className="rounded-2xl border bg-background/70 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {assignment.batch ? <Badge variant="outline" className="rounded-full">{assignment.batch}</Badge> : null}
                        <Badge className={cn("rounded-full text-xs", statusStyles[assignment.status])}>
                          {assignment.status === "Submitted" ? "Pending Review" : assignment.status === "Reviewed" ? "AI Evaluated" : assignment.status}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">{state} submission{state === 1 ? "" : "s"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due {formatAssignmentDeadline(assignment.deadline)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {assignment.submissions?.length ? (
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => openAiModal(assignment)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI Evaluate
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteAssignment(assignment.id);
                          addNotification("Assignment deleted", `${assignment.title} was removed.`);
                          toast.success("Assignment deleted");
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {visibleAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No assignments match the current search.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[1.8rem]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className={sectionTitleClass}>Pending Review</CardTitle>
              <CardDescription>Submitted work that needs AI evaluation or final feedback.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full">
              {pendingReviewItems.length} pending
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReviewItems.map(({ assignment, submission }) => (
              <div key={`${assignment.id}-${submission.id}`} className="rounded-2xl border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    Awaiting review
                  </Badge>
                </div>

                <div className="mt-4 rounded-2xl border bg-muted/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{submission.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {formatSubmissionTime(submission.submittedAt)} · {submission.fileName}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" className="rounded-full" onClick={() => openAiModal(assignment, submission)}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Evaluate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSelectedAssignmentId(assignment.id);
                        setSelectedSubmissionId(submission.id);
                        setEvaluationPreview(null);
                        setAiModalOpen(true);
                      }}
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {pendingReviewItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No submissions are waiting for review.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="glass-card rounded-[1.8rem]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className={sectionTitleClass}>AI Evaluates</CardTitle>
              <CardDescription>Assignments already graded by AI with marks and review notes.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full">
              Reviewed
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiEvaluatedItems.map(({ assignment, submission }) => (
              <div key={`${assignment.id}-${submission.id}`} className="rounded-2xl border bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{submission.studentName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.grade ? (
                      <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">{submission.grade}</Badge>
                    ) : null}
                    {submission.marks ? (
                      <Badge variant="outline" className="rounded-full">{submission.marks}</Badge>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{submission.feedback ?? assignment.feedback}</p>
                {submission.strengths?.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Strengths</p>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {submission.strengths.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {submission.improvements?.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Improvements</p>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {submission.improvements.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}

            {aiEvaluatedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No AI-evaluated assignments yet.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[1.8rem]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className={sectionTitleClass}>Need Attention</CardTitle>
              <CardDescription>Students who missed deadlines or have not submitted yet.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full">
              {attentionItems.length} alerts
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionItems.map((item) => (
              <div key={`${item.assignment.id}-${item.student.id}`} className="rounded-2xl border bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.assignment.title} · {item.assignment.course}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {item.assignment.batch ?? "No batch"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Due {formatAssignmentDeadline(item.assignment.deadline)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => void sendFollowUp(item)}
                    disabled={sendingReminderFor === `${item.assignment.id}-${item.student.id}`}
                  >
                    {sendingReminderFor === `${item.assignment.id}-${item.student.id}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Megaphone className="mr-2 h-4 w-4" />
                    )}
                    Send notification
                  </Button>
                </div>
              </div>
            ))}

            {attentionItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No students need follow-up right now.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI evaluation</DialogTitle>
            <DialogDescription>Review a submitted assignment with the backend evaluator and save the marks.</DialogDescription>
          </DialogHeader>

          {selectedAssignment ? (
            <div className="space-y-4">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm font-medium">{selectedAssignment.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAssignment.course} {selectedAssignment.batch ? `· ${selectedAssignment.batch}` : ""}
                </p>
              </div>

              <div className="space-y-3">
                {selectedAssignment.submissions?.map((submission) => {
                  const active = submission.id === selectedSubmission?.id;
                  return (
                    <button
                      key={submission.id}
                      type="button"
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition",
                        active ? "border-primary/30 bg-primary/5 shadow-sm" : "bg-background/70 hover:border-primary/20 hover:bg-muted/30",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.fileName} · {formatSubmissionTime(submission.submittedAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {submission.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>

              {selectedSubmission ? (
                <div className="rounded-2xl border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{selectedSubmission.studentName}</p>
                      <p className="text-sm text-muted-foreground">{selectedSubmission.fileName}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      Ready
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{selectedSubmission.notes ?? "No submission note attached."}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAiModalOpen(false); setEvaluationPreview(null); }}>
              Close
            </Button>
            {selectedAssignment && selectedSubmission && !evaluationPreview ? (
              <Button onClick={() => void runAiEvaluation(selectedAssignment, selectedSubmission)} disabled={evaluatingSubmissionId === selectedSubmission.id}>
                {evaluatingSubmissionId === selectedSubmission.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run AI evaluation
                  </>
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(evaluationPreview)} onOpenChange={(open) => { if (!open) { setEvaluationPreview(null); setAiModalOpen(false); } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI evaluation result</DialogTitle>
            <DialogDescription>
              Review the marks and feedback before closing. Results are saved to the AI Evaluates section.
            </DialogDescription>
          </DialogHeader>

          {evaluationPreview ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-emerald-500/5 p-4">
                <div>
                  <p className="font-semibold">{evaluationPreview.studentName}</p>
                  <p className="text-sm text-muted-foreground">{evaluationPreview.assignmentTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 text-lg px-4 py-1">{evaluationPreview.grade}</Badge>
                  <Badge variant="outline" className="rounded-full">{evaluationPreview.score}/100</Badge>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{evaluationPreview.feedback}</p>
              {evaluationPreview.strengths.length ? (
                <div className="rounded-2xl border p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Strengths</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {evaluationPreview.strengths.map((item) => (
                      <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {evaluationPreview.improvements.length ? (
                <div className="rounded-2xl border p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Areas to improve</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {evaluationPreview.improvements.map((item) => (
                      <li key={item} className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button onClick={() => { setEvaluationPreview(null); setAiModalOpen(false); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
