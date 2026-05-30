"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, FileCheck, BookOpenCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { assignmentStatusStyles } from "@/lib/status-styles";
import { toast } from "@/lib/toast";

export default function StudentAssignments() {
  const { assignments, submitAssignment } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader
        hideTitle
        title="Assignments"
        description="Submit deliverables and view grading feedback from faculty."
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No assignments yet"
          description="When faculty publish work for your course, it will appear here."
        />
      ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {assignments.map((asm) => (
          <Card key={asm.id} className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader>
              <div className="flex justify-between">
                <span className="text-xs text-primary font-semibold">{asm.course}</span>
                <Badge variant="outline" className={assignmentStatusStyles[asm.status]}>
                  {asm.status}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-2">{asm.title}</CardTitle>
              <CardDescription>Due Date: {asm.deadline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {asm.status === "Reviewed" ? (
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl space-y-1">
                  <p className="font-bold flex items-center gap-1"><FileCheck className="h-4 w-4" /> Score: {asm.grade}</p>
                  <p className="text-muted-foreground">Feedback: "{asm.feedback}"</p>
                </div>
              ) : asm.status === "Pending" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    submitAssignment(asm.id);
                    toast.success("Assignment submitted");
                  }}
                  className="w-full gap-1 rounded-xl"
                >
                  <Send className="h-3.5 w-3.5" /> Submit homework
                </Button>
              ) : (
                <p className="text-muted-foreground italic">Submitted. Awaiting professor appraisal...</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
