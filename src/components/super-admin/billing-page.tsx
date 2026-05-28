"use client";
import { PROJECTS, fmtIDR, fmtIDRshort } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer, WAIcon } from "./shared";

export default function BillingPage() {
  const total = PROJECTS.reduce((s, p) => s + p.contractValue, 0);
  const paid = PROJECTS.reduce((s, p) => s + p.paid, 0);
  const outstanding = total - paid;
  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Tagihan" />
      <SectionHead no="—" kicker="SEMUA PROYEK">Tagihan, <em>satu papan.</em></SectionHead>
      <div className="grid mb-7" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[{ l: "Total Kontrak", v: fmtIDR(total), accent: false }, { l: "Sudah Dibayar", v: fmtIDR(paid), accent: false }, { l: "Sisa Outstanding", v: fmtIDR(outstanding), accent: true }].map((s, i) => (
          <div key={i} className="py-5 px-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, marginTop: 8, color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid var(--kas-ink)" }}>
        <thead>
          <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-line)" }}>
            <th style={{ textAlign: "left", padding: "12px 14px 12px 0" }}>Proyek</th>
            <th style={{ textAlign: "left", padding: "12px 14px" }}>Klien</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Nilai</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Dibayar</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Sisa</th>
            <th style={{ textAlign: "right", padding: "12px 14px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p) => {
            const sisa = p.contractValue - p.paid;
            const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nBerikut link tagihan proyek *${p.name}*:\nhttps://tauke.example.com/inv/${p.slug}\n\nSisa: ${fmtIDR(sisa)}\n\n— CV Karya Agung Sejati`);
            const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
            return (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "16px 14px 16px 0" }}>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{p.code}</div>
                </td>
                <td style={{ padding: "16px 14px" }}>{p.client.name}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace" }}>{fmtIDR(p.contractValue)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: "var(--kas-ink-3)" }}>{fmtIDR(p.paid)}</td>
                <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", color: sisa > 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>{sisa > 0 ? fmtIDR(sisa) : "—"}</td>
                <td style={{ padding: "16px 14px", textAlign: "right" }}>
                  {sisa > 0 ? (
                    <div className="flex gap-1.5 justify-end">
                      <a href={`/inv/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "6px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", color: "var(--kas-ink)", display: "inline-block" }}>Tagih</a>
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" style={{ background: "transparent", border: "1px solid var(--kas-line)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", color: "var(--kas-ink-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <WAIcon /> WA
                      </a>
                    </div>
                  ) : (
                    <span style={{ color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em" }}>LUNAS</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}
