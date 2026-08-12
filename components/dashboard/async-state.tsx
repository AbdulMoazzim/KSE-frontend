export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-panel p-10 text-[13.5px] text-slate">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-navy" />
      {label}
    </div>
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
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-red/30 bg-tint-red p-10 text-center">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="#963C36" strokeWidth={1.8} />
        <path d="M14 8v7" stroke="#963C36" strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="14" cy="19" r="1.2" fill="#963C36" />
      </svg>
      <p className="max-w-sm text-[13.5px] leading-relaxed text-[#963C36]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full border border-brand-red/40 px-4 py-2 text-[13px] font-medium text-[#963C36] transition-colors hover:bg-white"
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
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-tint/40 p-10 text-center">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="7" width="20" height="15" rx="2" stroke="#5B6B85" strokeWidth={1.6} />
        <path d="M4 12h20" stroke="#5B6B85" strokeWidth={1.6} />
      </svg>
      <p className="text-[14px] font-medium text-navy">{title}</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-slate">{description}</p>
    </div>
  );
}
