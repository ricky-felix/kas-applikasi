import type { AnalyticsData } from "./types";
import { HBar, SecLabel, SecTitle } from "./primitives";

export function AppUsageSection({ d }: { d: AnalyticsData }) {
  const maxSessions = Math.max(...d.posthog.byRole.map(r => r.sessions));
  const maxEventCt  = Math.max(...d.posthog.topEvents.map(e => e.count));

  return (
    <section className="mb-12">
      <SecLabel no="03" kicker="Tauke App · Aktivitas" source="posthog-app" />
      <SecTitle>Penggunaan aplikasi, <em>per peran.</em></SecTitle>

      <div className="grid mb-8" style={{ gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid var(--kas-line)" }}>
        {[{ label: "Sesi aktif", value: d.posthog.totalSessions }, { label: "Total events", value: d.posthog.totalEvents }, { label: "Pengguna aktif", value: d.posthog.activeUsers }].map((k, i) => (
          <div key={i} className="p-4" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, fontWeight: 500, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 4, letterSpacing: "0.08em" }}>Mei 2026</div>
          </div>
        ))}
      </div>

      <div className="grid gap-9" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Sesi per peran</div>
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {d.posthog.byRole.map((r, i) => (
              <div key={i} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <div className="grid gap-3 items-center mb-1.5" style={{ gridTemplateColumns: "1fr 44px 56px" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.label}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{r.users} pengguna · {r.topEvent}</div>
                  </div>
                  <span style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600 }}>{r.sessions}</span>
                  <span style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{r.events}</span>
                </div>
                <HBar pct={(r.sessions / maxSessions) * 100} h={3} color="var(--kas-cobalt)" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Event teratas · Mei 2026</div>
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {d.posthog.topEvents.map((e, i) => (
              <div key={i} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{e.label}</span>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}>{e.count}</span>
                </div>
                <HBar pct={(e.count / maxEventCt) * 100} h={3} color={i === 0 ? "var(--kas-cobalt)" : "var(--kas-line)"} />
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 4, letterSpacing: "0.1em" }}>{e.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
