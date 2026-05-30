"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { CalendarDays, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { routes } from "@/lib/routes";
import { toast } from "@/lib/toast";
import { FileQuestion } from "lucide-react";

export default function FacultyDashboard() {
  const router = useRouter();
  const { students, courses, batches, assignments, gradeAssignment, addNotification } = useAppStore();

  const activeAssignments = assignments.filter((assignment) => assignment.status === "Submitted");

  const go = (path: string, label?: string) => {
    if (label) toast.info(`Opening ${label}`);
    router.push(path);
  };

  const handleGrade = (id: string, name: string) => {
    gradeAssignment(id, "A+", "Superb solution layout!");
    addNotification("Grade Submitted", `Successfully evaluated ${name}'s project`);
    toast.success(`Graded: ${name}`);
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Dashboard"
        description="Courses, batches, submissions, and live session tools."
        actions={
          <Button type="button" className="rounded-full" onClick={() => go(routes.faculty.assignments, "Assignments")}>
            Review assignments
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card
          className="glass-card cursor-pointer border bg-card/40 backdrop-blur-md transition hover:shadow-md"
          onClick={() => go(routes.faculty.courses, "Courses")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">My courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter((course) => course.published).length}</div>
            <p className="mt-1 text-[10px] text-muted-foreground">Published in catalog</p>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer border bg-card/40 backdrop-blur-md transition hover:shadow-md"
          onClick={() => go(routes.faculty.batches, "Batches")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="mt-1 text-[10px] text-muted-foreground">Assigned cohorts</p>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer border bg-card/40 backdrop-blur-md transition hover:shadow-md"
          onClick={() => go(routes.faculty.students, "Students")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="mt-1 text-[10px] font-semibold text-emerald-600">Roster active</p>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer border bg-card/40 backdrop-blur-md transition hover:shadow-md"
          onClick={() => go(routes.faculty.assignments, "Assignments")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Pending review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="mt-1 text-[10px] font-semibold text-amber-600">Requires review</p>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer border bg-card/40 backdrop-blur-md transition hover:shadow-md"
          onClick={() => go(routes.faculty.calendar, "Calendar")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Classes today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="mt-1 text-[10px] font-semibold text-primary">Next: 10:00 AM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="glass-card border bg-card/40 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Assess incoming submissions</CardTitle>
            <CardDescription>Quick-grade submitted homework from your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAssignments.length > 0 ? (
              activeAssignments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted/30"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-primary">{item.course}</span>
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    <span className="block text-xs text-muted-foreground">Deadline: {item.deadline}</span>
                  </div>
                  <Button type="button" size="sm" onClick={() => handleGrade(item.id, item.title)} className="rounded-xl">
                    Approve & grade
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FileQuestion}
                title="No pending submissions"
                description="All submitted work is evaluated. Create a new assignment to collect more."
                actionLabel="Open assignments"
                onAction={() => go(routes.faculty.assignments)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="glass-card flex flex-col justify-between border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Session attendance</CardTitle>
            <CardDescription>QR passcode demo for in-class check-in.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center gap-3 border-y bg-muted/10 py-6">
            <div className="rounded-2xl border border-primary/20 bg-background p-3 shadow-inner">
              <svg viewBox="0 0 100 100" className="h-28 w-28 text-foreground" aria-hidden>
                <rect width="25" height="25" fill="currentColor" />
                <rect x="75" width="25" height="25" fill="currentColor" />
                <rect y="75" width="25" height="25" fill="currentColor" />
                <rect x="35" y="35" width="30" height="30" fill="currentColor" />
              </svg>
            </div>
            <span className="font-mono text-xs font-bold tracking-widest text-primary">BATCH-QC-PASSCODE</span>
          </CardContent>

          <div className="flex flex-col gap-2 p-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-10 w-full gap-1.5 rounded-xl text-xs"
              onClick={() => go(routes.faculty.attendance, "Attendance")}
            >
              <CalendarDays className="h-4 w-4 text-primary" />
              Open attendance
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-10 w-full gap-1.5 rounded-xl text-xs"
              onClick={() => go(routes.faculty.live, "Live classes")}
            >
              <Video className="h-4 w-4" />
              Start live class
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
