"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, ShieldCheck, WandSparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdminCertificateStudio } from "@/components/admin-certificate-studio";
import { cn } from "@/lib/utils";

export default function AdminCertificatesPage() {
  const { students } = useAppStore();
  const eligibleStudents = useMemo(
    () => students.filter((student) => student.progress >= 80).sort((a, b) => b.progress - a.progress),
    [students],
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(eligibleStudents[0]?.id ?? null);

  const selectedStudent = useMemo(
    () => eligibleStudents.find((student) => student.id === selectedStudentId) ?? eligibleStudents[0] ?? null,
    [eligibleStudents, selectedStudentId],
  );

  useEffect(() => {
    if (!selectedStudentId && eligibleStudents.length > 0) {
      setSelectedStudentId(eligibleStudents[0].id);
    }
  }, [eligibleStudents, selectedStudentId]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <Card className="glass-card overflow-hidden rounded-[1.8rem] border-border/60 bg-background/80">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Eligible students</CardTitle>
                <CardDescription>Students who have reached the 80% progress threshold.</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                {eligibleStudents.length} ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {eligibleStudents.length > 0 ? (
              eligibleStudents.map((student) => {
                const active = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={cn(
                      "w-full rounded-3xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                      active ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-background/70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold">{student.name}</p>
                          <Badge variant="outline" className="rounded-full">
                            {student.progress}%
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{student.course}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Batch {student.batch}</p>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Award className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ready to issue</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
                <WandSparkles className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-base font-medium">No students are ready yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Certificates will appear here as soon as students cross the 80% completion threshold.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AdminCertificateStudio student={selectedStudent} />
        </div>
      </div>
    </div>
  );
}
