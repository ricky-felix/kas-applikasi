"use client";
import { useState } from "react";
import { PROJECTS, CHANGE_ORDERS, fmtIDRshort } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

export default function TimelinePage() {
  const [coStatuses, setCoStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(CHANGE_ORDERS.map((c) => [c.id, c.status]))
  );

  const bars = [
    { id: "p4", name: "Fasad Gedung Capital Building", code: "KAS-2026-011", status: "Completed", left: 7.4,  width: 40.2 },
    { id: "p3", name: "Kolam Renang Villa Setiabudi",  code: "KAS-2026-012", status: "On Hold",   left: 41.0, width: 31.1 },
    { id: "p2", name: "Basement Apartemen Cambridge",  code: "KAS-2026-013", status: "Active",    left: 50.8, width: 32.0 },
    { id: "p1", name: "Atap Beton Ruko Cemara Asri",   code: "KAS-2026-014", status: "Active",    left: 59.0, width: 14.8 },
  ];
  const months = ["Mar", "Apr", "Mei", "Jun", "Jul"];
  const todayPct = ((31 + 28 + 31 + 30 + 24) / 122) * 100;

  const barColor: Record<string, string> = {
    Active: "var(--kas-cobalt)", "On Hold": "var(--kas-ochre)",
    Completed: "var(--kas-moss)", Draft: "var(--kas-ink-3)",
  };

  const pendingOrders = CHANGE_ORDERS.filter((c) => coStatuses[c.id] === "Menunggu");

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Timeline" />
      <SectionHead no="07" kicker={`${PROJECTS.length} PROYEK`}>Timeline, <em>visual.</em></SectionHead>

      <div className="mb-6 flex gap-4 flex-wrap" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {Object.entries(barColor).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="inline-block" style={{ width: 12, height: 4, background: color }} />
            <span style={{ color: "var(--kas-ink-3)" }}>{status}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="inline-block" style={{ width: 2, height: 12, background: "var(--kas-rust)" }} />
          <span style={{ color: "var(--kas-ink-3)" }}>Hari ini</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        <div className="relative flex" style={{ borderBottom: "1px solid var(--kas-line)", height: 32 }}>
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex items-center px-2" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderRight: i < months.length - 1 ? "1px solid var(--kas-line-2)" : "none" }}>{m}</div>
          ))}
          <div className="absolute top-0 bottom-0" style={{ left: `${todayPct}%`, width: 1, background: "var(--kas-rust)", zIndex: 2 }} />
        </div>

        {bars.map((b, i) => (
          <div key={b.id} className="grid items-center" style={{ gridTemplateColumns: "260px 1fr", borderBottom: i < bars.length - 1 ? "1px solid var(--kas-line)" : "none", minHeight: 56 }}>
            <div className="pr-5 py-3" style={{ borderRight: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.2 }}>{b.name}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{b.code}</div>
            </div>
            <div className="relative" style={{ height: 56 }}>
              <div className="absolute inset-y-0" style={{ left: `${todayPct}%`, width: 1, background: "var(--kas-rust)", opacity: 0.3 }} />
              <div
                className="absolute top-1/2"
                style={{
                  left: `${b.left}%`,
                  width: `${b.width}%`,
                  height: 20,
                  marginTop: -10,
                  background: barColor[b.status],
                  opacity: b.status === "Completed" ? 0.7 : 1,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SectionHead no="02" kicker="CHANGE ORDER MENUNGGU">Perubahan scope, <em>perlu keputusan.</em></SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {pendingOrders.length === 0 && (
            <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Tidak ada change order pending.</div>
          )}
          {pendingOrders.map((co) => (
            <div key={co.id} className="grid gap-5 items-center py-4" style={{ gridTemplateColumns: "1fr auto auto", borderBottom: "1px solid var(--kas-line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.3 }}>{co.description}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{co.date} · {co.requestedBy} · {PROJECTS.find((p) => p.id === co.projectId)?.code}</div>
              </div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-rust)" }}>+{fmtIDRshort(co.costImpact)}</div>
              <div className="flex gap-1.5">
                <button onClick={() => setCoStatuses((p) => ({ ...p, [co.id]: "Disetujui" }))} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                <button onClick={() => setCoStatuses((p) => ({ ...p, [co.id]: "Ditolak" }))} style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Tolak</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
