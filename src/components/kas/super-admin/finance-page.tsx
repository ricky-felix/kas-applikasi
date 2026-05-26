"use client";
import { useState } from "react";
import { CASHFLOW_MAY, EXPENSES, PAYROLL_MAY, fmtIDR, fmtIDRshort, payrollTotal } from "@/lib/data";
import { MonoLabel } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

export default function FinancePage() {
  const [tab, setTab] = useState<"cashflow" | "expenses" | "payroll">("cashflow");
  const [paidWorkers, setPaidWorkers] = useState<Set<string>>(new Set());
  const totalIn  = CASHFLOW_MAY.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = CASHFLOW_MAY.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const totalPayroll = PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0);
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Keuangan" />
      <SectionHead no="06" kicker="MEI 2026">Arus kas, <em>terpantau.</em></SectionHead>

      <div className="grid mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {[
          { l: "Pemasukan",     v: fmtIDRshort(totalIn),       color: "var(--kas-moss)",   accent: "var(--kas-moss)" },
          { l: "Pengeluaran",   v: fmtIDRshort(totalOut),      color: "var(--kas-rust)",   accent: "var(--kas-rust)" },
          { l: "Penggajian",    v: fmtIDRshort(totalPayroll),  color: "var(--kas-ochre)",  accent: "var(--kas-ochre)" },
          { l: "Saldo Bersih",  v: fmtIDRshort(totalIn - totalOut), color: totalIn - totalOut >= 0 ? "var(--kas-moss)" : "var(--kas-rust)", accent: "var(--kas-cobalt)" },
        ].map((s, i) => (
          <div key={i} className="p-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderTop: `3px solid ${s.accent}` }}>
            <MonoLabel size={10}>{s.l}</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 32, lineHeight: 1.0, marginTop: 8, letterSpacing: "-0.02em", color: s.color }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex mb-6" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {[{ k: "cashflow", l: "Arus Kas" }, { k: "expenses", l: "Log Pengeluaran" }, { k: "payroll", l: "Penggajian" }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} style={{ border: "none", background: tab === t.k ? "var(--kas-ink)" : "transparent", color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)", padding: "10px 20px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", borderRight: "1px solid var(--kas-line)" }}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === "cashflow" && (
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
            {CASHFLOW_MAY.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <td style={{ padding: "14px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{e.date}</td>
                <td style={{ padding: "14px", fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{e.description}</td>
                <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>{e.projectCode}</td>
                <td style={{ padding: "14px 0", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-moss)", fontWeight: 600 }}>{e.type === "in" ? fmtIDR(e.amount) : ""}</td>
                <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)", fontWeight: 600 }}>{e.type === "out" ? fmtIDR(e.amount) : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <td colSpan={3} style={{ padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "14px 0", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-moss)" }}>{fmtIDR(totalIn)}</td>
              <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>{fmtIDR(totalOut)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      {tab === "expenses" && (
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
            {EXPENSES.map((e) => {
              const catColor: Record<string, string> = { Material: "var(--kas-cobalt-soft)", Transport: "var(--kas-ochre-soft)", Upah: "var(--kas-moss-soft)", "Lain-lain": "var(--kas-paper-2)" };
              const catInk: Record<string, string> = { Material: "var(--kas-cobalt-ink)", Transport: "var(--kas-ochre-ink)", Upah: "var(--kas-moss-ink)", "Lain-lain": "var(--kas-ink-3)" };
              return (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <td style={{ padding: "14px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{e.date}</td>
                  <td style={{ padding: "14px", fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{e.description}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ padding: "3px 9px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", background: catColor[e.category], color: catInk[e.category] }}>{e.category}</span>
                  </td>
                  <td style={{ padding: "14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{e.by}</td>
                  <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "var(--kas-rust)" }}>{fmtIDR(e.amount)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <td colSpan={4} style={{ padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Pengeluaran</td>
              <td style={{ padding: "14px 0 14px 14px", textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-rust)" }}>{fmtIDR(totalExpenses)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      {tab === "payroll" && (
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
              const total = payrollTotal(entry);
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
      )}
      <Footer />
    </div>
  );
}
