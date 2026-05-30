const REG_STEPS = [
  { n: "I",   l: "Nomor HP"   },
  { n: "II",  l: "Kode Akses" },
  { n: "III", l: "Profil"     },
  { n: "IV",  l: "Menunggu"   },
] as const;

export function RegStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex gap-1.5 px-5 pt-4 pb-3">
      {REG_STEPS.map((s, i) => {
        const done   = i + 1 < current;
        const active = i + 1 === current;
        return (
          <div
            key={s.n}
            className="flex items-center gap-1.5"
            style={{
              padding: "5px 10px",
              border: "1px solid var(--kas-ink)",
              background: active || done ? "var(--kas-ink)" : "var(--kas-paper)",
              color:      active || done ? "var(--kas-paper)" : "var(--kas-ink-3)",
              flex: active ? "1 1 auto" : "0 0 auto",
            }}
          >
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontStyle: "italic", lineHeight: 1, flexShrink: 0 }}>
              {done ? "✓" : s.n}
            </span>
            {active && (
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {s.l}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BackButton({ label = "← Kembali", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0", textAlign: "left" }}
    >
      {label}
    </button>
  );
}

export function ErrorHint({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-rust)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>
      {message}
    </div>
  );
}
