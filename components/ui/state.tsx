import * as React from "react";
import { cn } from "@/lib/utils";

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-4", className)} role="status" aria-label="Loading">
      <div className="h-40 rounded-md bg-surface" />
      <div className="h-4 w-2/3 rounded-md bg-surface" />
      <div className="h-4 w-1/2 rounded-md bg-surface" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border p-12 text-center">
      <p className="text-base font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-danger/5 p-12 text-center">
      <p className="text-base font-medium text-danger">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
