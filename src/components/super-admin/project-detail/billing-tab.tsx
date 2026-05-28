"use client";
import { useState } from "react";
import { fmtIDR, type Project } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { SectionHead, WAIcon } from "../shared";

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
    return { label: STAGE_LABELS[i], amount, paid: paid >= cumulative };
  });
}

export function BillingTab({ p }: { p: Project }) {
  const stages = deriveStages(p.contractValue, p.paid);

  const [approved, setApproved] = useState<Set<number>>(
    () => new Set(stages.flatMap((s, i) => (s.paid ? [i] : [])))
  );

  const approve = (idx: number) =>
    setApproved((prev) => { const n = new Set(prev); n.add(idx); return n; });

  const isApproved = (i: number) => approved.has(i);
  const prevApproved = (i: number) => i === 0 || approved.has(i - 1);

  const totalPaid    = stages.filter((_, i) => isApproved(i)).reduce((s, st) => s + st.amount, 0);
  const totalPending = p.contractValue - totalPaid;

  return (
    <div>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { l: "Total Kontrak",  v: fmtIDR(p.contractValue), accent: false },
          { l: "Sudah Dibayar",  v: fmtIDR(totalPaid),       accent: false },
          { l: "Sisa Tagihan",   v: fmtIDR(totalPending),    accent: totalPending > 0 },
        ].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <SectionHead no="01" kicker="EMPAT TAHAP">Pembayaran, <em>berkelanjutan.</em></SectionHead>

      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {stages.map((s, i) => {
          const paid_b = isApproved(i);
          const canApprove = !paid_b && prevApproved(i);
          const waMsg = encodeURIComponent(
            `Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan tahap *${s.label}* proyek *${p.name}* senilai *${fmtIDR(s.amount)}* belum dilunasi.\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`
          );
          const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
          return (
            <div key={i} className="grid gap-6 items-center py-5" style={{ gridTemplateColumns: "48px 1fr auto auto auto", borderBottom: "1px solid var(--kas-line)" }}>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontStyle: "italic", color: paid_b ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                {["I","II","III","IV"][i]}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>
                  {paid_b ? "Sudah dilunasi" : "Belum dibayar"}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 16, color: paid_b ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                {fmtIDR(s.amount)}
              </div>
              <span className="px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: paid_b ? "var(--kas-moss-soft)" : "var(--kas-ochre-soft)", color: paid_b ? "var(--kas-moss-ink)" : "var(--kas-ochre-ink)" }}>
                {paid_b ? "Lunas" : "Pending"}
              </span>
              <div className="flex gap-2">
                {!paid_b && (
                  <>
                    <button
                      type="button"
                      disabled={!canApprove}
                      onClick={() => approve(i)}
                      style={{
                        background: canApprove ? "var(--kas-ink)" : "transparent",
                        color: canApprove ? "var(--kas-paper)" : "var(--kas-ink-3)",
                        border: canApprove ? "none" : "1px solid var(--kas-line)",
                        padding: "8px 14px",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        cursor: canApprove ? "pointer" : "not-allowed",
                      }}
                    >
                      Tandai Lunas
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                      style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", color: "var(--kas-ink)" }}
                    >
                      <WAIcon />Tagih
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
