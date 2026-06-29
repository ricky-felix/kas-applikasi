"use client";
import { useState } from "react";
import { fmtIDR } from "@/lib/data";
import { useExpenses } from "@/lib/stores";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

export default function AMExpenseLog({ onBack, toast }: { onBack?: () => void; toast: (m: string) => void }) {
  const EXPENSES = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const total = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const catColor: Record<string, string> = { Material: "var(--kas-cobalt-soft)", Transport: "var(--kas-ochre-soft)", Upah: "var(--kas-moss-soft)", "Lain-lain": "var(--kas-paper-2)" };
  const catInk: Record<string, string>   = { Material: "var(--kas-cobalt-ink)", Transport: "var(--kas-ochre-ink)", Upah: "var(--kas-moss-ink)", "Lain-lain": "var(--kas-ink-3)" };

  return (
    <div className="px-5 pt-4 pb-6">
      {onBack && <button onClick={onBack} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 10px" }}>← Kembali</button>}
      <Kicker no="08" label={`${EXPENSES.length} ENTRI`} />
      <div className="flex justify-between items-end mb-4">
        <DisplayHeading size={26}>Pengeluaran,<br /><em>bulan ini.</em></DisplayHeading>
        <button onClick={() => setShowForm(!showForm)} style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>+ Catat</button>
      </div>

      <div className="p-4 mb-4" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
        <MonoLabel size={10} color="rgba(255,255,255,0.6)">Total Pengeluaran Mei 2026</MonoLabel>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontWeight: 500, marginTop: 6, color: "var(--kas-rust)" }}>{fmtIDR(total)}</div>
      </div>

      {showForm && (
        <div className="mb-4 p-3.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
          <MonoLabel size={10}>Form Pengeluaran Baru</MonoLabel>
          <div className="mt-3 flex flex-col gap-2">
            {["Deskripsi", "Jumlah (Rp)", "Proyek", "Kategori"].map((ph, i) => (
              <input key={i} placeholder={ph} className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }} />
            ))}
            <button onClick={() => { toast("Pengeluaran dicatat."); setShowForm(false); }} className="w-full py-3 mt-1" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>Simpan</button>
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {EXPENSES.map((e) => (
          <div key={e.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div className="flex justify-between items-start mb-1.5">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{e.description}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)", fontWeight: 600, flexShrink: 0 }}>{fmtIDR(e.amount)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ padding: "2px 7px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", background: catColor[e.category], color: catInk[e.category] }}>{e.category}</span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>{e.date} · {e.by}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
