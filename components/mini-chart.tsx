export function MiniChart({ variant }: { variant: "backtest" | "live" }) {
  const backtestPath =
    "M0,70 L40,70 L40,60 L80,60 L80,64 L120,64 L120,50 L160,50 L160,55 L200,55 L200,38 L240,38 L240,44 L280,44 L280,26 L320,26 L320,32 L360,32 L360,14 L400,14";
  const livePath =
    "M0,74 L40,74 L40,66 L80,66 L80,70 L120,70 L120,52 L160,52 L160,58 L200,58 L200,34 L240,34 L240,40 L280,40 L280,20 L320,20 L320,28 L360,28 L360,10 L400,10";

  if (variant === "backtest") {
    return (
      <svg viewBox="0 0 400 90" className="block h-[90px] w-full">
        <path
          d={backtestPath}
          fill="none"
          stroke="#8891AE"
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 90" className="block h-[90px] w-full">
      <path d={livePath} fill="none" stroke="#3F8F6C" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="400" cy="10" r="4" fill="#3F8F6C">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
