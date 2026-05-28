import { fmtIDRshort } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import type { AnalyticsData } from "./types";
import { HBar, SecLabel, SecTitle } from "./primitives";

export function EmployeeSection({ d }: { d: AnalyticsData }) {
  const totalDays    = d.employees.reduce((s, w) => s + w.totalDays, 0);
  const totalReports = d.employees.reduce((s, w) => s + w.reports, 0);
  const totalWages   = d.employees.reduce((s, w) => s + w.wages, 0);

  return (
    <section className="mb-12">
      <SecLabel no="04" kicker="Performa Tim · Mei 2026" source="supabase" />
      <SecTitle>Pekerja, <em>utilisasi &amp; kontribusi.</em></SecTitle>

      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        <div className="grid gap-4 py-2" style={{ gridTemplateColumns: "28px 1.4fr 80px 60px 60px 60px 1fr 80px", borderBottom: "1px solid var(--kas-line)" }}>
          {["#","Pekerja","Upah/hari","Hari","Setengah","Laporan","Utilisasi (24 hari)","Rev. dikontrib."].map((h, i) => (
            <span key={i} style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
          ))}
        </div>

        {d.employees.map((w, i) => {
          const utilColor = w.utilPct >= 70 ? "var(--kas-moss)" : w.utilPct >= 50 ? "var(--kas-ochre)" : "var(--kas-rust)";
          return (
            <div key={w.workerId} className="grid gap-4 items-center py-3.5" style={{ gridTemplateColumns: "28px 1.4fr 80px 60px 60px 60px 1fr 80px", borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{w.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 1 }}>{w.workerRole}</div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{fmtIDRshort(w.rate)}</div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>{w.totalDays}</div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: w.halfDays > 0 ? "var(--kas-ochre)" : "var(--kas-ink-3)" }}>{w.halfDays > 0 ? w.halfDays : "—"}</div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{w.reports > 0 ? w.reports : "—"}</div>
              <div className="flex items-center gap-2">
                <HBar pct={w.utilPct} h={4} color={utilColor} />
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, minWidth: 32, textAlign: "right", color: utilColor, fontWeight: 600 }}>{w.utilPct.toFixed(0)}%</span>
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                {fmtIDRshort(w.revPerDay)}<span style={{ color: "var(--kas-ink-3)", fontSize: 8 }}>/hr</span>
              </div>
            </div>
          );
        })}

        <div className="grid gap-4 items-center py-3" style={{ gridTemplateColumns: "28px 1.4fr 80px 60px 60px 60px 1fr 80px" }}>
          <div /><span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>Total Mei</span>
          <div />
          <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>{totalDays}</div>
          <div />
          <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>{totalReports}</div>
          <div />
          <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>{fmtIDRshort(totalWages)}</div>
        </div>
      </div>
    </section>
  );
}
