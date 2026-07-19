import type { ElementType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  loading = false,
}: {
  title: string;
  value: string | number;
  caption?: string;
  icon?: ElementType;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[112px] items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-20" />
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          )}
          {caption && <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
