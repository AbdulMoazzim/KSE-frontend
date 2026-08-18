import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Tag({ children }: { children: React.ReactNode }) {
  return <Badge className={cn("py-1 text-[10.5px]")}>{children}</Badge>;
}

type PillTone = "green" | "red" | "slate" | "gold";

const dotColor: Record<PillTone, string> = {
  green: "bg-brand-green",
  red: "bg-brand-red",
  slate: "bg-slate",
  gold: "bg-gold",
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
  return (
    <Badge variant={tone} className="text-[11px]">
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor[tone]} opacity-60`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor[tone]}`} />
      </span>
      {label}
    </Badge>
  );
}
