"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useAppNav } from "@/hooks/use-app-nav";
import { routes } from "@/lib/routes";
import { toast } from "@/lib/toast";

export default function StudentCourses() {
  const { courses } = useAppStore();
  const navigate = useAppNav();
  const published = courses.filter((course) => course.published);

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="My courses"
        description="Access lesson materials and resources for your enrolled classes."
        actions={
          <Button type="button" variant="outline" className="rounded-full" onClick={() => navigate(routes.student.marketplace)}>
            Browse marketplace
          </Button>
        }
      />

      {published.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses"
          description="Explore the marketplace to enroll in your first class."
          actionLabel="Open marketplace"
          onAction={() => navigate(routes.student.marketplace)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {published.map((course) => (
            <Card key={course.id} className="glass-card overflow-hidden border bg-card/40 backdrop-blur-md">
              <div className="h-36 overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    No thumbnail
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>
                  {course.duration} · {course.facultyName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Rating: <span className="font-medium text-foreground">{course.rating}</span> / 5.0
                </p>
                <Button
                  type="button"
                  className="w-full rounded-xl"
                  onClick={() => {
                    toast.success(`Opening ${course.title}`);
                    navigate(routes.student.learningPath);
                  }}
                >
                  Continue learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
