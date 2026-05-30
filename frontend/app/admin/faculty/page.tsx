"use client";

import { useMemo, useState } from "react";
import { Mail, PencilLine, PlusCircle, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { useAppStore, FacultyData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";

type FacultyForm = {
  name: string;
  email: string;
  department: string;
  subjects: string;
  experience: string;
  assignedCourses: string;
  assignedBatches: string;
  status: FacultyData["status"];
};

const emptyFaculty: FacultyForm = {
  name: "",
  email: "",
  department: "",
  subjects: "",
  experience: "",
  assignedCourses: "",
  assignedBatches: "",
  status: "Active" as const,
};

export default function AdminFaculty() {
  const { faculty, addFaculty, updateFaculty, deleteFaculty } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FacultyForm>(emptyFaculty);

  const activeCount = useMemo(() => faculty.filter((item) => item.status === "Active").length, [faculty]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyFaculty);
  };

  const startEdit = (item: FacultyData) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      email: item.email,
      department: item.department,
      subjects: item.subjects.join(", "),
      experience: item.experience,
      assignedCourses: item.assignedCourses.join(", "),
      assignedBatches: item.assignedBatches.join(", "),
      status: item.status,
    });
  };

  const saveFaculty = () => {
    if (!form.name.trim() || !form.email.trim()) return;

    const payload = {
      name: form.name,
      email: form.email,
      department: form.department,
      subjects: form.subjects.split(",").map((value) => value.trim()).filter(Boolean),
      experience: form.experience,
      assignedCourses: form.assignedCourses.split(",").map((value) => value.trim()).filter(Boolean),
      assignedBatches: form.assignedBatches.split(",").map((value) => value.trim()).filter(Boolean),
      status: form.status,
    };

    if (editingId) {
      updateFaculty(editingId, payload);
    } else {
      addFaculty(payload);
    }
    resetForm();
  };

  const toggleStatus = (id: string, current: FacultyData["status"]) => {
    updateFaculty(id, { status: current === "Active" ? "Deactivated" : "Active" });
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Faculty Directory"
        description="Create, edit, and delete educator records with subject assignments."
        actions={
          <Button variant="outline" className="gap-2 rounded-xl" onClick={resetForm}>
            <PlusCircle className="h-4 w-4" />
            New faculty
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center gap-4">
            <UserCog className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-sm font-semibold">Faculty members</CardTitle>
              <CardDescription>{faculty.length} total instructors</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle className="text-sm font-semibold">Active instructors</CardTitle>
              <CardDescription>{activeCount} currently teaching</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{editingId ? "Edit faculty" : "Create faculty"}</CardTitle>
          <CardDescription>Use comma-separated values for multiple subjects, courses, and batches.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["name", "Instructor name"],
            ["email", "Email"],
            ["department", "Department"],
            ["subjects", "Subjects"],
            ["experience", "Experience"],
            ["assignedCourses", "Assigned courses"],
            ["assignedBatches", "Assigned batches"],
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
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FacultyData["status"] }))}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={saveFaculty} className="rounded-xl gap-2">
              {editingId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {editingId ? "Save changes" : "Create faculty"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="rounded-xl">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Faculty ID</TableHead>
                  <TableHead>Instructor Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Expertise Subjects</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-primary">{item.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {item.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-[10px] font-semibold">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{item.experience}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer ${
                          item.status === "Active"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                        onClick={() => toggleStatus(item.id, item.status)}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => deleteFaculty(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
