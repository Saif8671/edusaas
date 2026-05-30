"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { BookOpenCheck, FileCheck, Paperclip, Send, Sparkles } from "lucide-react";
import { useAppStore, type AssignmentData } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { assignmentStatusStyles } from "@/lib/status-styles";
import { toast } from "@/lib/toast";
import { formatAssignmentDeadline } from "@/lib/assignments";

type SubmissionDraft = {
  notes: string;
  file: File | null;
};

function getSubmissionByStudent(assignment: AssignmentData, studentId: string) {
  return assignment.submissions?.find((submission) => submission.studentId === studentId) ?? null;
}

export default function StudentAssignments() {
  const { currentUser, students, assignments, submitAssignment } = useAppStore();
  const profile = useMemo(() => students.find((student) => student.id === currentUser?.id) ?? students[0], [currentUser?.id, students]);
  const [drafts, setDrafts] = useState<Record<string, SubmissionDraft>>({});

  const previousSubmissions = useMemo(() => {
    if (!profile) return [];
    return assignments.filter((assignment) => getSubmissionByStudent(assignment, profile.id));
  }, [assignments, profile]);

  const currentAssignments = useMemo(() => {
    if (!profile) return assignments;
    return assignments.filter((assignment) => !getSubmissionByStudent(assignment, profile.id) && assignment.status !== "Reviewed");
  }, [assignments, profile]);

  const updateDraft = (assignmentId: string, next: Partial<SubmissionDraft>) => {
    setDrafts((current) => ({
      ...current,
      [assignmentId]: {
        notes: current[assignmentId]?.notes ?? "",
        file: current[assignmentId]?.file ?? null,
        ...next,
      },
    }));
  };

  const handleFileChange = (assignmentId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    updateDraft(assignmentId, { file });
  };

  const handleSubmit = (assignment: AssignmentData) => {
    const draft = drafts[assignment.id];

    if (!draft?.file) {
      toast.error("Please upload a file before submitting.");
      return;
    }

    submitAssignment(assignment.id, {
      fileName: draft.file.name,
      fileSize: draft.file.size,
      fileType: draft.file.type || "application/pdf",
      notes: draft.notes.trim() || `Submitted from the student assignment portal for ${assignment.title}.`,
    });

    setDrafts((current) => ({
      ...current,
      [assignment.id]: { notes: "", file: null },
    }));

    toast.success("Assignment submitted");
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader hideTitle title="Assignments" description="Upload your work, submit current assignments, and review what you already turned in." />

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No assignments yet"
          description="When faculty publish work for your course, it will appear here."
        />
      ) : (
        <div className="space-y-6">
          <Card className="glass-card rounded-[1.8rem] border bg-card/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Previous Submissions</CardTitle>
                <CardDescription>Work you already submitted is listed here with the latest review status.</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                {previousSubmissions.length} item{previousSubmissions.length === 1 ? "" : "s"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {previousSubmissions.map((assignment) => {
                const submission = getSubmissionByStudent(assignment, profile?.id ?? "");
                if (!submission) return null;

                return (
                  <div key={assignment.id} className="rounded-2xl border bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-primary">{assignment.course}</p>
                        <h3 className="mt-1 text-base font-semibold">{assignment.title}</h3>
                      </div>
                      <Badge variant="outline" className={assignmentStatusStyles[assignment.status]}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        {submission.fileName}
                      </p>
                      <p>Submitted: {submission.submittedAt}</p>
                      <p>Deadline: {formatAssignmentDeadline(assignment.deadline)}</p>
                      {assignment.grade ? <p className="font-medium text-foreground">Marks: {assignment.grade}</p> : null}
                      {assignment.feedback ? <p>{assignment.feedback}</p> : null}
                    </div>
                    {submission.notes ? <p className="mt-3 rounded-2xl border bg-muted/30 p-3 text-sm text-muted-foreground">{submission.notes}</p> : null}
                  </div>
                );
              })}

              {previousSubmissions.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground md:col-span-2">
                  Previous submissions will appear here after you submit an assignment.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[1.8rem] border bg-card/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Current Assignments</CardTitle>
                <CardDescription>Upload your work and submit it directly from this page.</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                {currentAssignments.length} open
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              {currentAssignments.map((assignment) => {
                const draft = drafts[assignment.id] ?? { notes: "", file: null };
                const existingSubmission = profile ? getSubmissionByStudent(assignment, profile.id) : null;
                const Icon = assignment.status === "Late" ? Sparkles : FileCheck;

                return (
                  <div key={assignment.id} className="rounded-2xl border bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-primary">{assignment.course}</p>
                        <h3 className="mt-1 text-base font-semibold">{assignment.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Due {formatAssignmentDeadline(assignment.deadline)}</p>
                      </div>
                      <Badge variant="outline" className={assignmentStatusStyles[assignment.status]}>
                        {assignment.status}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-2xl border bg-muted/30 p-3 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {existingSubmission ? "You already submitted this assignment. You can resubmit a newer file if needed." : "Upload a file, add a short note, and submit before the deadline."}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload assignment</label>
                        <Input
                          type="file"
                          className="rounded-2xl"
                          onChange={(event) => handleFileChange(assignment.id, event)}
                        />
                        {draft.file ? (
                          <p className="text-xs text-muted-foreground">
                            Selected: {draft.file.name} · {Math.round(draft.file.size / 1024)} KB
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={draft.notes}
                          onChange={(event) => updateDraft(assignment.id, { notes: event.target.value })}
                          placeholder="Add a short note for the faculty reviewer..."
                          className="min-h-24 rounded-2xl"
                        />
                      </div>

                      <Button className="w-full rounded-2xl" onClick={() => handleSubmit(assignment)}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </Button>
                    </div>
                  </div>
                );
              })}

              {currentAssignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground xl:col-span-2">
                  No current assignments are pending for you right now.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
