import { fmtIDRshort } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { SectionHead, Bar } from "../shared";

type WorkerRow = {
  workerId: string; name: string; workerRole: string;
  totalDays: number; wages: number; utilPct: number; revPerDay: number;
};

export function WorkerEfficiency({ workers, maxRevPerDay }: { workers: WorkerRow[]; maxRevPerDay: number }) {
  return (
    <section>
      <SectionHead no="06" kicker="EFISIENSI TIM">Pekerja, <em>per hari kerja.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        <div className="grid gap-3 py-2" style={{ gridTemplateColumns: "26px 1fr 48px 80px", borderBottom: "1px solid var(--kas-line)" }}>
          {["#", "Pekerja", "Hari", "Rev/hari"].map((h, i) => (
            <span key={i} style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {workers.map((w, i) => (
          <div key={w.workerId} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div className="grid gap-3 items-center mb-2" style={{ gridTemplateColumns: "26px 1fr 48px 80px" }}>
              <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{w.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{w.workerRole}</div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{w.totalDays}h</div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600 }}>{fmtIDRshort(w.revPerDay)}</div>
            </div>
            <div className="flex items-center gap-2" style={{ paddingLeft: 38 }}>
              <Bar pct={(w.revPerDay / maxRevPerDay) * 100} h={3} />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", minWidth: 64, textAlign: "right" }}>
                gaji {fmtIDRshort(w.wages)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
