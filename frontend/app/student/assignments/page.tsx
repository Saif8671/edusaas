"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, FileCheck } from "lucide-react";

export default function StudentAssignments() {
  const { assignments, submitAssignment } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Homework Assignments</h2>
        <p className="text-muted-foreground">Submit deliverables and view grading reviews from teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((asm) => (
          <Card key={asm.id} className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader>
              <div className="flex justify-between">
                <span className="text-xs text-primary font-semibold">{asm.course}</span>
                <Badge variant={asm.status === "Reviewed" ? "default" : "secondary"}>
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
                <Button size="sm" onClick={() => submitAssignment(asm.id)} className="w-full rounded-xl gap-1">
                  <Send className="h-3.5 w-3.5" /> Submit Homework PDF
                </Button>
              ) : (
                <p className="text-muted-foreground italic">Submitted. Awaiting professor appraisal...</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
