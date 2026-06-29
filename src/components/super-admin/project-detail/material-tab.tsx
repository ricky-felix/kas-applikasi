"use client";
import { useMaterials } from "@/lib/stores";
import { MonoLabel, ProgressBar } from "@/components/primitives";
import { SectionHead } from "../shared";

export function MaterialTab() {
  const MATERIALS = useMaterials();
  return (
    <div>
      <SectionHead no="01" kicker="DIPAKAI VS DIANGGARKAN">Material, <em>terpakai.</em></SectionHead>
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
              <span className="px-2 py-1 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", background: low ? "var(--kas-rust-soft)" : "var(--kas-paper-2)", color: low ? "var(--kas-rust-ink)" : "var(--kas-ink-3)", border: "1px solid var(--kas-line)", minWidth: 90 }}>{low ? "Stok Tipis" : "Aman"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
