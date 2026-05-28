"use client";
import { useState } from "react";
import { BILLING, fmtIDR, type Project } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { SectionHead, WAIcon } from "../shared";

export function BillingTab({ p }: { p: Project }) {
  const paid    = BILLING.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const pending = BILLING.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0);
  const [paidSet, setPaidSet] = useState<Set<number>>(new Set());

  const isEffectivePaid = (b: typeof BILLING[0], i: number) => b.status === "Paid" || paidSet.has(i);

  return (
    <div>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[{ l: "Total Kontrak", v: fmtIDR(p.contractValue), accent: false }, { l: "Sudah Dibayar", v: fmtIDR(paid), accent: false }, { l: "Sisa Tagihan", v: fmtIDR(pending), accent: true }].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      <SectionHead no="01" kicker="EMPAT TAHAP">Pembayaran, <em>berkelanjutan.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {BILLING.map((b, i) => {
          const paid_b = isEffectivePaid(b, i);
          const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan tahap *${b.stage}* proyek *${p.name}* senilai *${fmtIDR(b.amount)}* belum dilunasi.\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`);
          const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
          return (
            <div key={i} className="grid gap-6 items-center py-5" style={{ gridTemplateColumns: "48px 1fr auto auto auto", borderBottom: "1px solid var(--kas-line)" }}>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontStyle: "italic", color: paid_b ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{["I","II","III","IV"][i]}</span>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>{b.stage}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{b.date ? `Dibayar ${b.date}` : "Belum dibayar"}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 16, color: paid_b ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>{fmtIDR(b.amount)}</div>
              <span className="px-2.5 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: paid_b ? "var(--kas-moss-soft)" : "var(--kas-ochre-soft)", color: paid_b ? "var(--kas-moss-ink)" : "var(--kas-ochre-ink)" }}>{paid_b ? "Lunas" : "Pending"}</span>
              <div className="flex gap-2">
                {!paid_b && (
                  <>
                    <button type="button" onClick={() => setPaidSet((s) => { const n = new Set(s); n.add(i); return n; })} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Tandai Lunas</button>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5" style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "8px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", color: "var(--kas-ink)" }}>
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
