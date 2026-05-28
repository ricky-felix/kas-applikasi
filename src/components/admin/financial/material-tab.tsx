import { MATERIALS } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";

export function MaterialTab() {
  const lowCount = MATERIALS.filter((m) => m.stock <= m.minStock).length;

  return (
    <>
      <div className="flex justify-between items-end mb-1">
        <Kicker no="C" label={`${MATERIALS.length} ITEM MATERIAL`} />
        {lowCount > 0 && (
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", padding: "3px 8px", background: "var(--kas-rust-soft)", color: "var(--kas-rust-ink)" }}>
            {lowCount} stok tipis
          </span>
        )}
      </div>
      <DisplayHeading size={26}>Material,<br /><em>stok gudang.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {MATERIALS.map((m) => {
          const low = m.stock <= m.minStock;
          const pct = Math.round((m.used / m.budget) * 100);
          return (
            <div key={m.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.supplier}</div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "3px 8px", background: low ? "var(--kas-rust-soft)" : "var(--kas-moss-soft)", color: low ? "var(--kas-rust-ink)" : "var(--kas-moss-ink)" }}>
                  {low ? "Tipis" : "Aman"}
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Stok Gudang</div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, color: low ? "var(--kas-rust)" : "var(--kas-ink)" }}>
                    {m.stock} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{m.unit}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1 }}>Min. {m.minStock} {m.unit}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Terpakai / Budget</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: pct >= 90 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{m.used}</span>
                    <span style={{ color: "var(--kas-ink-3)" }}> / {m.budget} {m.unit}</span>
                  </div>
                  <div className="relative" style={{ height: 3, background: "var(--kas-line-2)" }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--kas-rust)" : "var(--kas-cobalt)" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
