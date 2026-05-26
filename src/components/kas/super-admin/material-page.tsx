"use client";
import { useState } from "react";
import { MATERIALS, fmtIDR } from "@/lib/data";
import { MonoLabel, ProgressBar } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

export default function MaterialPage() {
  const [view, setView] = useState<"stock" | "usage">("stock");
  const [restockId, setRestockId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const lowCount = MATERIALS.filter((m) => m.stock <= m.minStock).length;
  const totalValue = MATERIALS.reduce((s, m) => s + m.stock * m.unitPrice, 0);

  const restockMaterial = restockId ? MATERIALS.find((m) => m.id === restockId) : null;

  const handleConfirmRestock = () => {
    setConfirmedId(restockId);
    setRestockId(null);
    setTimeout(() => setConfirmedId(null), 2000);
  };

  const summaryStats = [
    { n: "01", l: "Total Item",   v: String(MATERIALS.length).padStart(2, "0"), accentColor: "var(--kas-cobalt)", highlight: false },
    { n: "02", l: "Stok Tipis",   v: String(lowCount).padStart(2, "0"),          accentColor: "var(--kas-rust)",   highlight: lowCount > 0 },
    { n: "03", l: "Nilai Gudang", v: fmtIDR(totalValue),                          accentColor: "var(--kas-moss)",   highlight: false },
  ];

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Material" />
      <SectionHead no="05" kicker={`${MATERIALS.length} ITEM · GUDANG`}>
        Inventori, <em>terkelola.</em>
      </SectionHead>

      <div className="grid mb-7" style={{ gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {summaryStats.map((s, i) => (
          <div key={i} className="p-5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none", borderTop: `3px solid ${s.accentColor}` }}>
            <MonoLabel size={10}>{s.n} · {s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 36, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 8, color: s.highlight ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex mb-6" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {[{ k: "stock", l: "Stok Gudang" }, { k: "usage", l: "Pemakaian Proyek" }].map((t) => (
          <button key={t.k} onClick={() => setView(t.k as "stock" | "usage")} style={{ border: "none", background: view === t.k ? "var(--kas-ink)" : "transparent", color: view === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "10px 20px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", borderRight: "1px solid var(--kas-line)" }}>
            {t.l}
          </button>
        ))}
      </div>

      {view === "stock" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-ink)" }}>
              <th style={{ textAlign: "left", padding: "10px 12px 10px 0", width: 32 }}>#</th>
              <th style={{ textAlign: "left", padding: "10px 12px" }}>Material</th>
              <th style={{ textAlign: "left", padding: "10px 12px" }}>Supplier</th>
              <th style={{ textAlign: "right", padding: "10px 12px" }}>Stok</th>
              <th style={{ textAlign: "right", padding: "10px 12px" }}>Min. Stok</th>
              <th style={{ textAlign: "right", padding: "10px 12px" }}>Harga Satuan</th>
              <th style={{ textAlign: "right", padding: "10px 12px" }}>Nilai Stok</th>
              <th style={{ textAlign: "left", padding: "10px 12px" }}>Status</th>
              <th style={{ padding: "10px 12px" }}></th>
            </tr>
          </thead>
          <tbody>
            {MATERIALS.map((m, i) => {
              const low = m.stock <= m.minStock;
              const isConfirmed = confirmedId === m.id;
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <td style={{ padding: "14px 12px 14px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{String(i + 1).padStart(2, "0")}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{m.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.unit}</div>
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 13, color: "var(--kas-ink-2)" }}>{m.supplier}</td>
                  <td style={{ padding: "14px 12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 15, color: low ? "var(--kas-rust)" : "var(--kas-ink)", fontWeight: low ? 600 : 400 }}>
                    {m.stock} <span style={{ fontSize: 10, color: "var(--kas-ink-3)", fontWeight: 400 }}>{m.unit}</span>
                  </td>
                  <td style={{ padding: "14px 12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)" }}>{m.minStock} {m.unit}</td>
                  <td style={{ padding: "14px 12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{fmtIDR(m.unitPrice)}</td>
                  <td style={{ padding: "14px 12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{fmtIDR(m.stock * m.unitPrice)}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: low ? "var(--kas-rust-soft)" : "var(--kas-moss-soft)", color: low ? "var(--kas-rust-ink)" : "var(--kas-moss-ink)" }}>
                      {low ? "Stok Tipis" : "Aman"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {isConfirmed ? (
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-moss)", fontWeight: 600 }}>✓ Ditambahkan</span>
                    ) : (
                      <button onClick={() => setRestockId(m.id)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "5px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                        Restock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {view === "usage" && (
        <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
          {MATERIALS.map((m, i) => {
            const pct = Math.round((m.used / m.budget) * 100);
            const low = pct >= 90;
            return (
              <div key={m.id} className="grid gap-5 items-center py-4" style={{ gridTemplateColumns: "auto 1fr 1.4fr auto", borderBottom: "1px solid var(--kas-line)" }}>
                <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{m.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{m.supplier}</div>
                </div>
                <div>
                  <div className="flex justify-between mb-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                    <span>{m.used} / {m.budget} {m.unit}</span>
                    <span style={{ color: low ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
                <span style={{ padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", background: low ? "var(--kas-rust-soft)" : "var(--kas-paper-2)", color: low ? "var(--kas-rust-ink)" : "var(--kas-ink-3)", border: "1px solid var(--kas-line)" }}>
                  {low ? "Tipis" : "Aman"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Footer />

      {restockId && restockMaterial && (
        <div className="fixed inset-0 grid place-items-center" style={{ background: "rgba(22,28,44,0.5)", zIndex: 50 }} onClick={() => setRestockId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "28px 32px" }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>RESTOCK MATERIAL</span>
              <button onClick={() => setRestockId(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 16px" }}>{restockMaterial.name}. <em>Restock.</em></h2>
            <div className="mb-4 py-3" style={{ borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Stok Saat Ini</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28 }}>{restockMaterial.stock} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)" }}>{restockMaterial.unit}</span></div>
            </div>
            <div className="mb-5">
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Tambah stok ({restockMaterial.unit})</div>
              <input type="number" placeholder="0" className="w-full px-3 py-2.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }} />
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setRestockId(null)} style={{ background: "transparent", border: "1px solid var(--kas-ink)", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button onClick={handleConfirmRestock} style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "none", padding: "11px 22px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
