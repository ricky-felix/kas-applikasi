import { MonoLabel } from "@/components/primitives";

type Card = {
  key: string;
  no: string;
  label: string;
  value: string;
  sub: string;
  accent: boolean;
};

export function MetricCard({ card, index, total, onClick }: { card: Card; index: number; total: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid items-center gap-3.5 text-left cursor-pointer"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        border: "none",
        background: "transparent",
        borderTop: index === 0 ? "1px solid var(--kas-ink)" : "1px solid var(--kas-line)",
        borderBottom: index === total - 1 ? "1px solid var(--kas-ink)" : "none",
        padding: "18px 0",
      }}
    >
      <MonoLabel size={11}>{card.no}</MonoLabel>
      <div>
        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</div>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 42, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 4, color: card.accent ? "var(--kas-rust)" : "var(--kas-ink)" }}>{card.value}</div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 6, letterSpacing: "0.08em" }}>{card.sub}</div>
      </div>
      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, color: "var(--kas-ink)", lineHeight: 1 }}>→</div>
    </button>
  );
}
