"use client";
import { useState } from "react";
import { PROJECTS, fmtIDR, fmtIDRshort } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}

export function TagihanTab({ toast }: { toast: (m: string) => void }) {
  const outstanding = PROJECTS.filter((p) => p.contractValue > p.paid);
  const total = outstanding.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const [lunasList, setLunasList] = useState<Set<string>>(new Set());

  return (
    <>
      <Kicker no="A" label={`${outstanding.length} BELUM LUNAS`} />
      <DisplayHeading size={26}>Tagihan,<br /><em>aktif.</em></DisplayHeading>

      <div className="mt-4 p-4" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
        <MonoLabel size={10} color="rgba(255,255,255,0.6)">Total Outstanding</MonoLabel>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 34, fontWeight: 500, marginTop: 6, color: "var(--kas-rust)" }}>
          {fmtIDR(total)}
        </div>
      </div>

      <div className="mt-4">
        {outstanding.map((p) => {
          const sisa = p.contractValue - p.paid;
          const isLunas = lunasList.has(p.id);
          const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan proyek *${p.name}* senilai *${fmtIDRshort(sisa)}* belum dilunasi.\n\nBerikut link tagihan:\nhttps://tauke.example.com/inv/${p.slug}\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`);
          const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
          return (
            <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-baseline">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{p.client.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(sisa)}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.name}</div>
              {isLunas ? (
                <div className="mt-2.5 px-3.5 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-moss-soft)" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-moss-ink)", fontWeight: 600 }}>✓ LUNAS</span>
                </div>
              ) : (
                <div className="grid gap-1.5 mt-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button onClick={() => setLunasList((s) => { const n = new Set(s); n.add(p.id); return n; })} style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "10px 0", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Tandai Lunas
                  </button>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
                    <WAIcon /> Tagih WA
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
