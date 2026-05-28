"use client";
import { useState } from "react";
import { CHANGE_ORDERS, PROJECTS } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";

export function ChangeOrderTab({ toast }: { toast: (m: string) => void }) {
  const [cos, setCos] = useState(CHANGE_ORDERS);
  const approve = (id: string) => { setCos((r) => r.map((x) => x.id === id ? { ...x, status: "Disetujui" as const } : x)); toast("Change order disetujui."); };
  const reject  = (id: string) => { setCos((r) => r.map((x) => x.id === id ? { ...x, status: "Ditolak"   as const } : x)); toast("Change order ditolak."); };

  const pending = cos.filter((c) => c.status === "Menunggu");
  const done    = cos.filter((c) => c.status !== "Menunggu");

  return (
    <>
      <Kicker no="B" label={`CHANGE ORDER · ${pending.length} PENDING`} />
      <DisplayHeading size={26}>Change Order,<br /><em>menunggu persetujuan.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: pending.length > 0 ? "1px solid var(--kas-ink)" : "1px solid var(--kas-line)" }}>
        {pending.length === 0 ? (
          <div className="py-4" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>
            Tidak ada change order pending.
          </div>
        ) : (
          pending.map((co) => (
            <div key={co.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.3, marginBottom: 4 }}>{co.description}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>
                {PROJECTS.find((p) => p.id === co.projectId)?.code} · {co.date} · oleh {co.requestedBy}
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 700, color: "var(--kas-rust)", marginBottom: 10 }}>
                +Rp {co.costImpact.toLocaleString("id-ID")}
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => approve(co.id)} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                <button onClick={() => reject(co.id)}  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tolak</button>
              </div>
            </div>
          ))
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-3">
          <Kicker no="—" label="SUDAH DIPROSES" />
          <div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {done.map((co) => (
              <div key={co.id} className="flex justify-between items-start py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.3 }}>{co.description}</span>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{co.requestedBy} · {co.date}</div>
                </div>
                <span style={{ padding: "2px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0, background: co.status === "Disetujui" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)", color: co.status === "Disetujui" ? "var(--kas-moss-ink)" : "var(--kas-ink-3)" }}>{co.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
