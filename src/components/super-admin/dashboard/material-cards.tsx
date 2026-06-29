"use client";
import { useMaterials } from "@/lib/stores";
import { SectionHead, Bar } from "../shared";

export function MaterialCards() {
  const MATERIALS = useMaterials();
  return (
    <section className="mt-14">
      <SectionHead no="07" kicker="MATERIAL · GUDANG">Serapan vs anggaran, <em>per item.</em></SectionHead>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {MATERIALS.map((m) => {
          const absorbPct = m.budget > 0 ? (m.used / m.budget) * 100 : 0;
          const lowStock  = m.stock <= m.minStock;
          const barColor  = absorbPct >= 90 ? "var(--kas-rust)" : absorbPct >= 70 ? "var(--kas-ochre)" : "var(--kas-ink)";
          return (
            <div key={m.id} className="p-4" style={{ border: `1px solid ${lowStock ? "var(--kas-rust)" : "var(--kas-line)"}`, background: lowStock ? "hsl(14 70% 98%)" : "transparent" }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.supplier}</div>
                </div>
                {lowStock && (
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--kas-rust)", border: "1px solid var(--kas-rust)", padding: "2px 5px", textTransform: "uppercase", flexShrink: 0 }}>
                    Stok rendah
                  </span>
                )}
              </div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Serapan</span>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, color: barColor }}>{absorbPct.toFixed(0)}%</span>
              </div>
              <Bar pct={absorbPct} h={5} color={barColor} />
              <div className="flex justify-between mt-3">
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>{m.used} / {m.budget} {m.unit}</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.08em", color: lowStock ? "var(--kas-rust)" : "var(--kas-ink-3)", fontWeight: lowStock ? 700 : 400 }}>
                  sisa {m.stock} {m.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
