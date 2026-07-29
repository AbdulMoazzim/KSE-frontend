export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-tint px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-navy">
      {children}
    </span>
  );
}

type PillTone = "green" | "red" | "slate" | "gold";

const tones: Record<PillTone, string> = {
  green: "bg-tint-green text-brand-green",
  red: "bg-tint-red text-brand-red",
  slate: "bg-tint text-slate",
  gold: "bg-tint-gold text-gold",
};

export function StatusPill({
  label,
  tone,
  pulse = false,
}: {
  label: string;
  tone: PillTone;
  pulse?: boolean;
}) {
  const dotColor: Record<PillTone, string> = {
    green: "bg-brand-green",
    red: "bg-brand-red",
    slate: "bg-slate",
    gold: "bg-gold",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] tracking-wide ${tones[tone]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor[tone]} opacity-60`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor[tone]}`} />
      </span>
      {label}
    </span>
  );
}
