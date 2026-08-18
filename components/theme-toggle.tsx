"use client";

import { useTheme } from "@/context/theme-context";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex h-8 items-center gap-2 rounded-md border border-line bg-panel px-2.5 text-[11px] font-medium text-slate transition-colors hover:border-navy hover:text-ink ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${theme === "dark" ? "bg-gold" : "bg-slate"}`} />
      {theme === "dark" ? (
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth={1.3} />
          <g stroke="currentColor" strokeWidth={1.3} strokeLinecap="round">
            <path d="M7 1v1.2" />
            <path d="M7 11.8V13" />
            <path d="M13 7h-1.2" />
            <path d="M2.2 7H1" />
            <path d="M11.1 2.9l-.9.9" />
            <path d="M3.8 10.2l-.9.9" />
            <path d="M11.1 11.1l-.9-.9" />
            <path d="M3.8 3.8l-.9-.9" />
          </g>
        </svg>
      ) : (
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
          <path
            d="M12.5 8.5A5.3 5.3 0 016 2 5.3 5.3 0 1012.5 8.5z"
            stroke="currentColor"
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
