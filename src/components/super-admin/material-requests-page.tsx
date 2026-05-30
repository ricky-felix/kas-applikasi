"use client";
import { useState } from "react";
import { MATERIAL_REQUESTS, PROJECTS } from "@/lib/data";
import { TopBar, SectionHead, Footer } from "./shared";

type MatStatus = "Pending" | "Disetujui" | "Ditolak";
type Confirm = { id: string; action: "Disetujui" | "Ditolak"; label: string } | null;

export default function MaterialRequestsPage() {
  const [matFilter, setMatFilter] = useState<MatStatus | "all">("all");
  const [matStatuses, setMatStatuses] = useState<Record<string, MatStatus>>(
    () => Object.fromEntries(MATERIAL_REQUESTS.map((r) => [r.id, r.status]))
  );
  const [confirm, setConfirm] = useState<Confirm>(null);

  const doConfirm = () => {
    if (!confirm) return;
    setMatStatuses((p) => ({ ...p, [confirm.id]: confirm.action }));
    setConfirm(null);
  };

  const pendingCount = MATERIAL_REQUESTS.filter((r) => matStatuses[r.id] === "Pending").length;
  const visibleMat   = MATERIAL_REQUESTS.filter(
    (r) => matFilter === "all" || matStatuses[r.id] === matFilter
  );

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    Pending:   { bg: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)" },
    Disetujui: { bg: "var(--kas-moss-soft)",  color: "var(--kas-moss-ink)"  },
    Ditolak:   { bg: "var(--kas-paper-2)",    color: "var(--kas-ink-3)"     },
  };

  return (
    <>
    {confirm && (
      <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setConfirm(null)}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 380, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 12 }}>Konfirmasi</div>
          <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 400, letterSpacing: "-0.01em", margin: "0 0 20px" }}>{confirm.label}</p>
          <div className="flex gap-2.5 justify-end">
            <button onClick={() => setConfirm(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "10px 20px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
            <button onClick={doConfirm} style={{ background: confirm.action === "Disetujui" ? "var(--kas-ink)" : "var(--kas-rust)", color: "var(--kas-paper)", border: "none", padding: "10px 20px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
              {confirm.action === "Disetujui" ? "Ya, Setujui" : "Ya, Tolak"}
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="px-9 py-7 pb-14">
      <TopBar title="Permintaan Material" />
      <SectionHead no="11a" kicker={`${pendingCount} MENUNGGU KEPUTUSAN`}>
        Material, <em>perlu ditindak.</em>
      </SectionHead>

      <div className="flex items-center justify-between mb-5" style={{ borderTop: "1px solid var(--kas-ink)", paddingTop: 14 }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
          {visibleMat.length} permintaan
        </div>
        <div className="flex gap-1.5">
          {(["all", "Pending", "Disetujui", "Ditolak"] as const).map((s) => {
            const active = matFilter === s;
            const count  = s === "all" ? MATERIAL_REQUESTS.length : MATERIAL_REQUESTS.filter((r) => matStatuses[r.id] === s).length;
            return (
              <button key={s} type="button" onClick={() => setMatFilter(s)}
                style={{ border: `1px solid ${active ? "var(--kas-ink)" : "var(--kas-line)"}`, background: active ? "var(--kas-ink)" : "var(--kas-paper)", color: active ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "5px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                {s === "all" ? "Semua" : s} · {count}
              </button>
            );
          })}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "10px 14px 10px 0" }}>Material</th>
            <th style={{ textAlign: "left", padding: "10px 14px" }}>Pekerja</th>
            <th style={{ textAlign: "left", padding: "10px 14px" }}>Proyek</th>
            <th style={{ textAlign: "right", padding: "10px 14px" }}>Jumlah</th>
            <th style={{ textAlign: "center", padding: "10px 14px" }}>Status</th>
            <th style={{ textAlign: "right", padding: "10px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {visibleMat.map((r) => {
            const status = matStatuses[r.id];
            const st     = STATUS_STYLE[status] ?? STATUS_STYLE.Ditolak;
            const proj   = PROJECTS.find((p) => p.id === r.projectId);
            return (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <td style={{ padding: "14px 14px 14px 0" }}>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{r.materialName}</div>
                  {r.note && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{r.note}</div>}
                </td>
                <td style={{ padding: "14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.workerName}</td>
                <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>
                  {proj?.code}<br /><span style={{ fontSize: 9 }}>{r.date}</span>
                </td>
                <td style={{ padding: "14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600 }}>
                  {r.qty} <span style={{ fontSize: 9, color: "var(--kas-ink-3)" }}>{r.unit}</span>
                </td>
                <td style={{ padding: "14px", textAlign: "center" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", background: st.bg, color: st.color, padding: "3px 8px", border: "1px solid var(--kas-line)" }}>{status}</span>
                </td>
                <td style={{ padding: "14px", textAlign: "right" }}>
                  {status === "Pending" && (
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setConfirm({ id: r.id, action: "Disetujui", label: `Setujui permintaan ${r.materialName} dari ${r.workerName}?` })} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "5px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                      <button onClick={() => setConfirm({ id: r.id, action: "Ditolak",   label: `Tolak permintaan ${r.materialName} dari ${r.workerName}?` })}   style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "5px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Tolak</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Footer />
    </div>
    </>
  );
}
