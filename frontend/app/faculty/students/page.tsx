"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentAcademicFileDrawer } from "@/components/student-academic-file-drawer";
import { PageHeader } from "@/components/app/page-header";

export default function FacultyStudents() {
  const { students } = useAppStore();

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Student Roster"
        description="Track active enrollments, attendance, progress, and open the same academic preview used by admin."
      />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-primary">{s.id}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Attendance</span>
                          <span>{s.attendancePct}%</span>
                        </div>
                        <Progress value={s.attendancePct} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{s.progress}%</span>
                        </div>
                        <Progress value={s.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <StudentAcademicFileDrawer
                        student={s}
                        trigger={
                          <Button variant="outline" size="sm" className="rounded-full">
                            Preview
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
