"use client";

import { useState } from "react";
import { BookOpen, Clock, PencilLine, PlusCircle, Star, Trash2 } from "lucide-react";
import { useAppStore, CourseData } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const emptyCourse = {
  title: "",
  price: "",
  facultyName: "",
  rating: "",
  duration: "",
  thumbnail: "",
  published: true,
};

export default function AdminCourses() {
  const { courses, addCourse, updateCourse, deleteCourse } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCourse);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCourse);
  };

  const startEdit = (course: CourseData) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      price: String(course.price),
      facultyName: course.facultyName,
      rating: String(course.rating),
      duration: course.duration,
      thumbnail: course.thumbnail,
      published: course.published,
    });
  };

  const saveCourse = () => {
    if (!form.title.trim() || !form.facultyName.trim()) return;

    const payload = {
      title: form.title,
      price: Number(form.price || 0),
      facultyName: form.facultyName,
      rating: Number(form.rating || 0),
      duration: form.duration,
      thumbnail: form.thumbnail,
      published: form.published,
    };

    if (editingId) {
      updateCourse(editingId, payload);
    } else {
      addCourse(payload);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Course Inventory</h2>
          <p className="text-muted-foreground">Create course listings and sell them directly to students.</p>
        </div>
        <Button variant="outline" onClick={resetForm} className="rounded-xl gap-2">
          <PlusCircle className="h-4 w-4" />
          New course
        </Button>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{editingId ? "Edit course" : "Create course"}</CardTitle>
          <CardDescription>Fill in the course details, price, and visibility for the marketplace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["title", "Course title"],
            ["price", "Price"],
            ["facultyName", "Faculty name"],
            ["rating", "Rating"],
            ["duration", "Duration"],
            ["thumbnail", "Thumbnail URL"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <Input
                value={String(form[key as keyof typeof form])}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
                type="text"
              />
            </div>
          ))}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Visibility</p>
            <select
              value={String(form.published)}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === "true" }))}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={saveCourse} className="rounded-xl gap-2">
              {editingId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {editingId ? "Save changes" : "Create course"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="rounded-xl">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {courses.map((course) => (
          <Card key={course.id} className="glass-card group flex flex-col overflow-hidden border bg-card/40 backdrop-blur-md">
            <div className="relative h-40 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No thumbnail
                </div>
              )}
              <div className="absolute right-2 top-2">
                <Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Published" : "Draft"}</Badge>
              </div>
            </div>

            <CardHeader className="pb-2">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                {course.id}
              </span>
              <CardTitle className="line-clamp-1 text-md font-bold">{course.title}</CardTitle>
              <CardDescription>By {course.facultyName}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 pb-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Duration
                </span>
                <span className="font-semibold">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  Rating
                </span>
                <span className="font-semibold">{course.rating} / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Students enrolled</span>
                <span className="font-bold text-primary">{course.studentsEnrolled}</span>
              </div>
            </CardContent>

            <CardFooter className="mt-auto flex gap-2 border-t bg-muted/20 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl text-xs"
                onClick={() => updateCourse(course.id, { published: !course.published })}
              >
                {course.published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => startEdit(course)}>
                <PencilLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 focus:bg-red-500/10"
                onClick={() => deleteCourse(course.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
