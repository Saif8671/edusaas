import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Hide page title — use when the dashboard shell already shows the active nav label. */
  hideTitle?: boolean;
};

export function PageHeader({ eyebrow, title, description, actions, hideTitle }: PageHeaderProps) {
  if (hideTitle && !description && !actions && !eyebrow) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-start sm:justify-between",
        !description && !actions && hideTitle && "border-0 pb-0",
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
        ) : null}
        {!hideTitle ? (
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        ) : null}
        {description ? <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
