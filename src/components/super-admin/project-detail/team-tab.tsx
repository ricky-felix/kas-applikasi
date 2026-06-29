"use client";
import { useState } from "react";
import { fmtIDR, type Project } from "@/lib/data";
import { useWorkers } from "@/lib/stores";
import { SectionHead } from "../shared";

const STATUSES = ["Hadir","Izin","Setengah Hari","Tidak Hadir","Hadir","Hadir"];

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  "Hadir":         { bg: "var(--kas-cobalt-soft)", fg: "var(--kas-cobalt-ink)" },
  "Setengah Hari": { bg: "var(--kas-ochre-soft)",  fg: "var(--kas-ochre-ink)" },
  "Izin":          { bg: "var(--kas-moss-soft)",   fg: "var(--kas-moss-ink)" },
};
const statusStyle = (s: string) => STATUS_STYLE[s] ?? { bg: "var(--kas-paper-2)", fg: "var(--kas-ink-3)" };

export function TeamTab({ p }: { p: Project }) {
  const WORKERS = useWorkers();
  const assigned = WORKERS.filter((w) => p.assigned.includes(w.id));
  const [payingWorkerId, setPayingWorkerId] = useState<string | null>(null);
  const [paidSet, setPaidSet] = useState<Set<string>>(new Set());

  const payingWorker    = payingWorkerId ? WORKERS.find((w) => w.id === payingWorkerId) : null;
  const payingWorkerIdx = payingWorkerId ? assigned.findIndex((w) => w.id === payingWorkerId) : -1;
  const payingDays      = payingWorkerIdx >= 0 ? ([10, 12, 8][payingWorkerIdx] || 9) : 0;
  const payingOwed      = payingWorker ? payingDays * payingWorker.rate : 0;

  return (
    <div>
      <SectionHead no="01" kicker={`${assigned.length} ORANG DITUGASKAN`}>Tim, <em>hari ini.</em></SectionHead>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            {["Pekerja","Peran","Status","Tarif/Hari","Hadir","Upah Tersisa","Aksi"].map((h, i) => (
              <th key={i} style={{ textAlign: i >= 3 ? "right" : "left", padding: "12px 14px 12px 0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assigned.map((w, i) => {
            const days   = [10, 12, 8][i] || 9;
            const owed   = days * w.rate;
            const status = STATUSES[i] || "Hadir";
            const isPaid = paidSet.has(w.id);
            return (
              <tr key={w.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500 }}>{w.short}</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 2 }}>{w.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 14px", color: "var(--kas-ink-2)" }}>{w.role}</td>
                <td style={{ padding: "16px 14px" }}>
                  <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: statusStyle(status).bg, color: statusStyle(status).fg }}>{status}</span>
                </td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{fmtIDR(w.rate)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{days}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)" }}>{fmtIDR(owed)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right" }}>
                  {isPaid ? (
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-moss)", fontWeight: 600 }}>✓ LUNAS</span>
                  ) : (
                    <button type="button" onClick={() => setPayingWorkerId(w.id)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Bayar</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {payingWorkerId && payingWorker && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setPayingWorkerId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>KONFIRMASI BAYAR</span>
              <button type="button" onClick={() => setPayingWorkerId(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 16px" }}>{payingWorker.name}. <em>Upah.</em></h2>
            <div className="py-4 px-0" style={{ borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Total Upah</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, fontWeight: 500, color: "var(--kas-rust)" }}>{fmtIDR(payingOwed)}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4 }}>{payingDays} hari · {fmtIDR(payingWorker.rate)}/hari</div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button type="button" onClick={() => setPayingWorkerId(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button type="button" onClick={() => { setPaidSet((s) => { const n = new Set(s); n.add(payingWorkerId); return n; }); setPayingWorkerId(null); }} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Konfirmasi Bayar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
