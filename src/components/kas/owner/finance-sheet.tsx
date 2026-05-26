"use client";
import { CASHFLOW_MAY, PAYROLL_MAY, fmtIDRshort, payrollTotal } from "@/lib/data";
import { MonoLabel } from "../ui";

export default function OwnerFinanceSheet() {
  const totalIn  = CASHFLOW_MAY.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = CASHFLOW_MAY.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const totalPayroll = PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0);

  return (
    <div className="mt-4">
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-line-2)", borderBottom: "1px solid var(--kas-line-2)" }}>
        {[
          { l: "Pemasukan",   v: fmtIDRshort(totalIn),            color: "var(--kas-moss)" },
          { l: "Pengeluaran", v: fmtIDRshort(totalOut),           color: "var(--kas-rust)" },
          { l: "Penggajian",  v: fmtIDRshort(totalPayroll),       color: "var(--kas-ochre)" },
          { l: "Saldo Bersih",v: fmtIDRshort(totalIn - totalOut), color: totalIn - totalOut >= 0 ? "var(--kas-moss)" : "var(--kas-rust)" },
        ].map((s, i) => (
          <div key={i} className="py-3.5 px-1" style={{ borderRight: i % 2 === 0 ? "1px solid var(--kas-line-2)" : "none", borderBottom: i < 2 ? "1px solid var(--kas-line-2)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, color: s.color }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <MonoLabel size={10}>Arus Kas Mei 2026</MonoLabel>
        <div className="mt-2" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
          {CASHFLOW_MAY.map((e, i) => (
            <div key={i} className="flex justify-between items-baseline py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.3 }}>{e.description}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{e.date} · {e.projectCode}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600, color: e.type === "in" ? "var(--kas-moss)" : "var(--kas-rust)", flexShrink: 0, marginLeft: 8 }}>
                {e.type === "in" ? "+" : "−"}{fmtIDRshort(e.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <MonoLabel size={10}>Penggajian · {PAYROLL_MAY.length} Pekerja</MonoLabel>
        <div className="mt-2" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
          {PAYROLL_MAY.map((entry) => {
            const total = payrollTotal(entry);
            return (
              <div key={entry.workerId} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{entry.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>{entry.role}</div>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(total)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
