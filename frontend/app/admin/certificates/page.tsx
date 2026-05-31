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
        <Card className="glass-card overflow-hidden rounded-[2rem] border-border/40 bg-background/60 shadow-2xl backdrop-blur-2xl">
          <CardHeader className="border-b border-border/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Eligible Students</CardTitle>
                <CardDescription className="text-sm font-medium opacity-80">Students with 80%+ progress ready for graduation.</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full bg-indigo-500/10 px-3 py-1 font-semibold text-indigo-500">
                {eligibleStudents.length} Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 max-h-[750px] overflow-y-auto">
            {eligibleStudents.length > 0 ? (
              eligibleStudents.map((student) => {
                const active = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={cn(
                      "w-full rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                      active
                        ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 ring-1 ring-emerald-500/30"
                        : "border-border/50 bg-background/50 hover:border-indigo-500/30 hover:bg-gradient-to-br hover:from-indigo-500/5 hover:to-purple-500/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-lg font-bold text-foreground">{student.name}</p>
                          <Badge variant="secondary" className={cn("rounded-full font-bold", active ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white")}>
                            {student.progress}%
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-muted-foreground">{student.course}</p>
                        <p className="mt-0.5 text-xs font-semibold text-indigo-400/80 uppercase tracking-wider">Batch {student.batch}</p>
                      </div>
                      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-colors", active ? "bg-emerald-500 text-white" : "bg-indigo-500/10 text-indigo-500")}>
                        <Award className="h-6 w-6" />
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        <span>Progress</span>
                        <span className={cn(active ? "text-emerald-500" : "text-indigo-500")}>{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className={cn("h-2.5 rounded-full", active ? "[&>div]:bg-emerald-500" : "[&>div]:bg-indigo-500")} />
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-background/50 p-2.5 backdrop-blur-md">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                        <ShieldCheck className="h-4 w-4" />
                        VERIFIED
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/10 p-10 text-center backdrop-blur-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-4">
                  <WandSparkles className="h-8 w-8 text-indigo-500" />
                </div>
                <p className="text-lg font-bold text-foreground">No students ready</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[250px]">
                  Certificates unlock automatically when progress hits 80%.
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
