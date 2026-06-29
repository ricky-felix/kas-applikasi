"use client";
import { Fragment, useState } from "react";
import { fmtIDRshort } from "@/lib/data";
import { useCashFlow } from "@/lib/stores";

type Tab = "semua" | "pendapatan" | "pengeluaran";

const TABS: { k: Tab; l: string }[] = [
  { k: "semua",       l: "Semua"       },
  { k: "pendapatan",  l: "Pendapatan"  },
  { k: "pengeluaran", l: "Pengeluaran" },
];

const BULAN: Record<string, number> = {
  Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
  Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12,
};

function parseEntryDate(str: string): Date {
  const [day, month] = str.split(" ");
  return new Date(2026, (BULAN[month] ?? 5) - 1, parseInt(day));
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const TODAY = new Date(2026, 4, 24); // 24 Mei 2026

const CHIPS = [
  { label: "7 hari",   from: toInputDate(new Date(TODAY.getTime() -   6 * 86400000)), to: toInputDate(TODAY) },
  { label: "30 hari",  from: toInputDate(new Date(TODAY.getTime() -  29 * 86400000)), to: toInputDate(TODAY) },
  { label: "3 bulan",  from: toInputDate(new Date(TODAY.getTime() -  89 * 86400000)), to: toInputDate(TODAY) },
  { label: "6 bulan",  from: toInputDate(new Date(TODAY.getTime() - 179 * 86400000)), to: toInputDate(TODAY) },
  { label: "1 tahun",  from: toInputDate(new Date(TODAY.getTime() - 364 * 86400000)), to: toInputDate(TODAY) },
];

export function RiwayatTab() {
  const CASHFLOW_MAY = useCashFlow();
  const [tab, setTab]         = useState<Tab>("semua");
  const [dateFrom, setFrom]   = useState(toInputDate(new Date(TODAY.getTime() - 29 * 86400000)));
  const [dateTo, setTo]       = useState(toInputDate(TODAY));
  const [showCustom, setShowCustom] = useState(false);

  const applyChip = (from: string, to: string) => { setFrom(from); setTo(to); };

  const handleDownload = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const periodLabel = dateFrom && dateTo ? `${dateFrom} s/d ${dateTo}` : "Semua periode";
    const rows = [...CASHFLOW_MAY].reverse().filter((e) => {
      const d = parseEntryDate(e.date);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo   && d > new Date(dateTo))   return false;
      return true;
    });
    const cashIn  = rows.filter((e) => e.type === "in").reduce((s, e)  => s + e.amount, 0);
    const cashOut = rows.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
    const net     = cashIn - cashOut;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Laporan Keuangan — ${periodLabel}</title>
      <style>
        body { font-family: Georgia, serif; margin: 40px; color: #1a1a2e; font-size: 13px; }
        h1 { font-size: 22px; font-weight: 400; margin: 0 0 4px; }
        .sub { font-family: monospace; font-size: 10px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
        .summary { display: flex; gap: 24px; margin-bottom: 24px; border-top: 2px solid #1a1a2e; border-bottom: 1px solid #ddd; padding: 12px 0; }
        .summary div { flex: 1; }
        .summary .label { font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; }
        .summary .val { font-size: 18px; font-weight: 500; margin-top: 4px; }
        .green { color: #2e7d62; } .red { color: #c0392b; }
        table { width: 100%; border-collapse: collapse; }
        th { font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; text-align: left; padding: 6px 8px; border-bottom: 1px solid #1a1a2e; }
        th.r { text-align: right; }
        td { padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; font-size: 13px; }
        td.r { text-align: right; font-family: monospace; font-weight: 600; font-size: 12px; }
        td .date { font-family: monospace; font-size: 10px; color: #888; margin-top: 2px; }
        @media print { body { margin: 20px; } }
      </style>
    </head><body>
      <h1>Laporan Keuangan</h1>
      <div class="sub">CV Karya Agung Sejati · ${periodLabel}</div>
      <div class="summary">
        <div><div class="label">Masuk</div><div class="val green">+ ${fmtIDRshort(cashIn)}</div></div>
        <div><div class="label">Keluar</div><div class="val red">− ${fmtIDRshort(cashOut)}</div></div>
        <div><div class="label">Neto</div><div class="val ${net >= 0 ? "green" : "red"}">${net >= 0 ? "+" : "−"} ${fmtIDRshort(Math.abs(net))}</div></div>
      </div>
      <table>
        <thead><tr><th>Keterangan</th><th class="r">Masuk</th><th class="r">Keluar</th></tr></thead>
        <tbody>${rows.map((e) => `
          <tr>
            <td>${e.description}<div class="date">${e.date} · ${e.projectCode}</div></td>
            <td class="r green">${e.type === "in" ? `+${fmtIDRshort(e.amount)}` : ""}</td>
            <td class="r red">${e.type === "out" ? `−${fmtIDRshort(e.amount)}` : ""}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const inRange = (str: string) => {
    if (!dateFrom && !dateTo) return true;
    const d = parseEntryDate(str);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo   && d > new Date(dateTo))   return false;
    return true;
  };

  const allFiltered  = [...CASHFLOW_MAY].reverse().filter((e) => inRange(e.date));
  const inFiltered   = allFiltered.filter((e) => e.type === "in");
  const outFiltered  = allFiltered.filter((e) => e.type === "out");

  const cashIn  = inFiltered.reduce((s, e)  => s + e.amount, 0);
  const cashOut = outFiltered.reduce((s, e) => s + e.amount, 0);
  const net     = cashIn - cashOut;

  const visible = tab === "semua" ? allFiltered : tab === "pendapatan" ? inFiltered : outFiltered;

  return (
    <div>
      {/* ── Date range filter ────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
            Periode
          </div>
          <button
            type="button"
            onClick={handleDownload}
            style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", padding: "5px 12px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </button>
        </div>
        {/* Chips row */}
        <div className="flex gap-1.5 flex-wrap">
          {CHIPS.map((c) => {
            const active = !showCustom && dateFrom === c.from && dateTo === c.to;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => { applyChip(c.from, c.to); setShowCustom(false); }}
                style={{
                  border: `1px solid ${active ? "var(--kas-ink)" : "var(--kas-line)"}`,
                  background: active ? "var(--kas-ink)" : "var(--kas-paper)",
                  color:      active ? "var(--kas-paper)" : "var(--kas-ink-3)",
                  padding: "5px 12px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {c.label}
              </button>
            );
          })}
          {/* Custom chip */}
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            style={{
              border: `1px solid ${showCustom ? "var(--kas-ink)" : "var(--kas-line)"}`,
              background: showCustom ? "var(--kas-ink)" : "var(--kas-paper)",
              color:      showCustom ? "var(--kas-paper)" : "var(--kas-ink-3)",
              padding: "5px 12px",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Custom
          </button>
        </div>

        {/* Custom date inputs — revealed when Custom is active */}
        {showCustom && (
          <div className="grid gap-2 mt-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              { label: "Dari",   val: dateFrom, set: setFrom },
              { label: "Sampai", val: dateTo,   set: setTo   },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                  {f.label}
                </div>
                <input
                  type="date"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full px-3 py-2"
                  style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink)", outline: "none" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        {TABS.map((t, i) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            style={{
              border: "none",
              borderRight: i < 2 ? "1px solid var(--kas-line)" : "none",
              borderTop: tab === t.k ? "2px solid var(--kas-ink)" : "2px solid transparent",
              background: tab === t.k ? "var(--kas-ink)" : "transparent",
              color:      tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-3)",
              padding: "10px 0",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Summary strip ────────────────────────────────────────────────── */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid var(--kas-line)" }}>
        {[
          { label: "Masuk",  prefix: "+", value: fmtIDRshort(cashIn),  color: "var(--kas-moss)"  },
          { label: "Keluar", prefix: "−", value: fmtIDRshort(cashOut), color: "var(--kas-rust)"  },
          { label: "Neto",   prefix: net >= 0 ? "+" : "−", value: fmtIDRshort(Math.abs(net)), color: net >= 0 ? "var(--kas-moss)" : "var(--kas-rust)" },
        ].map((s, i) => (
          <div key={i} className="px-3 py-2.5" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, fontWeight: 500, marginTop: 3, color: s.color }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, marginRight: 2 }}>{s.prefix}</span>{s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Semua: flat 3-column grid — one grid for header + all rows so border-right is continuous ── */}
      {tab === "semua" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px" }}>
          {/* Header cells */}
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", borderRight: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)", padding: "8px 10px 8px 0" }}>Keterangan</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-moss)", textAlign: "right", borderRight: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)", padding: "8px 8px 8px 4px" }}>Masuk</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-rust)", textAlign: "right", borderBottom: "1px solid var(--kas-line)", padding: "8px 0 8px 4px" }}>Keluar</div>

          {visible.length === 0
            ? <div className="py-8 text-center" style={{ gridColumn: "1 / -1", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Tidak ada transaksi</div>
            : visible.map((e, i) => (
              <Fragment key={i}>
                {/* Description */}
                <div style={{ borderRight: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line-2)", padding: "12px 10px 12px 0" }}>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.3 }}>{e.description}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{e.date} · {e.projectCode}</div>
                </div>
                {/* Masuk */}
                <div style={{ borderRight: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line-2)", padding: "12px 8px 12px 4px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600, color: "var(--kas-moss)" }}>
                  {e.type === "in" ? `+${fmtIDRshort(e.amount)}` : ""}
                </div>
                {/* Keluar */}
                <div style={{ borderBottom: "1px solid var(--kas-line-2)", padding: "12px 0 12px 4px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600, color: "var(--kas-rust)" }}>
                  {e.type === "out" ? `−${fmtIDRshort(e.amount)}` : ""}
                </div>
              </Fragment>
            ))
          }
        </div>
      )}

      {/* ── Pendapatan / Pengeluaran: single list ────────────────────────── */}
      {tab !== "semua" && (
        <div>
          {visible.length === 0 ? (
            <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Tidak ada transaksi
            </div>
          ) : visible.map((e, i) => (
            <div key={i} className="flex justify-between items-start py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.3 }}>{e.description}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                  {e.date} · {e.projectCode}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600, flexShrink: 0, color: e.type === "in" ? "var(--kas-moss)" : "var(--kas-rust)" }}>
                {e.type === "in" ? "+" : "−"}{fmtIDRshort(e.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
