"use client";
import { useEffect, useRef, useState } from "react";
import { useProjects } from "@/lib/projects-store";
import { useMaterialRequests } from "@/lib/stores";
import { Kicker, DisplayHeading } from "@/components/primitives";
import { BossConfirmDialog } from "@/components/admin/boss-confirm";

export function MaterialRequestsTab({ toast }: { toast: (m: string) => void }) {
  const PROJECTS = useProjects();
  const MATERIAL_REQUESTS = useMaterialRequests();
  const [reqs, setReqs]               = useState(MATERIAL_REQUESTS);
  // Seed local editable list from live material requests once they hydrate.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && MATERIAL_REQUESTS.length > 0) {
      setReqs(MATERIAL_REQUESTS);
      seeded.current = true;
    }
  }, [MATERIAL_REQUESTS]);
  const [confirmId, setConfirmId]     = useState<string | null>(null);
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

  const doApprove = (id: string) => { setReqs((r) => r.map((x) => x.id === id ? { ...x, status: "Disetujui" as const } : x)); toast("Permintaan material disetujui."); };
  const doReject  = (id: string) => { setReqs((r) => r.map((x) => x.id === id ? { ...x, status: "Ditolak"   as const } : x)); toast("Permintaan material ditolak."); };

  const pending = reqs.filter((r) => r.status === "Pending");
  const done    = reqs.filter((r) => r.status !== "Pending");

  return (
    <>
      {confirmId && (
        <BossConfirmDialog
          onConfirm={() => { doApprove(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {rejectConfirmId && (
        <BossConfirmDialog
          message="Apakah bos sudah menyetujui penolakan permintaan ini?"
          onConfirm={() => { doReject(rejectConfirmId); setRejectConfirmId(null); }}
          onCancel={() => setRejectConfirmId(null)}
        />
      )}
      <Kicker no="A" label={`MATERIAL · ${pending.length} PENDING`} />
      <DisplayHeading size={26}>Material,<br /><em>menunggu persetujuan.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: pending.length > 0 ? "1px solid var(--kas-ink)" : "1px solid var(--kas-line)" }}>
        {pending.length === 0 ? (
          <div className="py-4" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>
            Tidak ada permintaan material pending.
          </div>
        ) : (
          pending.map((req) => (
            <div key={req.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-start mb-1">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17 }}>{req.materialName}</div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600 }}>{req.qty} {req.unit}</span>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", marginBottom: req.note ? 6 : 10 }}>
                {req.workerName} · {PROJECTS.find((p) => p.id === req.projectId)?.code} · {req.date}
              </div>
              {req.note && <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 13, color: "var(--kas-ink-2)", fontStyle: "italic", marginBottom: 10 }}>{req.note}</div>}
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => setConfirmId(req.id)} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                <button onClick={() => setRejectConfirmId(req.id)} style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tolak</button>
              </div>
            </div>
          ))
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-3">
          <Kicker no="—" label="SUDAH DIPROSES" />
          <div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {done.map((req) => (
              <div key={req.id} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>{req.materialName}</span>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{req.qty} {req.unit} · {req.workerName}</div>
                </div>
                <span style={{ padding: "2px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: req.status === "Disetujui" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)", color: req.status === "Disetujui" ? "var(--kas-moss-ink)" : "var(--kas-ink-3)" }}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
