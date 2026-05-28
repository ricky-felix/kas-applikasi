import { CASHFLOW_MAY, fmtIDRshort } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";

export function RiwayatTab() {
  const cashIn  = CASHFLOW_MAY.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const cashOut = CASHFLOW_MAY.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const net     = cashIn - cashOut;

  return (
    <>
      <Kicker no="B" label={`${CASHFLOW_MAY.length} TRANSAKSI · MEI 2026`} />
      <DisplayHeading size={26}>Riwayat,<br /><em>kas masuk &amp; keluar.</em></DisplayHeading>

      <div className="grid mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr", border: "1px solid var(--kas-ink)" }}>
        {[
          { label: "Masuk",  value: fmtIDRshort(cashIn),  color: "var(--kas-moss)"  },
          { label: "Keluar", value: fmtIDRshort(cashOut), color: "var(--kas-rust)"  },
          { label: "Neto",   value: fmtIDRshort(net),     color: net >= 0 ? "var(--kas-moss)" : "var(--kas-rust)" },
        ].map((s, i) => (
          <div key={i} className="px-3 py-3" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500, marginTop: 4, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {[...CASHFLOW_MAY].reverse().map((e, i) => (
          <div key={i} className="flex justify-between items-start py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{e.description}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                {e.date} · {e.projectCode}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600, color: e.type === "in" ? "var(--kas-moss)" : "var(--kas-rust)" }}>
                {e.type === "in" ? "+" : "−"}{fmtIDRshort(e.amount)}
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {e.type === "in" ? "masuk" : "keluar"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
