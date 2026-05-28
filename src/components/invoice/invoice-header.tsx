export function InvoiceHeader({ code }: { code: string }) {
  return (
    <div
      className="flex justify-between items-start"
      style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "28px 32px" }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect x="1" y="1" width="30" height="30" stroke="hsl(218,80%,68%)" strokeWidth="2" />
            <rect x="5" y="5" width="22" height="22" rx="4" stroke="hsl(14,75%,68%)" strokeWidth="2" />
            <circle cx="16" cy="16" r="4" fill="hsl(30,10%,97%)" />
          </svg>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 20, letterSpacing: "-0.01em" }}>
            Tauke
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
          CV Karya Agung Sejati
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 1.7 }}>
          Jl. William Iskandar Muda (Pancing - Komplek MMTC), Blok E No 12 A, Medan 20223<br />
          +62 81 161 7551
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 32, fontWeight: 400, fontStyle: "italic", lineHeight: 1 }}>
          Tagihan
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.6)", marginTop: 4, textTransform: "uppercase" }}>
          {code}
        </div>
      </div>
    </div>
  );
}
