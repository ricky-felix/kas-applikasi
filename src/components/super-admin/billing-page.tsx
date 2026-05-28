"use client";
import { useState } from "react";
import { PROJECTS, PROOF_SUBMISSIONS, fmtIDR, fmtIDRshort, type ProofSubmission } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer, WAIcon } from "./shared";

// ── Billing stage derivation (same logic as billing-tab) ────────────────────
const STAGE_LABELS = ["DP (30%)", "Termin 1 (30%)", "Termin 2 (20%)", "Pelunasan (20%)"];
const STAGE_PCTS   = [0.3, 0.3, 0.2, 0.2];

function deriveStages(contractValue: number, paid: number) {
  const amounts = STAGE_PCTS.map((pct, i) =>
    i < 3
      ? Math.round(contractValue * pct)
      : contractValue - Math.round(contractValue * 0.3) * 2 - Math.round(contractValue * 0.2)
  );
  let cumulative = 0;
  return amounts.map((amount, i) => {
    cumulative += amount;
    return { idx: i, label: STAGE_LABELS[i], amount, paid: paid >= cumulative };
  });
}

// ── Log entry component (Bukti Masuk section) ───────────────────────────────
function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4h10l6 6v10H4V4z" /><path d="M14 4v6h6" />
    </svg>
  );
}

function LogEntry({ ps, project, open, onToggle, onApprove, onReject }: {
  ps: ProofSubmission; project: typeof PROJECTS[0];
  open: boolean; onToggle: () => void; onApprove: () => void; onReject: () => void;
}) {
  const time = ps.submittedAt.split(", ")[1] ?? ps.submittedAt;
  return (
    <div style={{ borderBottom: "1px solid var(--kas-line)" }}>
      <button type="button" onClick={onToggle} className="w-full text-left" style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", alignItems: "start", padding: "14px 0", background: "transparent", border: "none", cursor: "pointer", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--kas-ochre)", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{time}</span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{project.client.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>{ps.stageLabel} · {fmtIDRshort(ps.amount)} · {project.code}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 2 }}>{ps.fileName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 16 }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: open ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{open ? "Tutup" : "Lihat"}</span>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, color: "var(--kas-ink-3)", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </button>
      {open && (
        <div style={{ paddingLeft: 40, paddingBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid var(--kas-line)", background: "var(--kas-paper)", marginBottom: 14 }}>
            <span style={{ color: "var(--kas-ink-3)", flexShrink: 0 }}><FileIcon /></span>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600 }}>{ps.fileName}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{ps.fileType === "pdf" ? "Dokumen PDF" : "Gambar"} · Dikirim {ps.submittedAt}</div>
            </div>
          </div>
          {ps.note && <div style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 14, color: "var(--kas-ink-2)", marginBottom: 14 }}>"{ps.note}"</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onApprove} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "9px 20px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>✓ Setujui &amp; Tandai Lunas</button>
            <button type="button" onClick={onReject} style={{ background: "transparent", color: "var(--kas-ink-3)", border: "1px solid var(--kas-line)", padding: "9px 16px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tolak</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline stage tab panel ───────────────────────────────────────────────────
function StageTabs({ project, pendingStages, proofsByStage, onApprove, onReject }: {
  project: typeof PROJECTS[0];
  pendingStages: { idx: number; label: string; amount: number }[];
  proofsByStage: Record<number, ProofSubmission>;
  onApprove: (ps: ProofSubmission) => void;
  onReject:  (ps: ProofSubmission) => void;
}) {
  const [active, setActive] = useState(pendingStages[0]?.idx ?? 0);
  const stage = pendingStages.find((s) => s.idx === active)!;
  const proof = proofsByStage[active];

  return (
    <div>
      {/* Tab bar */}
      {pendingStages.length > 1 && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--kas-line)" }}>
          {pendingStages.map((s) => {
            const hasProof = !!proofsByStage[s.idx];
            const isActive = s.idx === active;
            return (
              <button
                key={s.idx}
                type="button"
                onClick={() => setActive(s.idx)}
                style={{
                  padding: "9px 16px",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--kas-ink)" : "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: isActive ? "var(--kas-ink)" : "var(--kas-ink-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {hasProof && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--kas-ochre)", display: "inline-block" }} />
                )}
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab content */}
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Tahap</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{stage.label}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-rust)", marginTop: 2 }}>{fmtIDR(stage.amount)}</div>
          </div>
          {proof ? (
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Dikirim</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{proof.submittedAt}</div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-4)", padding: "4px 10px", border: "1px dashed var(--kas-line)" }}>
                Menunggu bukti dari klien
              </span>
            </div>
          )}
        </div>

        {proof && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--kas-line)", background: "var(--kas-paper)", marginBottom: 12 }}>
              <span style={{ color: "var(--kas-ink-3)", flexShrink: 0 }}><FileIcon /></span>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600 }}>{proof.fileName}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{proof.fileType === "pdf" ? "Dokumen PDF" : "Gambar"}</div>
              </div>
            </div>
            {proof.note && (
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 14, color: "var(--kas-ink-2)", marginBottom: 12 }}>"{proof.note}"</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => onApprove(proof)} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "8px 18px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                ✓ Setujui &amp; Tandai Lunas
              </button>
              <button type="button" onClick={() => onReject(proof)} style={{ background: "transparent", color: "var(--kas-ink-3)", border: "1px solid var(--kas-line)", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                Tolak
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const total       = PROJECTS.reduce((s, p) => s + p.contractValue, 0);
  const paid        = PROJECTS.reduce((s, p) => s + p.paid, 0);
  const outstanding = total - paid;

  type ResolvedProof = ProofSubmission & { resolution: "approved" | "rejected" };

  const [pending,      setPending]      = useState<ProofSubmission[]>(PROOF_SUBMISSIONS);
  const [resolved,     setResolved]     = useState<ResolvedProof[]>([]);
  const [openLogId,    setOpenLogId]    = useState<string | null>(null);
  const [openTablePid, setOpenTablePid] = useState<string | null>(null); // project id

  const toggleLog   = (id: string)  => setOpenLogId((p)    => p === id ? null : id);
  const toggleTable = (pid: string) => setOpenTablePid((p) => p === pid ? null : pid);

  const approveProof = (ps: ProofSubmission, from: "log" | "table") => {
    setPending((prev) => prev.filter((p) => p.id !== ps.id));
    setResolved((prev) => [{ ...ps, resolution: "approved" }, ...prev]);
    if (from === "log") setOpenLogId(null);
  };
  const rejectProof = (ps: ProofSubmission, from: "log" | "table") => {
    setPending((prev) => prev.filter((p) => p.id !== ps.id));
    setResolved((prev) => [{ ...ps, resolution: "rejected" }, ...prev]);
    if (from === "log") setOpenLogId(null);
  };

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Tagihan" />
      <SectionHead no="—" kicker="SEMUA PROYEK">Tagihan, <em>satu papan.</em></SectionHead>

      {/* Summary */}
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { l: "Total Kontrak",    v: fmtIDR(total),       accent: false },
          { l: "Sudah Dibayar",    v: fmtIDR(paid),        accent: false },
          { l: "Sisa Outstanding", v: fmtIDR(outstanding), accent: true  },
        ].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Bukti Masuk log — always visible */}
      <div className="mb-9">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Bukti Masuk</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: pending.length > 0 ? "var(--kas-ochre-ink)" : "var(--kas-ink-4)" }}>
            {pending.length > 0 ? `${pending.length} menunggu verifikasi` : "semua terverifikasi"}
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--kas-ink)", marginTop: 10 }}>
          {pending.map((ps) => {
            const proj = PROJECTS.find((p) => p.id === ps.projectId)!;
            return (
              <LogEntry key={ps.id} ps={ps} project={proj}
                open={openLogId === ps.id}
                onToggle={() => toggleLog(ps.id)}
                onApprove={() => approveProof(ps, "log")}
                onReject={() => rejectProof(ps, "log")}
              />
            );
          })}
          {pending.length === 0 && resolved.length === 0 && (
            <div style={{ padding: "24px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Belum ada bukti transfer masuk.
            </div>
          )}
          {resolved.length > 0 && (
            <div style={{ marginTop: pending.length > 0 ? 12 : 0 }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-4)", padding: "8px 0 4px 40px", borderTop: pending.length > 0 ? "1px dashed var(--kas-line)" : "none" }}>Riwayat</div>
              {resolved.map((ps) => {
                const proj = PROJECTS.find((p) => p.id === ps.projectId)!;
                const time = ps.submittedAt.split(", ")[1] ?? ps.submittedAt;
                return (
                  <div key={ps.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--kas-line-2)", opacity: 0.55 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ps.resolution === "approved" ? "var(--kas-moss)" : "var(--kas-ink-3)", display: "inline-block" }} />
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, color: "var(--kas-ink-3)" }}>{time}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>{proj.client.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1 }}>{ps.stageLabel} · {fmtIDRshort(ps.amount)}</div>
                    </div>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", padding: "3px 8px", background: ps.resolution === "approved" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)", color: ps.resolution === "approved" ? "var(--kas-moss-ink)" : "var(--kas-ink-3)" }}>
                      {ps.resolution === "approved" ? "Disetujui" : "Ditolak"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Projects table */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left",  padding: "12px 14px 12px 0" }}>Proyek</th>
            <th style={{ textAlign: "left",  padding: "12px 14px" }}>Klien</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Nilai</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Dibayar</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Sisa</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p) => {
            const sisa         = p.contractValue - p.paid;
            const stages       = deriveStages(p.contractValue, p.paid);
            const pendingStages = stages.filter((s) => !s.paid);
            const proofsByStage = Object.fromEntries(
              pending.filter((ps) => ps.projectId === p.id).map((ps) => [ps.stageIdx, ps])
            );
            const proofCount   = pending.filter((ps) => ps.projectId === p.id).length;
            const tableOpen    = sisa > 0 && openTablePid === p.id;

            const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nBerikut link tagihan proyek *${p.name}*:\nhttps://tauke.example.com/inv/${p.slug}\n\nSisa: ${fmtIDR(sisa)}\n\n— CV Karya Agung Sejati`);
            const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;

            return (
              <>
                <tr key={p.id} style={{ borderBottom: tableOpen ? "none" : "1px solid var(--kas-line)" }}>
                  <td style={{ padding: "16px 14px 16px 0" }}>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{p.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{p.code}</div>
                  </td>
                  <td style={{ padding: "16px 14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 14 }}>{p.client.name}</td>
                  <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{fmtIDR(p.contractValue)}</td>
                  <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-ink-3)" }}>{fmtIDR(p.paid)}</td>
                  <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: sisa > 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>
                    {sisa > 0 ? fmtIDR(sisa) : "—"}
                  </td>
                  <td style={{ padding: "16px 14px", textAlign: "right" }}>
                    {sisa > 0 ? (
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => toggleTable(p.id)}
                          style={{
                            background: tableOpen ? "var(--kas-ink)" : proofCount > 0 ? "var(--kas-ochre-soft)" : "transparent",
                            color: tableOpen ? "var(--kas-paper)" : proofCount > 0 ? "var(--kas-ochre-ink)" : "var(--kas-ink-3)",
                            border: `1px solid ${tableOpen ? "var(--kas-ink)" : proofCount > 0 ? "var(--kas-ochre)" : "var(--kas-line)"}`,
                            padding: "6px 10px",
                            fontFamily: "var(--font-jetbrains), monospace",
                            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          {proofCount > 0 ? `● Bukti (${proofCount})` : "Bukti"}
                        </button>
                        <a href={`/inv/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", color: "var(--kas-ink)", display: "inline-block" }}>Tagih</a>
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", color: "var(--kas-ink-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <WAIcon /> WA
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em" }}>LUNAS</span>
                    )}
                  </td>
                </tr>

                {/* Inline stage tabs expansion */}
                {tableOpen && (
                  <tr style={{ borderBottom: "1px solid var(--kas-line)" }}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div style={{ background: "var(--kas-paper-2)", borderTop: "1px solid var(--kas-line)" }}>
                        <StageTabs
                          project={p}
                          pendingStages={pendingStages}
                          proofsByStage={proofsByStage}
                          onApprove={(ps) => approveProof(ps, "table")}
                          onReject={(ps) => rejectProof(ps, "table")}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}
