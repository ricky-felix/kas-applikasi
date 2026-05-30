"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { CASHFLOW_MAY, EXPENSES, PAYROLL_MAY, CASH_ADVANCES, DAILY_ALLOWANCES, WORKERS, fmtIDR, fmtIDRshort, payrollTotal } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

const MONTH_ID: Record<string, number> = {
  Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
  Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
};

function parseDate(dateStr: string): Date {
  const parts = dateStr.trim().split(" ");
  const day = parseInt(parts[0]);
  const month = MONTH_ID[parts[1]] ?? new Date().getMonth();
  const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
  return new Date(year, month, day);
}

const RANGES = [
  { k: "7d",  l: "7 Hari" },
  { k: "30d", l: "30 Hari" },
  { k: "3m",  l: "3 Bulan" },
  { k: "6m",  l: "6 Bulan" },
  { k: "1y",  l: "1 Tahun" },
] as const;

type PresetRange = typeof RANGES[number]["k"];
type Range = PresetRange | "custom";

function getCutoff(range: PresetRange): Date {
  const now = new Date();
  const d = new Date(now);
  if (range === "7d")  d.setDate(d.getDate() - 7);
  if (range === "30d") d.setDate(d.getDate() - 30);
  if (range === "3m")  d.setMonth(d.getMonth() - 3);
  if (range === "6m")  d.setMonth(d.getMonth() - 6);
  if (range === "1y")  d.setFullYear(d.getFullYear() - 1);
  return d;
}

export default function FinancePage() {
  const [range, setRange] = useState<Range>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const customRef = useRef<HTMLDivElement>(null);
  const [paidWorkers, setPaidWorkers] = useState<Set<string>>(new Set());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (customRef.current && !customRef.current.contains(e.target as Node)) {
        setCustomOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { from, to } = useMemo(() => {
    if (range === "custom") {
      return {
        from: customFrom ? new Date(customFrom) : new Date(0),
        to:   customTo   ? new Date(customTo + "T23:59:59") : new Date(),
      };
    }
    return { from: getCutoff(range as PresetRange), to: new Date() };
  }, [range, customFrom, customTo]);

  const filteredCashflow = useMemo(
    () => CASHFLOW_MAY.filter((e) => { const d = parseDate(e.date); return d >= from && d <= to; }),
    [from, to],
  );
  const filteredExpenses = useMemo(
    () => EXPENSES.filter((e) => { const d = parseDate(e.date); return d >= from && d <= to; }),
    [from, to],
  );

  const totalIn         = filteredCashflow.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut        = filteredCashflow.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const totalPayroll    = PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0);
  const totalExpenses   = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalKasbon     = CASH_ADVANCES.reduce((s, ca) => s + ca.amount, 0);
  const totalAllowances = DAILY_ALLOWANCES.reduce((s, da) => s + da.amount, 0);

  const rangeFilter = (
    <div className="flex" style={{ gap: 4, alignItems: "center" }}>
      {RANGES.map((r) => (
        <button key={r.k} onClick={() => setRange(r.k)} style={{ border: "1px solid", borderColor: range === r.k ? "var(--kas-ink)" : "var(--kas-line)", background: range === r.k ? "var(--kas-ink)" : "transparent", color: range === r.k ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {r.l}
        </button>
      ))}
      <div ref={customRef} style={{ position: "relative" }}>
        <button
          onClick={() => { setRange("custom"); setCustomOpen((o) => !o); }}
          style={{ border: "1px solid", borderColor: range === "custom" ? "var(--kas-ink)" : "var(--kas-line)", background: range === "custom" ? "var(--kas-ink)" : "transparent", color: range === "custom" ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Kustom ▾
        </button>
        {customOpen && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50, background: "var(--kas-paper)", border: "1px solid var(--kas-ink)", padding: "16px", minWidth: 260, boxShadow: "4px 4px 0 var(--kas-line)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 10 }}>Rentang Tanggal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Dari</span>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={{ border: "1px solid var(--kas-line)", background: "transparent", padding: "6px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink)", outline: "none", width: "100%" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Sampai</span>
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={{ border: "1px solid var(--kas-line)", background: "transparent", padding: "6px 8px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink)", outline: "none", width: "100%" }} />
              </label>
              <button onClick={() => setCustomOpen(false)} style={{ marginTop: 4, border: "1px solid var(--kas-ink)", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Terapkan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Keuangan" />
      <SectionHead no="06" kicker="MEI 2026">Arus kas, <em>terpantau.</em></SectionHead>

      <div className="grid mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { l: "Pemasukan",    v: fmtIDRshort(totalIn),            color: "var(--kas-moss)",  accent: "var(--kas-moss)" },
          { l: "Pengeluaran",  v: fmtIDRshort(totalOut),           color: "var(--kas-rust)",  accent: "var(--kas-rust)" },
          { l: "Penggajian",   v: fmtIDRshort(totalPayroll),       color: "var(--kas-ochre)", accent: "var(--kas-ochre)" },
          { l: "Saldo Bersih", v: fmtIDRshort(totalIn - totalOut), color: totalIn - totalOut >= 0 ? "var(--kas-moss)" : "var(--kas-rust)", accent: "var(--kas-cobalt)" },
        ].map((s, i) => (
          <div key={i} className="p-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderTop: `3px solid ${s.accent}` }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 32, lineHeight: 1.0, marginTop: 8, letterSpacing: "-0.02em", color: s.color }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Arus Kas */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-0" style={{ borderTop: "1px solid var(--kas-ink)", paddingTop: 14, paddingBottom: 14 }}>
          <MonoLabel size={10}>Arus Kas</MonoLabel>
          {rangeFilter}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-ink)" }}>
              <th style={{ textAlign: "left", padding: "10px 0", width: 80 }}>Tanggal</th>
              <th style={{ textAlign: "left", padding: "10px 14px" }}>Keterangan</th>
              <th style={{ textAlign: "left", padding: "10px 14px" }}>Proyek</th>
              <th style={{ textAlign: "right", padding: "10px 0", width: 160 }}>Masuk</th>
              <th style={{ textAlign: "right", padding: "10px 0 10px 14px", width: 160 }}>Keluar</th>
            </tr>
          </thead>
          <tbody>
            {filteredCashflow.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "14px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{e.date}</td>
                <td style={{ padding: "14px", fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{e.description}</td>
                <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>{e.projectCode}</td>
                <td style={{ padding: "14px 0", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-moss)", fontWeight: 600 }}>{e.type === "in" ? `+${fmtIDR(e.amount)}` : ""}</td>
                <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)", fontWeight: 600 }}>{e.type === "out" ? `-${fmtIDR(e.amount)}` : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <td colSpan={3} style={{ padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "14px 0", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-moss)" }}>{`+${fmtIDR(totalIn)}`}</td>
              <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>{`-${fmtIDR(totalOut)}`}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Log Pengeluaran */}
      <div className="mb-10">
        <div style={{ borderTop: "1px solid var(--kas-ink)", paddingTop: 14, paddingBottom: 14 }}>
          <MonoLabel size={10}>Log Pengeluaran</MonoLabel>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-ink)" }}>
              <th style={{ textAlign: "left", padding: "10px 0", width: 80 }}>Tanggal</th>
              <th style={{ textAlign: "left", padding: "10px 14px" }}>Keterangan</th>
              <th style={{ textAlign: "left", padding: "10px 14px" }}>Kategori</th>
              <th style={{ textAlign: "left", padding: "10px 14px" }}>Oleh</th>
              <th style={{ textAlign: "right", padding: "10px 0 10px 14px" }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => {
              const catColor: Record<string, string> = { Material: "var(--kas-cobalt-soft)", Transport: "var(--kas-ochre-soft)", Upah: "var(--kas-moss-soft)", "Lain-lain": "var(--kas-paper-2)" };
              const catInk: Record<string, string>   = { Material: "var(--kas-cobalt-ink)",  Transport: "var(--kas-ochre-ink)",  Upah: "var(--kas-moss-ink)",  "Lain-lain": "var(--kas-ink-3)" };
              return (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <td style={{ padding: "14px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{e.date}</td>
                  <td style={{ padding: "14px", fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{e.description}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ padding: "3px 9px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: catColor[e.category], color: catInk[e.category] }}>{e.category}</span>
                  </td>
                  <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{e.by}</td>
                  <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)" }}>{`-${fmtIDR(e.amount)}`}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <td colSpan={4} style={{ padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Pengeluaran</td>
              <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>{`-${fmtIDR(totalExpenses)}`}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Penggajian */}
      <div>
        <div style={{ borderTop: "1px solid var(--kas-ink)", paddingTop: 14, paddingBottom: 14 }}>
          <MonoLabel size={10}>Penggajian Mei 2026</MonoLabel>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-ink)" }}>
              <th style={{ textAlign: "left", padding: "10px 0" }}>Pekerja</th>
              <th style={{ textAlign: "left", padding: "10px 14px" }}>Proyek</th>
              <th style={{ textAlign: "right", padding: "10px 14px" }}>Tarif/Hari</th>
              <th style={{ textAlign: "right", padding: "10px 14px" }}>Hari Penuh</th>
              <th style={{ textAlign: "right", padding: "10px 14px" }}>½ Hari</th>
              <th style={{ textAlign: "right", padding: "10px 0 10px 14px" }}>Total Upah</th>
            </tr>
          </thead>
          <tbody>
            {PAYROLL_MAY.map((entry) => {
              const total  = payrollTotal(entry);
              const isPaid = paidWorkers.has(entry.workerId);
              return entry.projects.map((proj, j) => (
                <tr key={`${entry.workerId}-${j}`} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  {j === 0 && (
                    <td rowSpan={entry.projects.length} style={{ padding: "16px 14px 16px 0", verticalAlign: "top" }}>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{entry.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{entry.role}</div>
                    </td>
                  )}
                  <td style={{ padding: "16px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{proj.code}</td>
                  <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>{fmtIDR(entry.rate)}</td>
                  <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13 }}>{proj.daysPresent}</td>
                  <td style={{ padding: "16px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-ink-3)" }}>{proj.daysHalf}</td>
                  {j === 0 && (
                    <td rowSpan={entry.projects.length} style={{ padding: "16px 0 16px 14px", textAlign: "right", verticalAlign: "top" }}>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>{fmtIDR(total)}</div>
                      {isPaid ? (
                        <span style={{ display: "inline-block", marginTop: 6, fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-moss)" }}>✓ LUNAS</span>
                      ) : (
                        <button
                          onClick={() => setPaidWorkers((s) => { const n = new Set(s); n.add(entry.workerId); return n; })}
                          style={{ marginTop: 6, background: "transparent", border: "1px solid var(--kas-ink)", padding: "4px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ));
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <td colSpan={5} style={{ padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Penggajian Mei</td>
              <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>{fmtIDR(totalPayroll)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Kasbon & Tunjangan Harian */}
      <div className="mt-10">
        <div style={{ borderTop: "1px solid var(--kas-ink)", paddingTop: 14, paddingBottom: 14 }}>
          <div className="flex items-baseline justify-between">
            <MonoLabel size={10}>Kasbon &amp; Tunjangan Harian Mei 2026</MonoLabel>
            <div className="flex gap-6">
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-rust)", letterSpacing: "0.08em" }}>
                Kasbon: −{fmtIDR(totalKasbon)}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-moss)", letterSpacing: "0.08em" }}>
                Tunjangan: +{fmtIDR(totalAllowances)}
              </span>
            </div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderBottom: "1px solid var(--kas-ink)" }}>
              <th style={{ textAlign: "left", padding: "10px 0" }}>Pekerja</th>
              <th style={{ textAlign: "right", padding: "10px 14px" }}>Kasbon</th>
              <th style={{ textAlign: "right", padding: "10px 0 10px 14px" }}>Tunjangan Harian</th>
            </tr>
          </thead>
          <tbody>
            {WORKERS.map((w) => {
              const kasbon     = CASH_ADVANCES.filter((ca) => ca.workerId === w.id).reduce((s, ca) => s + ca.amount, 0);
              const allowances = DAILY_ALLOWANCES.filter((da) => da.workerId === w.id).reduce((s, da) => s + da.amount, 0);
              if (kasbon === 0 && allowances === 0) return null;
              return (
                <tr key={w.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <td style={{ padding: "12px 14px 12px 0" }}>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{w.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.role}</div>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: kasbon > 0 ? "var(--kas-rust)" : "var(--kas-ink-4)" }}>
                    {kasbon > 0 ? `−${fmtIDR(kasbon)}` : "—"}
                  </td>
                  <td style={{ padding: "12px 0 12px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: allowances > 0 ? "var(--kas-moss)" : "var(--kas-ink-4)" }}>
                    {allowances > 0 ? `+${fmtIDR(allowances)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <td style={{ padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>−{fmtIDR(totalKasbon)}</td>
              <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-moss)" }}>+{fmtIDR(totalAllowances)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Footer />
    </div>
  );
}
