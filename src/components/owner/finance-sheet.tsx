"use client";
import { useState } from "react";
import { fmtIDRshort, payrollTotal } from "@/lib/data";
import { useCashFlow, usePayroll } from "@/lib/stores";
import { MonoLabel } from "@/components/primitives";

const BULAN: Record<string, number> = {
  Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
  Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12,
};

function parseDate(str: string): Date {
  const [day, month] = str.split(" ");
  return new Date(2026, (BULAN[month] ?? 5) - 1, parseInt(day));
}

const TODAY = new Date(2026, 4, 24);

type Period = "week" | "month";

export default function OwnerFinanceSheet() {
  const CASHFLOW_MAY = useCashFlow();
  const PAYROLL_MAY = usePayroll();
  const [period, setPeriod] = useState<Period>("month");

  const cutoff = new Date(TODAY.getTime() - (period === "week" ? 6 : 29) * 86400000);

  const filtered = CASHFLOW_MAY.filter((e) => parseDate(e.date) >= cutoff);

  const totalIn      = filtered.filter((e) => e.type === "in").reduce((s, e)  => s + e.amount, 0);
  const totalOut     = filtered.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const totalPayroll = period === "week"
    ? PAYROLL_MAY.reduce((s, e) => s + e.rate * 5, 0)
    : PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0);

  return (
    <div className="mt-4">
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-line-2)", borderBottom: "1px solid var(--kas-line-2)" }}>
        {(() => {
          const net = totalIn - totalOut;
          return [
            { l: "Pemasukan",    sign: "+", v: fmtIDRshort(totalIn),         color: "var(--kas-moss)"  },
            { l: "Pengeluaran",  sign: "−", v: fmtIDRshort(totalOut),         color: "var(--kas-rust)"  },
            { l: "Penggajian",   sign: "−", v: fmtIDRshort(totalPayroll),     color: "var(--kas-ochre)" },
            { l: "Saldo Bersih", sign: net >= 0 ? "+" : "−", v: fmtIDRshort(Math.abs(net)), color: net >= 0 ? "var(--kas-moss)" : "var(--kas-rust)" },
          ];
        })().map((s, i) => (
          <div key={i} className="py-3.5 px-1" style={{ borderRight: i % 2 === 0 ? "1px solid var(--kas-line-2)" : "none", borderBottom: i < 2 ? "1px solid var(--kas-line-2)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, color: s.color }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, marginRight: 2 }}>{s.sign}</span>{s.v}
            </div>
          </div>
        ))}
      </div>

      {/* Arus Kas */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <MonoLabel size={10}>Arus Kas</MonoLabel>
          {/* Period toggle */}
          <div className="flex">
            {(["week", "month"] as Period[]).map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                style={{
                  border: "1px solid var(--kas-line)",
                  marginLeft: i > 0 ? -1 : 0,
                  background: period === p ? "var(--kas-ink)" : "var(--kas-paper)",
                  color:      period === p ? "var(--kas-paper)" : "var(--kas-ink-3)",
                  padding: "4px 10px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
                  cursor: "pointer",
                  zIndex: period === p ? 1 : 0,
                  position: "relative",
                }}
              >
                {p === "week" ? "1 Minggu" : "1 Bulan"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
          {filtered.length === 0 ? (
            <div className="py-4 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Tidak ada transaksi
            </div>
          ) : filtered.map((e, i) => (
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

      {/* Penggajian */}
      <div className="mt-4">
        <MonoLabel size={10}>{period === "week" ? "Estimasi Gaji Minggu Ini" : "Penggajian Bulan Ini"} · {PAYROLL_MAY.length} Pekerja</MonoLabel>
        <div className="mt-2" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
          {PAYROLL_MAY.map((entry) => {
            const amount = period === "week" ? entry.rate * 5 : payrollTotal(entry);
            return (
              <div key={entry.workerId} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{entry.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>
                    {entry.role}{period === "week" ? ` · ${fmtIDRshort(entry.rate)}/hari` : ""}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
