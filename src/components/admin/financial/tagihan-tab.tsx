"use client";
import { useEffect, useRef, useState } from "react";
import { fmtIDR, fmtIDRshort, type ProofSubmission } from "@/lib/data";
import { useProjects } from "@/lib/projects-store";
import { useProofSubmissions } from "@/lib/stores";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";
import { BossConfirmDialog } from "@/components/admin/boss-confirm";

function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}

const STAGE_LABELS = ["DP (30%)", "Termin 1 (30%)", "Termin 2 (20%)", "Pelunasan (20%)"];
const STAGE_PCTS   = [0.3, 0.3, 0.2, 0.2];

function deriveStages(contractValue: number, paid: number) {
  const amounts = STAGE_PCTS.map((pct, i) =>
    i < 3 ? Math.round(contractValue * pct) : contractValue - Math.round(contractValue * 0.3) * 2 - Math.round(contractValue * 0.2)
  );
  let cumulative = 0;
  return amounts.map((amount, i) => {
    cumulative += amount;
    return { label: STAGE_LABELS[i], amount, paid: paid >= cumulative };
  });
}

export function TagihanTab({ toast }: { toast: (m: string) => void }) {
  const PROJECTS = useProjects();
  const PROOF_SUBMISSIONS = useProofSubmissions();
  const outstanding = PROJECTS.filter((p) => p.contractValue > p.paid);
  const total = outstanding.reduce((s, p) => s + (p.contractValue - p.paid), 0);

  const [approved, setApproved]   = useState<Set<string>>(new Set());
  const [proofs, setProofs]       = useState<ProofSubmission[]>(PROOF_SUBMISSIONS);
  // Seed local proof inbox from live proof submissions once they hydrate.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && PROOF_SUBMISSIONS.length > 0) {
      setProofs(PROOF_SUBMISSIONS);
      seeded.current = true;
    }
  }, [PROOF_SUBMISSIONS]);
  const [openProofId, setOpenProofId] = useState<string | null>(null);
  const [confirmStage, setConfirmStage] = useState<{ pid: string; idx: number } | null>(null);
  const [confirmProof, setConfirmProof] = useState<ProofSubmission | null>(null);

  const doApproveStage = (pid: string, idx: number) => {
    setApproved((prev) => { const n = new Set(prev); n.add(`${pid}-${idx}`); return n; });
    toast(`${STAGE_LABELS[idx]} ditandai lunas.`);
  };

  const doApproveProof = (ps: ProofSubmission) => {
    setApproved((prev) => { const n = new Set(prev); n.add(`${ps.projectId}-${ps.stageIdx}`); return n; });
    setProofs((prev) => prev.filter((p) => p.id !== ps.id));
    setOpenProofId(null);
    toast(`${ps.stageLabel} disetujui.`);
  };

  const approveProof = (ps: ProofSubmission) => setConfirmProof(ps);

  const rejectProof = (ps: ProofSubmission) => {
    setProofs((prev) => prev.filter((p) => p.id !== ps.id));
    setOpenProofId(null);
    toast("Bukti ditolak.");
  };

  return (
    <>
      {confirmStage && (
        <BossConfirmDialog
          onConfirm={() => { doApproveStage(confirmStage.pid, confirmStage.idx); setConfirmStage(null); }}
          onCancel={() => setConfirmStage(null)}
        />
      )}
      {confirmProof && (
        <BossConfirmDialog
          onConfirm={() => { doApproveProof(confirmProof); setConfirmProof(null); }}
          onCancel={() => setConfirmProof(null)}
        />
      )}
      <Kicker no="A" label={`${outstanding.length} BELUM LUNAS`} />
      <DisplayHeading size={26}>Tagihan,<br /><em>aktif.</em></DisplayHeading>

      <div className="mt-4 p-4" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
        <MonoLabel size={10} color="rgba(255,255,255,0.6)">Total Outstanding</MonoLabel>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 34, fontWeight: 500, marginTop: 6, color: "var(--kas-rust)" }}>
          {fmtIDR(total)}
        </div>
      </div>

      {/* Proof inbox */}
      {proofs.length > 0 && (
        <div className="mt-4" style={{ border: "1px solid var(--kas-ochre)", background: "var(--kas-ochre-soft)" }}>
          <div className="px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--kas-ochre)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ochre-ink)", fontWeight: 700 }}>
              ● {proofs.length} Bukti Transfer Masuk
            </span>
          </div>
          {proofs.map((ps) => {
            const proj = PROJECTS.find((p) => p.id === ps.projectId);
            const isOpen = openProofId === ps.id;
            return (
              <div key={ps.id} style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div className="flex justify-between items-start px-3.5 py-3">
                  <div>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>{proj?.client.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ochre-ink)", marginTop: 1, letterSpacing: "0.08em" }}>
                      {ps.stageLabel} · {fmtIDRshort(ps.amount)}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.06em" }}>
                      {ps.submittedAt}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenProofId(isOpen ? null : ps.id)}
                    style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}
                  >
                    {isOpen ? "Tutup" : "Lihat"}
                  </button>
                </div>
                {isOpen && (
                  <div style={{ background: "var(--kas-paper)", borderTop: "1px solid var(--kas-line)", padding: "12px 14px" }}>
                    <div style={{ border: "1px dashed var(--kas-line)", padding: "16px", textAlign: "center", color: "var(--kas-ink-3)", marginBottom: 12 }}>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em" }}>{ps.fileName}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, marginTop: 2, color: "var(--kas-ink-4)" }}>{ps.fileType === "pdf" ? "PDF" : "Gambar"}</div>
                    </div>
                    {ps.note && <div style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 13, color: "var(--kas-ink-2)", marginBottom: 10 }}>"{ps.note}"</div>}
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <button type="button" onClick={() => approveProof(ps)} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "9px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                        ✓ Setujui
                      </button>
                      <button type="button" onClick={() => rejectProof(ps)} style={{ background: "transparent", color: "var(--kas-ink-3)", border: "1px solid var(--kas-line)", padding: "9px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                        Tolak
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {outstanding.map((p) => {
          const sisa = p.contractValue - p.paid;
          const stages = deriveStages(p.contractValue, p.paid);
          const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan proyek *${p.name}* senilai *${fmtIDRshort(sisa)}* belum dilunasi.\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`);
          const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;

          return (
            <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              {/* Project header */}
              <div className="flex justify-between items-baseline mb-3">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{p.client.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(sisa)}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginBottom: 12, letterSpacing: "0.1em" }}>
                {p.code} · {p.name}
              </div>

              {/* Per-stage breakdown */}
              <div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
                {stages.map((s, idx) => {
                  const isApproved = s.paid || approved.has(`${p.id}-${idx}`);
                  const prevApproved = idx === 0 || stages[idx - 1].paid || approved.has(`${p.id}-${idx - 1}`);
                  return (
                    <div key={idx} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.08em", color: isApproved ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                          {s.label}
                        </div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600, marginTop: 1, color: isApproved ? "var(--kas-ink-3)" : "var(--kas-ink)", textDecoration: isApproved ? "none" : "none" }}>
                          {fmtIDR(s.amount)}
                        </div>
                      </div>
                      {isApproved ? (
                        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", padding: "3px 8px", background: "var(--kas-moss-soft)", color: "var(--kas-moss-ink)" }}>
                          Lunas
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!prevApproved}
                          onClick={() => setConfirmStage({ pid: p.id, idx })}
                          style={{
                            border: "1px solid var(--kas-ink)",
                            background: prevApproved ? "var(--kas-ink)" : "transparent",
                            color: prevApproved ? "var(--kas-paper)" : "var(--kas-ink-3)",
                            padding: "5px 10px",
                            fontFamily: "var(--font-jetbrains), monospace",
                            fontSize: 8,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            cursor: prevApproved ? "pointer" : "not-allowed",
                            borderColor: prevApproved ? "var(--kas-ink)" : "var(--kas-line)",
                          }}
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* WA button */}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 mt-3" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
                <WAIcon /> Tagih via WhatsApp
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
