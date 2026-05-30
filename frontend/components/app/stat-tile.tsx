import type { ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatTileProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  detail: string;
  accentClassName?: string;
};

export function StatTile({ icon: Icon, title, value, detail, accentClassName = "bg-primary/10 text-primary" }: StatTileProps) {
  return (
    <Card className="glass-card rounded-3xl border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClassName}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
