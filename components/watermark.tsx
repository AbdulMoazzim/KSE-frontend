export function Watermark({
  label = "KSE SENTINEL",
  opacity = "opacity-[0.04]",
  color = "text-navy",
}: {
  label?: string;
  opacity?: string;
  color?: string;
}) {
  const rows = 10;
  const cols = 6;
  const cells: { top: number; left: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        top: r * 140 - 60,
        left: c * 260 - (r % 2 === 0 ? 0 : 130),
      });
    }
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${opacity}`} aria-hidden>
      {cells.map((cell, i) => (
        <span
          key={i}
          className={`absolute -rotate-[28deg] whitespace-nowrap font-mono text-[13px] tracking-[0.18em] ${color}`}
          style={{ top: cell.top, left: cell.left }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
