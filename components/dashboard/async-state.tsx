import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Card className="flex items-center justify-center gap-3 p-10 text-[13.5px] text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
      {label}
    </Card>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="space-y-3 p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </Card>
  );
}

export function ErrorState({
  message = "We couldn't load this right now.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-tint-red p-10 text-center">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="rgb(var(--c-brand-red))" strokeWidth={1.8} />
        <path d="M14 8v7" stroke="rgb(var(--c-brand-red))" strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="14" cy="19" r="1.2" fill="rgb(var(--c-brand-red))" />
      </svg>
      <p className="max-w-sm text-[13.5px] leading-relaxed text-[rgb(var(--c-brand-red))]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full border border-destructive/40 px-4 py-2 text-[13px] font-medium text-[rgb(var(--c-brand-red))] transition-colors hover:bg-card"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-muted/40 p-10 text-center">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="7" width="20" height="15" rx="2" stroke="rgb(var(--c-slate))" strokeWidth={1.6} />
        <path d="M4 12h20" stroke="rgb(var(--c-slate))" strokeWidth={1.6} />
      </svg>
      <p className="text-[14px] font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
