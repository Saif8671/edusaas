"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export default function FacultyAttendance() {
  const { students } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Class Attendance Tracker</h2>
        <p className="text-muted-foreground">Log roll calls, QR codes, and session statistics</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Current Course</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold">{student.name}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell className={`font-bold ${student.attendancePct >= 75 ? "text-green-500" : "text-red-500"}`}>
                      {student.attendancePct}%
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
