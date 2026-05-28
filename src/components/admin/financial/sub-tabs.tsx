export type SubTab = "tagihan" | "riwayat" | "material";

const TABS: { k: SubTab; l: string }[] = [
  { k: "tagihan",  l: "Tagihan"  },
  { k: "riwayat",  l: "Riwayat"  },
  { k: "material", l: "Material" },
];

export function FinancialSubTabs({ active, setActive }: { active: SubTab; setActive: (t: SubTab) => void }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
      {TABS.map((t, i) => (
        <button
          key={t.k}
          onClick={() => setActive(t.k)}
          style={{
            border: "none",
            borderRight: i < 2 ? "1px solid var(--kas-line)" : "none",
            borderTop: active === t.k ? "2px solid var(--kas-ink)" : "2px solid transparent",
            background: active === t.k ? "var(--kas-ink)" : "transparent",
            color: active === t.k ? "var(--kas-paper)" : "var(--kas-ink-3)",
            padding: "10px 0",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {t.l}
        </button>
      ))}
    </div>
  );
}
