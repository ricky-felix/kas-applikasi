"use client";
import { useEffect, useRef, useState } from "react";
import { useProjects } from "@/lib/projects-store";
import { useMaterialRequests } from "@/lib/stores";
import { Kicker, DisplayHeading } from "@/components/primitives";

export default function AMMaterialRequests({ onBack, toast }: { onBack: () => void; toast: (m: string) => void }) {
  const MATERIAL_REQUESTS = useMaterialRequests();
  const PROJECTS = useProjects();
  const [requests, setRequests] = useState(MATERIAL_REQUESTS);
  // Seed local editable list from live material requests once they hydrate.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && MATERIAL_REQUESTS.length > 0) {
      setRequests(MATERIAL_REQUESTS);
      seeded.current = true;
    }
  }, [MATERIAL_REQUESTS]);
  const approve = (id: string) => { setRequests((r) => r.map((x) => x.id === id ? { ...x, status: "Disetujui" as const } : x)); toast("Permintaan disetujui."); };
  const reject  = (id: string) => { setRequests((r) => r.map((x) => x.id === id ? { ...x, status: "Ditolak" as const } : x)); toast("Permintaan ditolak."); };
  const pending = requests.filter((r) => r.status === "Pending");
  const done    = requests.filter((r) => r.status !== "Pending");

  return (
    <div className="px-5 pt-4 pb-6">
      <button onClick={onBack} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 10px" }}>← Kembali</button>
      <Kicker no="07" label={`${pending.length} PENDING`} />
      <DisplayHeading size={26}>Permintaan<br /><em>material.</em></DisplayHeading>

      {pending.length > 0 && (
        <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {pending.map((req) => (
            <div key={req.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-start mb-1.5">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17 }}>{req.materialName}</div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600 }}>{req.qty} {req.unit}</span>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>{req.workerName} · {PROJECTS.find((p) => p.id === req.projectId)?.code} · {req.date}</div>
              {req.note && <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, color: "var(--kas-ink-2)", marginBottom: 8, fontStyle: "italic" }}>{req.note}</div>}
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => approve(req.id)} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                <button onClick={() => reject(req.id)} style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tolak</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-4">
          <Kicker no="—" label="SUDAH DIPROSES" />
          <div style={{ borderTop: "1px solid var(--kas-line)" }}>
            {done.map((req) => (
              <div key={req.id} className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{req.materialName}</span>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{req.qty} {req.unit} · {req.workerName}</div>
                </div>
                <span style={{ padding: "2px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: req.status === "Disetujui" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)", color: req.status === "Disetujui" ? "var(--kas-moss-ink)" : "var(--kas-ink-3)" }}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
