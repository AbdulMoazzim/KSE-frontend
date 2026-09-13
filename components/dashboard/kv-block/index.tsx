import { Card } from "@/components/ui/card";
import { formatLabel, formatPrimitive, isPlainObject } from "./format";

/**
 * Renders arbitrary backend JSON (unknown/unconfirmed response shapes)
 * as a readable key/value view, recursing into nested objects and
 * arrays. Used on pages where the exact field names weren't knowable
 * ahead of time — fundamentals, corporate analysis, sentiment, ops.
 * See DOCUMENTATION.md §6 for why this exists instead of a hand-built table.
 *
 * IMPORTANT: the 2-column layout only applies at depth 0. Tailwind's
 * `sm:` breakpoint responds to *viewport* width, not the actual space
 * available inside a nested container — so a field 3 levels deep inside
 * a 2-column page layout would otherwise still try to lay itself out in
 * 2 columns of a ~140px-wide cell, wrapping every label into an
 * unreadable single-word-per-line stack. Past depth 0 this always
 * stacks single-column instead, regardless of screen size.
 */
export function KeyValueBlock({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) return <Empty />;
  if (Array.isArray(data)) return data.length === 0 ? <Empty /> : <ArrayBlock items={data} depth={depth} />;
  if (isPlainObject(data)) return <ObjectBlock data={data} depth={depth} />;
  return <Primitive value={data} />;
}

export function KeyValueCard({ title, data, note }: { title: string; data: unknown; note?: string }) {
  return (
    <Card className="p-4 sm:p-6">
      {title && <h2 className="mb-1 text-[14.5px] font-semibold text-foreground sm:text-[15.5px]">{title}</h2>}
      {note && <p className="mb-4 text-[12.5px] leading-relaxed text-muted-foreground">{note}</p>}
      <div className={note ? "" : "mt-4"}>
        <KeyValueBlock data={data} />
      </div>
    </Card>
  );
}

// ---- internal pieces -------------------------------------------------------

function Empty() {
  return <p className="text-[13px] text-slate">No data returned.</p>;
}

function Primitive({ value }: { value: unknown }) {
  return <span className="font-mono break-all">{formatPrimitive(value)}</span>;
}

function ArrayBlock({ items, depth }: { items: unknown[]; depth: number }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-line bg-tint/40 p-3 sm:p-4">
          <KeyValueBlock data={item} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

/** Keys here render as their own full-width row below the main grid instead of a cramped grid cell — long values like a symbol list. */
const TRAILING_KEYS = ["symbols"];

function ObjectBlock({ data, depth }: { data: Record<string, unknown>; depth: number }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <Empty />;

  const mainEntries = entries.filter(([key]) => !TRAILING_KEYS.includes(key));
  const trailingEntries = entries.filter(([key]) => TRAILING_KEYS.includes(key));
  const gridClass = depth === 0 ? "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2" : "flex flex-col gap-3";

  return (
    <>
      <dl className={gridClass}>
        {mainEntries.map(([key, value]) => (
          <Entry key={key} label={key} value={value} depth={depth} />
        ))}
      </dl>
      {trailingEntries.map(([key, value]) => (
        <Entry key={key} label={key} value={value} depth={depth} className="mt-3 sm:mt-4" />
      ))}
    </>
  );
}

function Entry({
  label,
  value,
  depth,
  className = "",
}: {
  label: string;
  value: unknown;
  depth: number;
  className?: string;
}) {
  const isNested = isPlainObject(value) || Array.isArray(value);
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate">{formatLabel(label)}</dt>
      <dd className="mt-0.5 break-words text-[13.5px] text-ink">
        {isNested ? (
          <div className="mt-1 rounded-lg border border-line bg-tint/40 p-2.5 sm:p-3">
            <KeyValueBlock data={value} depth={depth + 1} />
          </div>
        ) : (
          <Primitive value={value} />
        )}
      </dd>
    </div>
  );
}
