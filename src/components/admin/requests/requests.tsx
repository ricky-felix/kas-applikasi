"use client";
import { useEffect, useRef, useState } from "react";
import { fmtIDRshort } from "@/lib/data";
import type { MaterialRequest, ChangeOrder } from "@/lib/data";
import { useProjects } from "@/lib/projects-store";
import { useMaterialRequests, useChangeOrders } from "@/lib/stores";
import { Kicker } from "@/components/primitives";
import { BossConfirmDialog } from "@/components/admin/boss-confirm";

type Confirm = { id: string; kind: "material" | "co"; action: "approve" | "reject" };

function ActionButtons({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <button
        onClick={onApprove}
        style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "11px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
      >
        Setujui
      </button>
      <button
        onClick={onReject}
        style={{ border: "1px solid var(--kas-line)", background: "transparent", color: "var(--kas-ink-2)", padding: "11px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
      >
        Tolak
      </button>
    </div>
  );
}

function TypeChip({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 7px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid var(--kas-line)", color: "var(--kas-ink-3)", marginBottom: 8 }}>
      {label}
    </span>
  );
}

function MaterialCard({ req, onApprove, onReject }: { req: MaterialRequest; onApprove: () => void; onReject: () => void }) {
  const PROJECTS = useProjects();
  const project = PROJECTS.find(p => p.id === req.projectId);
  return (
    <div className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
      <TypeChip label="Material" />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.2 }}>
          {req.materialName}
        </div>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{req.qty}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 2 }}>{req.unit}</div>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", lineHeight: 1.8 }}>
        <span style={{ color: "var(--kas-ink-2)", fontWeight: 600 }}>{project?.code ?? req.projectId}</span>
        {" · "}{req.workerName}
        {" · "}{req.date}
      </div>
      {req.note && (
        <div className="mt-2 px-3 py-2" style={{ background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontStyle: "italic", color: "var(--kas-ink-2)", lineHeight: 1.5 }}>
          "{req.note}"
        </div>
      )}
      <ActionButtons onApprove={onApprove} onReject={onReject} />
    </div>
  );
}

function ChangeOrderCard({ co, onApprove, onReject }: { co: ChangeOrder; onApprove: () => void; onReject: () => void }) {
  const PROJECTS = useProjects();
  const project = PROJECTS.find(p => p.id === co.projectId);
  return (
    <div className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
      <TypeChip label="Ubah Order" />
      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.35, marginBottom: 8 }}>
        {co.description}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", lineHeight: 1.8 }}>
          <span style={{ color: "var(--kas-ink-2)", fontWeight: 600 }}>{project?.code ?? co.projectId}</span>
          {" · "}{co.requestedBy}
          {" · "}{co.date}
        </div>
        <div style={{ flexShrink: 0, marginLeft: 12, textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 700, color: "var(--kas-rust)", letterSpacing: "0.04em" }}>
            +{fmtIDRshort(co.costImpact)}
          </div>
        </div>
      </div>
      <ActionButtons onApprove={onApprove} onReject={onReject} />
    </div>
  );
}

function DoneRow({ label, sub, status, kind }: { label: string; sub: string; status: string; kind: "material" | "co" }) {
  const approved = status === "Disetujui";
  return (
    <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-4)" }}>
            {kind === "material" ? "MAT" : "CO"}
          </span>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.2 }} className="truncate">{label}</span>
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.06em" }}>{sub}</div>
      </div>
      <span
        style={{
          flexShrink: 0,
          padding: "2px 8px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 8,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          background: approved ? "var(--kas-moss-soft)" : "var(--kas-paper-2)",
          color: approved ? "var(--kas-moss-ink)" : "var(--kas-ink-3)",
        }}
      >
        {status}
      </span>
    </div>
  );
}

export default function AMRequests({ toast }: { toast: (m: string) => void }) {
  const MATERIAL_REQUESTS = useMaterialRequests();
  const CHANGE_ORDERS     = useChangeOrders();
  const [matReqs, setMatReqs] = useState(MATERIAL_REQUESTS);
  const [cos, setCos]         = useState(CHANGE_ORDERS);
  // Seed local editable lists from live data once they hydrate.
  const seededMat = useRef(false);
  const seededCo  = useRef(false);
  useEffect(() => {
    if (!seededMat.current && MATERIAL_REQUESTS.length > 0) {
      setMatReqs(MATERIAL_REQUESTS);
      seededMat.current = true;
    }
  }, [MATERIAL_REQUESTS]);
  useEffect(() => {
    if (!seededCo.current && CHANGE_ORDERS.length > 0) {
      setCos(CHANGE_ORDERS);
      seededCo.current = true;
    }
  }, [CHANGE_ORDERS]);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  function resolve(c: Confirm) {
    const approved = c.action === "approve";
    if (c.kind === "material") {
      setMatReqs(r => r.map(x => x.id === c.id ? { ...x, status: approved ? "Disetujui" as const : "Ditolak" as const } : x));
      toast(approved ? "Permintaan material disetujui." : "Permintaan material ditolak.");
    } else {
      setCos(r => r.map(x => x.id === c.id ? { ...x, status: approved ? "Disetujui" as const : "Ditolak" as const } : x));
      toast(approved ? "Ubah Order disetujui." : "Ubah Order ditolak.");
    }
  }

  const pendingMat = matReqs.filter(r => r.status === "Pending");
  const pendingCo  = cos.filter(c => c.status === "Menunggu");
  const doneMat    = matReqs.filter(r => r.status !== "Pending");
  const doneCo     = cos.filter(c => c.status !== "Menunggu");
  const totalPending = pendingMat.length + pendingCo.length;

  return (
    <div className="px-5 pt-4 pb-8">
      {confirm && (
        <BossConfirmDialog
          message={confirm.action === "reject"
            ? `Apakah bos sudah menyetujui penolakan ${confirm.kind === "material" ? "permintaan material" : "ubah order"} ini?`
            : undefined}
          onConfirm={() => { resolve(confirm); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
        03 · Permintaan
      </div>
      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 20 }}>
        {totalPending > 0
          ? <><span style={{ color: "var(--kas-rust)" }}>{totalPending}</span> perlu<br /><em>ditindaklanjuti.</em></>
          : <>Semua<br /><em>sudah diproses.</em></>}
      </div>

      {/* Pending — Material */}
      {pendingMat.length > 0 && (
        <div className="mb-2">
          <Kicker no="A" label={`Material · ${pendingMat.length} Pending`} />
          <div style={{ borderTop: "1px solid var(--kas-rust)" }}>
            {pendingMat.map(req => (
              <MaterialCard
                key={req.id}
                req={req}
                onApprove={() => setConfirm({ id: req.id, kind: "material", action: "approve" })}
                onReject={() => setConfirm({ id: req.id, kind: "material", action: "reject" })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending — Change Orders */}
      {pendingCo.length > 0 && (
        <div className="mb-2">
          <Kicker no="B" label={`Ubah Order · ${pendingCo.length} Pending`} />
          <div style={{ borderTop: "1px solid var(--kas-rust)" }}>
            {pendingCo.map(co => (
              <ChangeOrderCard
                key={co.id}
                co={co}
                onApprove={() => setConfirm({ id: co.id, kind: "co", action: "approve" })}
                onReject={() => setConfirm({ id: co.id, kind: "co", action: "reject" })}
              />
            ))}
          </div>
        </div>
      )}

      {totalPending === 0 && (
        <div className="py-5" style={{ borderTop: "1px solid var(--kas-line)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>
          Tidak ada permintaan yang menunggu.
        </div>
      )}

      {/* Done */}
      {(doneMat.length > 0 || doneCo.length > 0) && (
        <div className="mt-4">
          <Kicker no="—" label="Sudah Diproses" />
          <div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {doneMat.map(req => (
              <DoneRow key={req.id} kind="material" label={req.materialName} sub={`${req.qty} ${req.unit} · ${req.workerName}`} status={req.status} />
            ))}
            {doneCo.map(co => (
              <DoneRow key={co.id} kind="co" label={co.description} sub={co.requestedBy} status={co.status} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
