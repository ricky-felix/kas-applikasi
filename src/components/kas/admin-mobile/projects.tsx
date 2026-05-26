"use client";
import { useState } from "react";
import { PROJECTS, fmtIDRshort } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "../ui";

function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}

export default function AMProjects({ toast }: { toast: (m: string) => void }) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label={`${PROJECTS.length} TOTAL`} />
      <div className="flex justify-between items-baseline">
        <DisplayHeading size={28}>Proyek,<br /><em>semua.</em></DisplayHeading>
        <button onClick={() => setShowNew(true)} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>+ Baru</button>
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {PROJECTS.map((p) => {
          const sisa = p.contractValue - p.paid;
          const statusLabel = { Active: "Aktif", "On Hold": "Ditahan", Completed: "Selesai", Draft: "Draf" }[p.status];
          const statusBg = p.status === "Active" ? "var(--kas-cobalt-soft)" : p.status === "Completed" ? "var(--kas-moss-soft)" : "var(--kas-paper-2)";
          return (
            <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-baseline">
                <MonoLabel size={10}>{p.code}</MonoLabel>
                <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: statusBg, color: p.status === "Active" ? "var(--kas-cobalt-ink)" : p.status === "Completed" ? "var(--kas-moss-ink)" : p.status === "On Hold" ? "var(--kas-ochre-ink)" : "var(--kas-ink-3)", border: "1px solid var(--kas-line)" }}>{statusLabel}</span>
              </div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2, marginTop: 6 }}>{p.name}</div>
              <div className="flex justify-between items-center mt-2.5">
                <MonoLabel size={10}>{p.client.name}</MonoLabel>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: sisa > 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>{sisa > 0 ? fmtIDRshort(sisa) : "Lunas"}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex-1 relative" style={{ height: 4, background: "var(--kas-line-2)" }}>
                  <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                </div>
                <MonoLabel size={10}>{p.progress}%</MonoLabel>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0" style={{ background: "rgba(22,28,44,0.4)", zIndex: 40 }} onClick={() => setShowNew(false)}>
          <div onClick={(e) => e.stopPropagation()} className="absolute bottom-0 left-0 right-0 px-5 pt-5 pb-8" style={{ background: "var(--kas-paper)", borderTop: "1px solid var(--kas-ink)", maxHeight: "75vh", overflowY: "auto" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>PROYEK BARU</span>
              <button onClick={() => setShowNew(false)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 400, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Buat proyek. <em>Baru.</em></div>
            <div className="flex flex-col gap-3">
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Nama Proyek</div>
                <input placeholder="Contoh: Atap Beton Perumahan XYZ" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Klien</div>
                <input placeholder="Nama klien atau perusahaan" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Kategori</div>
                <select className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>
                  <option value="">— pilih kategori —</option>
                  <option>Waterproofing Atap</option>
                  <option>Waterproofing Basement</option>
                  <option>Waterproofing Kolam</option>
                  <option>Waterproofing Fasad</option>
                </select>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Nilai Kontrak (Rp)</div>
                <input placeholder="0" type="number" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
              </div>
            </div>
            <div className="grid gap-2 mt-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button onClick={() => setShowNew(false)} style={{ border: "1px solid var(--kas-ink)", background: "transparent", padding: "12px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={() => { toast("Proyek baru ditambahkan."); setShowNew(false); }} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "12px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Buat Proyek</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
