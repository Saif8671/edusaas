"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, PencilLine, PlusCircle, Send } from "lucide-react";
import { useAppStore, AssignmentData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildAssignmentDeadlineHtml,
  buildAssignmentDeadlineText,
  deliverNotification,
} from "@/lib/notifications";

const emptyAssignment = {
  title: "",
  course: "",
  deadline: "",
};

export default function FacultyAssignments() {
  const { assignments, addAssignment, deleteAssignment, reviewAssignmentSubmission, students, addNotification } =
    useAppStore();
  const [showSubmittedOnly, setShowSubmittedOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>(assignments.filter((assignment) => assignment.status !== "Pending").map((assignment) => assignment.id));
  const [form, setForm] = useState(emptyAssignment);
  const [marksBySubmission, setMarksBySubmission] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [sendingReminderFor, setSendingReminderFor] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const createAssignment = () => {
    if (!form.title.trim() || !form.course.trim()) return;
    addAssignment({
      title: form.title,
      course: form.course,
      deadline: form.deadline,
    });
    setForm(emptyAssignment);
  };

  const visibleAssignments = showSubmittedOnly
    ? assignments.filter((assignment) => (assignment.submissions ?? []).length > 0 || assignment.status !== "Pending")
    : assignments;

  const sendDeadlineReminder = async (assignment: AssignmentData) => {
    const recipients = students.filter((student) => student.course === assignment.course);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assignment Appraisals</h2>
        <p className="text-muted-foreground">Create assignments, inspect submitted work, and review with marks and feedback.</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Create assignment</CardTitle>
          <CardDescription>Use this panel to publish a new task for students.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.1fr_1.1fr_0.8fr_auto]">
          <Input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Assignment title"
          />
          <Input
            value={form.course}
            onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
            placeholder="Course"
          />
          <Input
            value={form.deadline}
            onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
            placeholder="Deadline"
            type="date"
          />
          <Button onClick={createAssignment} className="rounded-xl gap-2">
            <PlusCircle className="h-4 w-4" />
            Create
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={showSubmittedOnly ? "outline" : "default"}
            onClick={() => setShowSubmittedOnly(false)}
            className="rounded-xl"
          >
            All assignments
          </Button>
          <Button
            variant={showSubmittedOnly ? "default" : "outline"}
            onClick={() => setShowSubmittedOnly(true)}
            className="rounded-xl"
          >
            View submitted
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Students who submitted are listed inside each assignment card.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleAssignments.map((assignment) => {
          const submissions = assignment.submissions ?? [];
          const hasSubmissions = submissions.length > 0;
          const isExpanded = expandedIds.includes(assignment.id);

          return (
            <Card key={assignment.id} className="glass-card border bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-primary">{assignment.course}</span>
                    <CardTitle className="mt-2 text-base font-bold">{assignment.title}</CardTitle>
                  </div>
                  <Badge variant={assignment.status === "Reviewed" ? "default" : "secondary"}>{assignment.status}</Badge>
                </div>
                <CardDescription>Deadline: {assignment.deadline}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                {assignment.status === "Reviewed" && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-green-600">
                    <p className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      Evaluated Result: {assignment.grade}
                    </p>
                    <p className="mt-1 text-muted-foreground">Feedback: "{assignment.feedback}"</p>
                  </div>
                )}

                {hasSubmissions ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(assignment.id)}
                      className="flex w-full items-center justify-between rounded-xl border bg-background/70 px-3 py-2 text-left"
                    >
                      <span className="font-semibold">Submitted by {submissions.length} student(s)</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-3">
                        {submissions.map((submission) => {
                          const currentMarks = marksBySubmission[submission.id]?.marks ?? submission.marks ?? "A+";
                          const currentFeedback =
                            marksBySubmission[submission.id]?.feedback ?? submission.feedback ?? "Great work.";

                          return (
                            <div key={submission.id} className="rounded-xl border bg-background/70 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{submission.studentName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Submitted {submission.submittedAt} · {submission.fileName}
                                  </p>
                                </div>
                                <Badge variant={submission.status === "Reviewed" ? "default" : "secondary"}>{submission.status}</Badge>
                              </div>

                              <div className="mt-3 grid gap-2 md:grid-cols-[0.7fr_1.3fr_auto]">
                                <Input
                                  value={currentMarks}
                                  onChange={(event) =>
                                    setMarksBySubmission((current) => ({
                                      ...current,
                                      [submission.id]: { marks: event.target.value, feedback: currentFeedback },
                                    }))
                                  }
                                  placeholder="Marks"
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
                                />
                                <Button
                                  className="rounded-xl gap-2"
                                  onClick={() =>
                                    reviewAssignmentSubmission(
                                      assignment.id,
                                      submission.id,
                                      currentMarks,
                                      currentFeedback,
                                    )
                                  }
                                >
                                  <Send className="h-4 w-4" />
                                  Give marks
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-600">
                    <p className="flex items-center gap-1 font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Waiting for student submissions
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl gap-1"
                    onClick={() => handleSendReminder(assignment)}
                    disabled={sendingReminderFor === assignment.id}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sendingReminderFor === assignment.id ? "Sending..." : "Send reminder"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1" onClick={() => toggleExpanded(assignment.id)}>
                    <PencilLine className="h-3.5 w-3.5" />
                    {isExpanded ? "Hide submitted" : "View submitted"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteAssignment(assignment.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
