"use client";
import { PROJECTS, WORKERS, TODAY_SHORT, fmtIDRshort } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

export default function AMHome() {
  const active = PROJECTS.filter((p) => p.status === "Active");
  const outstanding = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersToday = WORKERS.filter((w) => active.some((p) => p.assigned.includes(w.id))).length;

  const stats = [
    { n: "01", l: "Proyek aktif",       v: String(active.length).padStart(2, "0"), accent: false },
    { n: "02", l: "Belum dibayar",      v: fmtIDRshort(outstanding), accent: true },
    { n: "03", l: "Pekerja hadir",      v: String(workersToday).padStart(2, "0"), accent: false },
    { n: "04", l: "Aktivitas hari ini", v: "07", accent: false },
  ];

  const activity = [
    { t: "08:15", who: "Pak Suparman", a: "Hadir · Cemara Asri" },
    { t: "08:14", who: "Budi Hartono", a: "Hadir · Cemara Asri" },
    { t: "08:20", who: "Dedi Saragih", a: "Hadir · Cambridge" },
    { t: "07:51", who: "Eko Prasetyo", a: "Setengah hari · Cemara Asri" },
  ];

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>Empat angka,<br /><em>satu pagi.</em></DisplayHeading>

      <div className="mt-4 flex flex-col">
        {stats.map((c, i) => (
          <div
            key={i}
            className="grid items-center gap-3.5"
            style={{
              gridTemplateColumns: "auto 1fr auto",
              borderTop: i === 0 ? "1px solid var(--kas-ink)" : "none",
              borderBottom: i === stats.length - 1 ? "1px solid var(--kas-ink)" : "1px solid var(--kas-line)",
              padding: "16px 0",
            }}
          >
            <MonoLabel size={10}>{c.n}</MonoLabel>
            <div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.l}</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 32, lineHeight: 1.0, marginTop: 4, color: c.accent ? "var(--kas-rust)" : "var(--kas-ink)", letterSpacing: "-0.02em" }}>{c.v}</div>
            </div>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-ink-3)" }}>→</span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Kicker no="—" label="AKTIVITAS LAPANGAN" />
        {activity.map((it, i) => (
          <div key={i} className="grid gap-3 items-baseline py-2.5" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line-2)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", minWidth: 38 }}>{it.t}</span>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{it.who}</span>
              <div style={{ color: "var(--kas-ink-3)", fontSize: 11, marginTop: 2 }}>{it.a}</div>
            </div>
            <span className="inline-block" style={{ width: 5, height: 5, background: "var(--kas-cobalt)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
