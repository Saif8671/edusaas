"use client";

import { useState } from "react";
import { ArrowRightLeft, Calendar, PencilLine, PlusCircle, GraduationCap, Trash2, Users } from "lucide-react";
import { useAppStore, BatchData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/page-header";

type BatchForm = {
  name: string;
  facultyName: string;
  capacity: string;
  schedule: string;
  status: BatchData["status"];
};

const emptyBatch: BatchForm = {
  name: "",
  facultyName: "",
  capacity: "",
  schedule: "",
  status: "Upcoming" as const,
};

export default function AdminBatches() {
  const { batches, addBatch, updateBatch, deleteBatch } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BatchForm>(emptyBatch);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyBatch);
  };

  const startEdit = (batch: BatchData) => {
    setEditingId(batch.id);
    setForm({
      name: batch.name,
      facultyName: batch.facultyName,
      capacity: String(batch.capacity),
      schedule: batch.schedule,
      status: batch.status,
    });
  };

  const saveBatch = () => {
    if (!form.name.trim() || !form.facultyName.trim()) return;

    const payload = {
      name: form.name,
      facultyName: form.facultyName,
      capacity: Number(form.capacity || 0),
      schedule: form.schedule,
      status: form.status,
    };

    if (editingId) {
      updateBatch(editingId, payload);
    } else {
      addBatch(payload);
    }
    resetForm();
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Batches & Scheduling"
        description="Create, edit, and delete cohorts while monitoring student load."
        actions={
          <Button variant="outline" onClick={resetForm} className="gap-2 rounded-xl">
            <PlusCircle className="h-4 w-4" />
            New batch
          </Button>
        }
      />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{editingId ? "Edit batch" : "Create batch"}</CardTitle>
          <CardDescription>Set the cohort name, mentor, capacity, and timetable.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["name", "Batch name"],
            ["facultyName", "Faculty name"],
            ["capacity", "Capacity"],
            ["schedule", "Schedule"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
                type={key === "capacity" ? "number" : "text"}
              />
            </div>
          ))}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Status</p>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as BatchData["status"] }))}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={saveBatch} className="rounded-xl gap-2">
              {editingId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {editingId ? "Save changes" : "Create batch"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="rounded-xl">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {batches.map((batch) => (
          <Card key={batch.id} className="glass-card relative overflow-hidden border bg-card/40 backdrop-blur-md">
            <div className="absolute right-0 top-0 p-3">
              <Badge
                variant="outline"
                className={
                  batch.status === "Active"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : batch.status === "Completed"
                      ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                }
              >
                {batch.status}
              </Badge>
            </div>

            <CardHeader className="pb-3">
              <GraduationCap className="mb-2 h-10 w-10 text-primary" />
              <CardTitle className="text-lg">{batch.name}</CardTitle>
              <CardDescription>Instructor: {batch.facultyName}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Enrolled Students
                </span>
                <span className="font-semibold">
                  {batch.studentCount} / {batch.capacity}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${(batch.studentCount / batch.capacity) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Schedule
                </span>
                <span className="font-semibold">{batch.schedule}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="w-full rounded-xl gap-1 text-xs" onClick={() => startEdit(batch)}>
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteBatch(batch.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Batch actions</p>
                <p className="mt-1">Use this cohort for student transfer and class scheduling workflows.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
