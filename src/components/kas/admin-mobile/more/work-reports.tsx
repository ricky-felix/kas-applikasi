"use client";
import { WORK_REPORTS, PROJECTS } from "@/lib/data";
import { Kicker, DisplayHeading } from "../../ui";

export default function AMWorkReports({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      <button onClick={onBack} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 10px" }}>← Kembali</button>
      <Kicker no="06" label={`${WORK_REPORTS.length} LAPORAN HARI INI`} />
      <DisplayHeading size={26}>Laporan harian,<br /><em>lapangan.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {WORK_REPORTS.map((r) => (
          <div key={r.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{r.workerShort}</div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{r.workerName}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{r.date}</span>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{PROJECTS.find((p) => p.id === r.projectId)?.code}</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.5, color: "var(--kas-ink-2)", margin: 0 }}>{r.note}</p>
            {r.photos > 0 && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-cobalt)", marginTop: 5, letterSpacing: "0.12em", textTransform: "uppercase" }}>{r.photos} foto terlampir</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
