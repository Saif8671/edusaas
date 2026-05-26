"use client";

import { useMemo, useState } from "react";
import { Users, CalendarDays, GraduationCap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function FacultyBatches() {
  const { batches, students } = useAppStore();
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id ?? "");

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === selectedBatchId) ?? batches[0],
    [batches, selectedBatchId],
  );

  const enrolledStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.batch === selectedBatch?.id ||
          student.course === selectedBatch?.name ||
          student.course === selectedBatch?.facultyName,
      ),
    [selectedBatch, students],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Active Batches</h2>
        <p className="text-muted-foreground">Click a batch to inspect enrolled student names, attendance, and performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          {batches.map((batch) => {
            const isSelected = batch.id === selectedBatchId;
            return (
              <button
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={`text-left transition-all ${isSelected ? "scale-[1.01]" : ""}`}
              >
                <Card className={`glass-card border bg-card/40 backdrop-blur-md ${isSelected ? "border-primary/40 shadow-md" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-lg">{batch.name}</CardTitle>
                      <Badge variant="outline">{batch.status}</Badge>
                    </div>
                    <CardDescription>Schedule slot: {batch.schedule}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        Faculty
                      </span>
                      <span className="font-semibold">{batch.facultyName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Students
                      </span>
                      <span className="font-semibold">
                        {batch.studentCount} / {batch.capacity}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${(batch.studentCount / batch.capacity) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Batch ID
                      </span>
                      <span>{batch.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>{selectedBatch?.name ?? "Select a batch"}</CardTitle>
            <CardDescription>
              {selectedBatch
                ? "Student roster with attendance and performance indicators."
                : "Choose a batch on the left to view learner details."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((student) => (
                <div key={student.id} className="rounded-[1.35rem] border bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.course}</p>
                    </div>
                    <Badge variant="outline">{student.status}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-semibold">{student.attendancePct}%</span>
                      </div>
                      <Progress value={student.attendancePct} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-semibold">{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Parent: {student.parentName}</span>
                    <span>Phone: {student.phone}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                No students are linked to this batch yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
