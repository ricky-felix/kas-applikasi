import { fmtIDRshort } from "@/lib/data";
import { SectionHead, Bar } from "../shared";

type WaterfallItem = { label: string; amount: number; pct: number; type: "base" | "out" | "net" };

export function CostWaterfall({ items }: { items: WaterfallItem[] }) {
  return (
    <section>
      <SectionHead no="05" kicker="ALIRAN LABA">Dari pendapatan <em>ke laba.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {items.map((item, i) => {
          const isBase = item.type === "base";
          const isNet  = item.type === "net";
          const isOut  = item.type === "out";
          const barColor = isBase ? "var(--kas-ink)" : isNet ? (item.amount >= 0 ? "var(--kas-moss)" : "var(--kas-rust)") : "var(--kas-ochre)";
          return (
            <div key={i} className="py-3.5" style={{ borderBottom: isNet ? "none" : "1px solid var(--kas-line)", borderTop: isNet ? "1px solid var(--kas-ink)" : "none" }}>
              <div className="flex justify-between items-baseline mb-2">
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: isNet ? 14 : 13, fontWeight: isNet ? 600 : 400, color: isOut ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                  {isOut && <span style={{ marginRight: 4, color: "var(--kas-rust)" }}>−</span>}
                  {item.label}
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: isNet ? 700 : 400, color: isNet ? barColor : isOut ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                  {isOut ? "−" : ""}{fmtIDRshort(Math.abs(item.amount))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bar pct={Math.abs(item.pct)} h={isBase || isNet ? 6 : 4} color={barColor} />
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", minWidth: 28, textAlign: "right" }}>
                  {Math.abs(item.pct).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
