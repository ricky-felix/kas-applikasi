import { MonoLabel } from "@/components/primitives";

type Stat = { n: string; label: string; value: string; sub: string; accentColor: string };
type DerivedStat = { accentColor: string; from: string; label: string; value: string; sub: string; healthy: boolean; formula: string };

export function StatsGrid({ stats, derived }: { stats: Stat[]; derived: DerivedStat[] }) {
  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)" }}>
        {stats.map((s, i) => (
          <div key={i} className="p-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderTop: `3px solid ${s.accentColor}` }}>
            <div className="flex items-center gap-2">
              <MonoLabel size={10}>{s.n}</MonoLabel>
              <span className="flex-1" style={{ height: 1, background: "var(--kas-line-2)" }} />
            </div>
            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, marginTop: 12, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 44, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 8, color: i === 2 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 8, letterSpacing: "0.08em" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
        {derived.map((d, i) => (
          <div key={i} className="px-5 py-4" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderBottom: `3px solid ${d.accentColor}` }}>
            <div className="flex items-center gap-1.5 mb-3">
              <span style={{ color: d.accentColor, fontSize: 10, lineHeight: 1 }}>↳</span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>dari {d.from}</span>
            </div>
            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 10, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{d.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1, letterSpacing: "-0.01em", marginTop: 5, color: d.healthy ? "var(--kas-moss)" : "var(--kas-rust)" }}>{d.value}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 5, letterSpacing: "0.08em" }}>{d.formula}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.06em" }}>{d.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}
