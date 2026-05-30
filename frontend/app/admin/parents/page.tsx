"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Network, Phone, Mail } from "lucide-react";

export default function AdminParents() {
  const { students } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Parent-Student Mappings" description="List registered parents and match them to student progress updates" />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Parent Directory</CardTitle>
          <CardDescription>Associated contact details and dependent children records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Dependent Child</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold">{student.parentName}</TableCell>
                    <TableCell className="font-medium text-primary">{student.name}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.batch}</Badge>
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
