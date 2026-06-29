"use client";
import { useState } from "react";
import { useWorkReports, useMaterialRequests } from "@/lib/stores";
import { SectionHead } from "../shared";

export function WorkReportsTab({ projectId }: { projectId: string }) {
  const WORK_REPORTS = useWorkReports();
  const MATERIAL_REQUESTS = useMaterialRequests();
  const reports  = WORK_REPORTS.filter((r) => r.projectId === projectId);
  const requests = MATERIAL_REQUESTS.filter((r) => r.projectId === projectId);
  const [reqStatuses, setReqStatuses] = useState<Record<string, "Pending" | "Disetujui" | "Ditolak">>(() =>
    Object.fromEntries(MATERIAL_REQUESTS.map((r) => [r.id, r.status as "Pending" | "Disetujui" | "Ditolak"]))
  );
  const pendingReqs = requests.filter((r) => reqStatuses[r.id] === "Pending").length;

  return (
    <div className="grid gap-9" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
      <div>
        <SectionHead no="01" kicker={`${reports.length} LAPORAN`}>Catatan harian, <em>lapangan.</em></SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {reports.map((r) => (
            <div key={r.id} className="grid gap-4 items-start py-4" style={{ gridTemplateColumns: "40px 1fr", borderBottom: "1px solid var(--kas-line)" }}>
              <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontWeight: 500 }}>{r.workerShort}</div>
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{r.workerName}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{r.date}</span>
                </div>
                <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.5, color: "var(--kas-ink-2)", margin: 0 }}>{r.note}</p>
                {r.photos > 0 && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-cobalt)", marginTop: 6, letterSpacing: "0.14em", textTransform: "uppercase" }}>{r.photos} foto terlampir</div>}
              </div>
            </div>
          ))}
          {reports.length === 0 && <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Belum ada laporan.</div>}
        </div>
      </div>
      <div>
        <SectionHead no="02" kicker={`${pendingReqs} PENDING`}>Permintaan <em>material.</em></SectionHead>
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {requests.map((req) => {
            const status = reqStatuses[req.id];
            return (
              <div key={req.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{req.materialName}</span>
                  <span style={{ padding: "2px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", background: status === "Pending" ? "var(--kas-ochre-soft)" : status === "Disetujui" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)", color: status === "Pending" ? "var(--kas-ochre-ink)" : status === "Disetujui" ? "var(--kas-moss-ink)" : "var(--kas-ink-3)" }}>{status}</span>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>{req.qty} {req.unit} · {req.workerName} · {req.date}</div>
                {req.note && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-2)", marginTop: 4, fontStyle: "italic" }}>{req.note}</div>}
                {status === "Pending" && (
                  <div className="flex gap-1.5 mt-2.5">
                    <button type="button" onClick={() => setReqStatuses((p) => ({ ...p, [req.id]: "Disetujui" }))} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                    <button type="button" onClick={() => setReqStatuses((p) => ({ ...p, [req.id]: "Ditolak" }))} style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", color: "var(--kas-ink-3)" }}>Tolak</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
