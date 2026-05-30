"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Clock, ArrowRight, PencilLine, Trash2, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";

export default function AdminMarketplace() {
  const router = useRouter();
  const { courses, updateCourse, deleteCourse } = useAppStore();

  const openCourseManager = () => router.push("/admin/courses");

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        hideTitle
        title="Course Marketplace"
        description="Create course listings, publish them for students, and manage pricing and visibility."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={openCourseManager} className="gap-2 rounded-xl">
              <PlusCircle className="h-4 w-4" />
              Create listing
            </Button>
            <Button variant="outline" onClick={openCourseManager} className="gap-2 rounded-xl">
              Manage courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardDescription>Published for sale</CardDescription>
            <CardTitle className="text-3xl">{courses.filter((course) => course.published).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardDescription>Draft listings</CardDescription>
            <CardTitle className="text-3xl">{courses.filter((course) => !course.published).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardDescription>Total learners enrolled</CardDescription>
            <CardTitle className="text-3xl">{courses.reduce((sum, course) => sum + course.studentsEnrolled, 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="glass-card flex flex-col overflow-hidden border bg-card/40 backdrop-blur-md">
            <div className="relative h-48">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No thumbnail
                </div>
              )}
              <div className="absolute right-3 top-3">
                <Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Live sale" : "Draft"}</Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
              <CardDescription>Created by {course.facultyName}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Duration
                </span>
                <span className="font-semibold">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  Rating
                </span>
                <span className="font-semibold">{course.rating} / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Students sold</span>
                <span className="font-semibold">{course.studentsEnrolled}</span>
              </div>
            </CardContent>

            <CardFooter className="mt-auto grid gap-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">${course.price}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1"
                  onClick={() => updateCourse(course.id, { published: !course.published })}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {course.published ? "Pause sale" : "Sell now"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full rounded-xl gap-1" onClick={openCourseManager}>
                  <PencilLine className="h-4 w-4" />
                  Edit listing
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => deleteCourse(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
