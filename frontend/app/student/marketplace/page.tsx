"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function StudentMarketplace() {
  const { courses } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Courses Marketplace" description="Enroll in new study tracks" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="glass-card border bg-card/40 backdrop-blur-md overflow-hidden">
            <div className="h-40">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No thumbnail
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-md line-clamp-1">{course.title}</CardTitle>
              <CardDescription>Instructor: {course.facultyName}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-bold">${course.price}</span>
              <Button size="sm" className="rounded-xl"><ShoppingBag className="h-4 w-4 mr-1" /> Purchase</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
