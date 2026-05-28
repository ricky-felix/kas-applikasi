import type { Material } from "@/lib/data";

export function MaterialSheet({ materials }: { materials: Material[] }) {
  return (
    <div className="mt-4">
      {materials.map((m) => {
        const low = m.stock <= m.minStock;
        const pct = Math.round((m.used / m.budget) * 100);
        return (
          <div key={m.id} className="py-3.5" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{m.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.supplier}</div>
              </div>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "3px 8px", background: low ? "var(--kas-rust-soft)" : "var(--kas-moss-soft)", color: low ? "var(--kas-rust-ink)" : "var(--kas-moss-ink)" }}>
                {low ? "Tipis" : "Aman"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, fontWeight: 500, color: low ? "var(--kas-rust)" : "var(--kas-ink)" }}>
                {m.stock} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{m.unit}</span>
              </div>
              <div className="text-right">
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>Terpakai {m.used}/{m.budget} {m.unit}</div>
                <div className="relative mt-1" style={{ width: 80, height: 3, background: "var(--kas-line-2)" }}>
                  <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--kas-rust)" : "var(--kas-cobalt)" }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
