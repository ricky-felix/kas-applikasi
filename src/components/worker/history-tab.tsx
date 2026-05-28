"use client";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

const HISTORY_ITEMS = [
  { date: "Sab, 23 Mei", project: "Cemara Asri", status: "Hadir",        overtime: 0 },
  { date: "Jum, 22 Mei", project: "Cemara Asri", status: "Hadir",        overtime: 2 },
  { date: "Kam, 21 Mei", project: "Cemara Asri", status: "Setengah Hari", overtime: 0 },
  { date: "Rab, 20 Mei", project: "Cemara Asri", status: "Hadir",        overtime: 0 },
  { date: "Sel, 19 Mei", project: "Cemara Asri", status: "Tidak Hadir",  overtime: 0 },
  { date: "Sen, 18 Mei", project: "Cemara Asri", status: "Hadir",        overtime: 1 },
  { date: "Sab, 16 Mei", project: "Setiabudi",   status: "Hadir",        overtime: 0 },
  { date: "Jum, 15 Mei", project: "Setiabudi",   status: "Hadir",        overtime: 0 },
];

export default function HistoryTab() {
  const hadirCount = HISTORY_ITEMS.filter((i) => i.status === "Hadir").length;
  const overtimeTotal = HISTORY_ITEMS.reduce((s, i) => s + i.overtime, 0);

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="14 HARI TERAKHIR" />
      <DisplayHeading size={28}>
        Riwayat,<br /><em>kehadiran.</em>
      </DisplayHeading>

      <div className="grid mt-4" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        <div className="py-3.5 pr-3.5" style={{ borderRight: "1px solid var(--kas-line)" }}>
          <MonoLabel size={9}>Hari Hadir</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 30, fontWeight: 500, marginTop: 4 }}>{hadirCount}</div>
        </div>
        <div className="py-3.5 pl-3.5">
          <MonoLabel size={9}>Total Lembur</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 30, fontWeight: 500, marginTop: 4, color: "var(--kas-ochre)" }}>
            {overtimeTotal}
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", marginLeft: 4 }}>JAM</span>
          </div>
        </div>
      </div>

      <div className="mt-1">
        {HISTORY_ITEMS.map((it, i) => (
          <div key={i} className="grid gap-3 items-center py-3.5" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line-2)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.08em", minWidth: 72 }}>
              {it.date}
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{it.project}</div>
              {it.overtime > 0 && (
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ochre)", marginTop: 2, letterSpacing: "0.1em" }}>
                  + {it.overtime} jam lembur
                </div>
              )}
            </div>
            <span
              className="px-2 py-1"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                background:
                  it.status === "Hadir"
                    ? "var(--kas-cobalt-soft)"
                    : it.status === "Setengah Hari"
                    ? "var(--kas-ochre-soft)"
                    : "var(--kas-paper-2)",
                color:
                  it.status === "Hadir"
                    ? "var(--kas-cobalt-ink)"
                    : it.status === "Setengah Hari"
                    ? "var(--kas-ochre-ink)"
                    : "var(--kas-ink-3)",
                border: "1px solid var(--kas-line)",
              }}
            >
              {it.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
