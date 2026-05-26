"use client";
import { useState } from "react";
import { MATERIAL_REQUESTS, CHANGE_ORDERS, PROJECTS } from "@/lib/data";
import { Kicker, DisplayHeading } from "../ui";

export type ReqSubTab = "material" | "changeorder";

export function RequestsSubTabs({ active, setActive }: { active: ReqSubTab; setActive: (t: ReqSubTab) => void }) {
  const tabs: { k: ReqSubTab; l: string }[] = [
    { k: "material",    l: "Material"     },
    { k: "changeorder", l: "Change Order" },
  ];
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
      {tabs.map((t, i) => (
        <button
          key={t.k}
          onClick={() => setActive(t.k)}
          style={{
            border: "none",
            borderRight: i < 1 ? "1px solid var(--kas-line)" : "none",
            borderTop: active === t.k ? "2px solid var(--kas-ink)" : "2px solid transparent",
            background: active === t.k ? "var(--kas-ink)" : "transparent",
            color: active === t.k ? "var(--kas-paper)" : "var(--kas-ink-3)",
            padding: "10px 0",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {t.l}
        </button>
      ))}
    </div>
  );
}

function MaterialRequests({ toast }: { toast: (m: string) => void }) {
  const [reqs, setReqs] = useState(MATERIAL_REQUESTS);
  const approve = (id: string) => { setReqs((r) => r.map((x) => x.id === id ? { ...x, status: "Disetujui" as const } : x)); toast("Permintaan material disetujui."); };
  const reject  = (id: string) => { setReqs((r) => r.map((x) => x.id === id ? { ...x, status: "Ditolak"   as const } : x)); toast("Permintaan material ditolak."); };

  const pending = reqs.filter((r) => r.status === "Pending");
  const done    = reqs.filter((r) => r.status !== "Pending");

  return (
    <>
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
              {req.note && (
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 13, color: "var(--kas-ink-2)", fontStyle: "italic", marginBottom: 10 }}>{req.note}</div>
              )}
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => approve(req.id)} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Setujui</button>
                <button onClick={() => reject(req.id)}  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tolak</button>
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

function ChangeOrders({ toast }: { toast: (m: string) => void }) {
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

export default function AMRequests({ sub, toast }: { sub: ReqSubTab; toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      {sub === "material"    && <MaterialRequests toast={toast} />}
      {sub === "changeorder" && <ChangeOrders toast={toast} />}
    </div>
  );
}
