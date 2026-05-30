"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CloudUpload,
  Clock3,
  FileText,
  Loader2,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useAppStore, type AssignmentData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { assignmentStatusStyles as statusStyles } from "@/lib/status-styles";
import { toast } from "@/lib/toast";
import {
  assignmentFilters as filters,
  assignmentStatusIcons as statusIcons,
  computeAssignmentMetrics,
  filterAssignments,
  formatAssignmentDeadline as formatDeadline,
  getAssignmentState,
  type AssignmentFilter,
} from "@/lib/assignments";
import { PageHeader } from "@/components/app/page-header";
import {
  buildAssignmentDeadlineHtml,
  buildAssignmentDeadlineText,
  deliverNotification,
} from "@/lib/notifications";

type AssignmentForm = {
  title: string;
  course: string;
  batch: string;
  deadline: string;
};

const emptyAssignment: AssignmentForm = {
  title: "",
  course: "",
  batch: "",
  deadline: "",
};

export default function FacultyAssignments() {
  const {
    assignments,
    addAssignment,
    deleteAssignment,
    reviewAssignmentSubmission,
    students,
    batches,
    courses,
    addNotification,
  } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<AssignmentFilter>("all");
  const [expandedIds, setExpandedIds] = useState<string[]>(
    assignments.filter((assignment) => assignment.status !== "Pending").map((assignment) => assignment.id),
  );
  const [form, setForm] = useState<AssignmentForm>(emptyAssignment);
  const [marksBySubmission, setMarksBySubmission] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [sendingReminderFor, setSendingReminderFor] = useState<string | null>(null);

  const courseOptions = courses.map((course) => course.title);
  const batchOptions = batches.map((batch) => ({
    value: batch.id,
    label: `${batch.name} - ${batch.facultyName}`,
  }));

  const filteredAssignments = useMemo(
    () => filterAssignments(assignments, activeFilter),
    [assignments, activeFilter],
  );

  const metrics = useMemo(() => computeAssignmentMetrics(assignments), [assignments]);

  const recentActivity = useMemo(() => {
    return [...assignments]
      .sort((left, right) => {
        const order: Record<AssignmentData["status"], number> = {
          Reviewed: 0,
          Submitted: 1,
          Pending: 2,
          Late: 3,
        };
        return order[left.status] - order[right.status];
      })
      .slice(0, 3);
  }, [assignments]);

  const visibleFilters = filters.map((filter) => {
    const count =
      filter.key === "all"
        ? metrics.totalAssignments
        : filter.key === "pending"
          ? metrics.submittedCount
          : filter.key === "reviewed"
            ? metrics.reviewedCount
            : metrics.attentionCount;

    return { ...filter, count };
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const createAssignment = () => {
    if (!form.title.trim() || !form.course.trim()) return;

    addAssignment({
      title: form.title.trim(),
      course: form.course.trim(),
      batch: form.batch || undefined,
      deadline: form.deadline,
    });

    setForm(emptyAssignment);
    addNotification("Assignment created", `${form.title.trim()} was added to ${form.course.trim()}.`);
    toast.success("Assignment created");
  };

  const sendDeadlineReminder = async (assignment: AssignmentData) => {
    const recipients = students.filter(
      (student) =>
        student.course === assignment.course && (!assignment.batch || student.batch === assignment.batch),
    );

    if (recipients.length === 0) {
      throw new Error(`No enrolled students found for ${assignment.course}.`);
    }

    await Promise.all(
      recipients.map((student) =>
        deliverNotification({
          toEmail: student.email,
          toPhone: student.phone,
          subject: `Assignment reminder: ${assignment.title}`,
          html: buildAssignmentDeadlineHtml({
            title: assignment.title,
            course: assignment.course,
            deadline: assignment.deadline,
          }),
          text: buildAssignmentDeadlineText({
            title: assignment.title,
            course: assignment.course,
            deadline: assignment.deadline,
          }),
          whatsappBody: buildAssignmentDeadlineText({
            title: assignment.title,
            course: assignment.course,
            deadline: assignment.deadline,
          }),
        }),
      ),
    );
  };

  const handleSendReminder = async (assignment: AssignmentData) => {
    try {
      setSendingReminderFor(assignment.id);
      await sendDeadlineReminder(assignment);
      addNotification("Assignment reminder sent", `Deadline reminders were sent for ${assignment.title}.`);
    } catch (error) {
      addNotification("Assignment reminder failed", error instanceof Error ? error.message : "Unable to send reminder.");
    } finally {
      setSendingReminderFor(null);
    }
  };

  const handleImport = () => {
    addNotification("Import Assignment", "Bulk import is not wired yet, but the action target is ready.");
    toast.info("Bulk import will connect when the backend is ready");
  };

  const handleAskAI = () => {
    addNotification("AI Assistant", "AI-assisted review can be connected from this panel.");
    toast.info("AI review panel — connect backend when ready");
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Assignments"
        description="Create, evaluate, and review assignments with AI assistance."
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
      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card id="assignment-creator" className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Create assignment</CardTitle>
              <CardDescription>Title, course, batch, and due date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Assignment title"
                  className="h-10 rounded-lg sm:col-span-2 lg:col-span-4"
                />

                <Select
                  value={form.course}
                  onValueChange={(value) => setForm((current) => ({ ...current, course: value }))}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
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

                <Select
                  value={form.batch}
                  onValueChange={(value) => setForm((current) => ({ ...current, batch: value }))}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
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
                  className="h-10 rounded-lg"
                />

                <Button onClick={createAssignment} className="h-10 rounded-lg sm:col-span-2 lg:col-span-1">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            {visibleFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
                <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", activeFilter === filter.key ? "bg-primary-foreground/20" : "bg-muted")}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const state = getAssignmentState(assignment);
              const statusIcon = statusIcons[assignment.status];
              const StatusIcon = statusIcon;
              const isExpanded = expandedIds.includes(assignment.id);
              const statusLabel =
                assignment.status === "Pending"
                  ? "Pending"
                  : assignment.status === "Submitted"
                    ? "Pending Review"
                    : assignment.status === "Reviewed"
                      ? "AI Evaluated"
                      : "Late";
              const displayScore = `${state.score}%`;
              const performanceLabel =
                state.score >= 90 ? "Excellent" : state.score >= 75 ? "Good" : state.score >= 60 ? "Fair" : "Needs work";
              const primaryLabel = state.hasSubmissions
                ? assignment.status === "Reviewed"
                  ? "Review Results"
                  : "AI Evaluate"
                : "Send Reminder";

              return (
                <Card key={assignment.id} className="glass-card overflow-hidden">
                  <CardContent className="space-y-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">{assignment.course}</span>
                            {assignment.batch ? (
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                {assignment.batch}
                              </Badge>
                            ) : null}
                            <Badge className={cn("rounded-full text-xs", statusStyles[assignment.status])}>{statusLabel}</Badge>
                          </div>
                          <h3 className="text-base font-semibold sm:text-lg">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Due {formatDeadline(assignment.deadline)} · {state.totalSubmissions} submission
                            {state.totalSubmissions === 1 ? "" : "s"}
                            {state.hasSubmissions
                              ? ` · ${state.reviewedSubmissions}/${state.totalSubmissions} reviewed`
                              : " · awaiting first submission"}
                          </p>
                          <div className="max-w-md pt-1">
                            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                              <span>Evaluation progress</span>
                              <span>{state.progress}%</span>
                            </div>
                            <Progress value={state.progress} className="h-1.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end lg:w-44">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground">Avg. score</p>
                          <p className="text-2xl font-semibold">{displayScore}</p>
                          <Badge variant="outline" className="mt-1 rounded-full text-xs">
                            {performanceLabel}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:flex-col">
                          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toggleExpanded(assignment.id)}>
                            {isExpanded ? "Hide" : state.hasSubmissions ? "Submissions" : "Details"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => (state.hasSubmissions ? toggleExpanded(assignment.id) : handleSendReminder(assignment))}
                            disabled={sendingReminderFor === assignment.id}
                          >
                            {sendingReminderFor === assignment.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : state.hasSubmissions ? (
                              <Sparkles className="mr-2 h-4 w-4" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            {sendingReminderFor === assignment.id ? "Sending…" : primaryLabel}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              deleteAssignment(assignment.id);
                              toast.success("Assignment removed");
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {state.hasSubmissions && isExpanded && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Submission review</p>
                              <p className="text-sm text-muted-foreground">Evaluate each submission with marks and feedback.</p>
                            </div>
                            <Badge variant="outline" className="rounded-full border-border/70 bg-background/70">
                              {state.totalSubmissions} items
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            {state.submissions.map((submission) => {
                              const currentMarks = marksBySubmission[submission.id]?.marks ?? submission.marks ?? "A+";
                              const currentFeedback =
                                marksBySubmission[submission.id]?.feedback ?? submission.feedback ?? "Great work.";

                              return (
                                <div
                                  key={submission.id}
                                  className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold">{submission.studentName}</p>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        Submitted {submission.submittedAt} - {submission.fileName}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium",
                                        submission.status === "Reviewed"
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : "border-sky-200 bg-sky-50 text-sky-700",
                                      )}
                                    >
                                      {submission.status}
                                    </Badge>
                                  </div>

                                  <div className="mt-4 grid gap-3 lg:grid-cols-[0.7fr_1.3fr_auto]">
                                    <Input
                                      value={currentMarks}
                                      onChange={(event) =>
                                        setMarksBySubmission((current) => ({
                                          ...current,
                                          [submission.id]: { marks: event.target.value, feedback: currentFeedback },
                                        }))
                                      }
                                      placeholder="Marks"
                                      className="h-11 rounded-xl bg-background"
                                    />
                                    <Input
                                      value={currentFeedback}
                                      onChange={(event) =>
                                        setMarksBySubmission((current) => ({
                                          ...current,
                                          [submission.id]: { marks: currentMarks, feedback: event.target.value },
                                        }))
                                      }
                                      placeholder="Feedback"
                                      className="h-11 rounded-xl bg-background"
                                    />
                                    <Button
                                      className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                                      onClick={() =>
                                        reviewAssignmentSubmission(
                                          assignment.id,
                                          submission.id,
                                          currentMarks,
                                          currentFeedback,
                                        )
                                      }
                                    >
                                      <Send className="mr-2 h-4 w-4" />
                                      Give marks
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredAssignments.length === 0 && (
              <Card className="border-border/60 bg-card/80">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-muted-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">No assignments found</p>
                    <p className="text-sm text-muted-foreground">Switch filters or create a new assignment to get started.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-center py-2">
              <Button variant="ghost" className="rounded-full text-primary">
                Load more assignments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: "Total", value: metrics.totalAssignments, icon: BarChart3 },
                { label: "Evaluated", value: metrics.reviewedCount, icon: CheckCircle2 },
                { label: "Pending", value: metrics.submittedCount, icon: Clock3 },
                { label: "Needs review", value: metrics.attentionCount, icon: CircleAlert },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border bg-muted/30 p-3">
                    <Icon className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {metrics.attentionCount === 1 ? "1 assignment is" : `${metrics.attentionCount} assignments are`} waiting for review.
              </p>
              <p>
                Most active: <span className="font-medium text-foreground">{metrics.topCourse}</span>
              </p>
              <p>{metrics.totalSubmissions} submissions in the queue.</p>
              <Button size="sm" className="mt-2 w-full rounded-lg" onClick={handleAskAI}>
                <Sparkles className="mr-2 h-4 w-4" />
                Ask AI assistant
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Recent activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setActiveFilter("all")}>
                All
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.map((assignment) => {
                const Icon =
                  assignment.status === "Reviewed" ? CheckCircle2 : assignment.status === "Submitted" ? FileText : CalendarDays;
                const detail =
                  assignment.status === "Reviewed"
                    ? `Evaluated: ${assignment.title}`
                    : assignment.status === "Submitted"
                      ? `New submission: ${assignment.title}`
                      : `Created: ${assignment.title}`;

                return (
                  <div key={assignment.id} className="flex gap-2 rounded-lg border bg-muted/20 p-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{detail}</p>
                      <p className="text-[11px] text-muted-foreground">{assignment.course}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
