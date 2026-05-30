"use client";

import { useMemo, useState } from "react";
import { Search, Download, Eye, PencilLine, PlusCircle, Trash2, Filter } from "lucide-react";
import { useAppStore, StudentData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentAcademicFileDrawer } from "@/components/student-academic-file-drawer";
import { PageHeader } from "@/components/app/page-header";

type StudentForm = {
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  parentName: string;
  status: StudentData["status"];
};

const blankStudent: StudentForm = {
  name: "",
  email: "",
  phone: "",
  course: "",
  batch: "",
  parentName: "",
  status: "Active" as const,
};

export default function AdminStudents() {
  const { students, addStudent, updateStudent, deleteStudent } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(blankStudent);

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.id.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, students],
  );

  const startEdit = (student: StudentData) => {
    setEditingStudentId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      batch: student.batch,
      parentName: student.parentName,
      status: student.status,
    });
  };

  const resetForm = () => {
    setEditingStudentId(null);
    setForm(blankStudent);
  };

  const saveStudent = () => {
    if (!form.name.trim() || !form.email.trim()) return;

    if (editingStudentId) {
      updateStudent(editingStudentId, form);
    } else {
      addStudent(form);
    }
    resetForm();
  };

  const toggleStatus = (id: string, current: StudentData["status"]) => {
    updateStudent(id, { status: current === "Active" ? "Deactivated" : "Active" });
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Student Manager"
        description="Create, edit, and delete student records with parent mapping and attendance."
        actions={
          <Button variant="outline" onClick={resetForm} className="gap-2 rounded-xl">
            <PlusCircle className="h-4 w-4" />
            New student
          </Button>
        }
      />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{editingStudentId ? "Edit student" : "Create student"}</CardTitle>
          <CardDescription>Fill in the learner profile, batch, and parent details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["name", "Full name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["course", "Course"],
            ["batch", "Batch"],
            ["parentName", "Parent name"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
              />
            </div>
          ))}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Status</p>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as StudentData["status"] }))}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={saveStudent} className="rounded-xl gap-2">
              {editingStudentId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {editingStudentId ? "Save changes" : "Create student"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="rounded-xl">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search name, ID or email..."
                className="flex h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-1">
                <Filter className="h-4 w-4" />
                Filter Status
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1">
                <Download className="h-4 w-4" />
                Import CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/40">
                      <TableCell className="font-semibold text-primary">{student.id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${student.attendancePct < 75 ? "bg-red-500" : "bg-green-500"}`}
                              style={{ width: `${student.attendancePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{student.attendancePct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`cursor-pointer ${
                            student.status === "Active"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}
                          onClick={() => toggleStatus(student.id, student.status)}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StudentAcademicFileDrawer
                            student={student}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button variant="ghost" size="icon" onClick={() => startEdit(student)}>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStudent(student.id)}
                            className="text-red-500 hover:text-red-600 focus:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No student records found matching the search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
