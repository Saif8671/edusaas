"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Clock } from "lucide-react";

export default function StudentCourses() {
  const { courses } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Registered Classes</h2>
        <p className="text-muted-foreground">Access your lessons materials and course resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.filter(c => c.published).slice(0, 1).map(course => (
          <Card key={course.id} className="glass-card border bg-card/40 backdrop-blur-md overflow-hidden">
            <div className="h-36 overflow-hidden">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No thumbnail
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription>Duration: {course.duration}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs">
              <p><strong>Overall Rating:</strong> {course.rating} / 5.0</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
