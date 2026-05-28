import type { DataSource } from "./types";

export function HBar({ pct, color = "var(--kas-ink)", h = 4, bg = "var(--kas-line-2)" }: {
  pct: number; color?: string; h?: number; bg?: string;
}) {
  return (
    <div style={{ position: "relative", height: h, background: bg, flex: 1, minWidth: 0 }}>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}

const SOURCE_META: Record<DataSource, { label: string; color: string }> = {
  "posthog-web": { label: "POSTHOG",  color: "var(--kas-cobalt)" },
  "posthog-app": { label: "POSTHOG",  color: "var(--kas-cobalt)" },
  "supabase":    { label: "SUPABASE", color: "var(--kas-moss)"   },
  "computed":    { label: "COMPUTED", color: "var(--kas-ink-3)"  },
};

export function SecLabel({ no, kicker, source }: { no: string; kicker: string; source: DataSource }) {
  const s = SOURCE_META[source];
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.14em" }}>{no}</span>
      <span style={{ flex: 1, height: 1, background: "var(--kas-line)" }} />
      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.2em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{kicker}</span>
      <div className="flex items-center gap-1" style={{ border: `1px solid ${s.color}`, padding: "2px 7px" }}>
        <span style={{ display: "inline-block", width: 4, height: 4, background: s.color, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", color: s.color }}>{s.label}</span>
      </div>
    </div>
  );
}

export function SecTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 18 }}>
      {children}
    </h2>
  );
}

export function ChangeTag({ value, unit = "%" }: { value: number; unit?: string }) {
  const pos = value >= 0;
  return (
    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: pos ? "var(--kas-moss)" : "var(--kas-rust)", border: `1px solid ${pos ? "var(--kas-moss)" : "var(--kas-rust)"}`, padding: "1px 5px" }}>
      {pos ? "+" : ""}{value}{unit}
    </span>
  );
}
