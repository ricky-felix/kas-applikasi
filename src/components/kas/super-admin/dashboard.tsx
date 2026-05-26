"use client";
import {
  PROJECTS, WORKERS, EXPENSES, CASHFLOW_MAY, PAYROLL_MAY, MATERIALS,
  TODAY_SHORT, fmtIDR, fmtIDRshort, payrollTotal,
} from "@/lib/data";
import { MonoLabel, StatusPill } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

function Bar({ pct, color = "var(--kas-ink)", h = 4, bg = "var(--kas-line-2)" }: {
  pct: number; color?: string; h?: number; bg?: string;
}) {
  return (
    <div style={{ position: "relative", height: h, background: bg, flex: 1, minWidth: 0 }}>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}

export default function Dashboard({ goProject, goProjects }: { goProject: (id: string) => void; goProjects: () => void }) {
  const active        = PROJECTS.filter((p) => p.status === "Active");
  const outstanding   = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersOnSite = WORKERS.filter((w) => active.some((p) => p.assigned.includes(w.id))).length;

  // ── Financials ────────────────────────────────────────────────────────────
  const totalContract = PROJECTS.reduce((s, p) => s + p.contractValue, 0);
  const totalPaid     = PROJECTS.reduce((s, p) => s + p.paid, 0);
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalPayroll  = PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0);
  const totalOpex     = totalExpenses + totalPayroll;
  const netProfit     = totalPaid - totalOpex;
  const cashIn        = CASHFLOW_MAY.filter(e => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const cashOut       = CASHFLOW_MAY.filter(e => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const netCash       = cashIn - cashOut;

  const grossMarginPct  = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
  const collectionPct   = totalContract > 0 ? (totalPaid / totalContract) * 100 : 0;
  const payrollRatioPct = totalPaid > 0 ? (totalPayroll / totalPaid) * 100 : 0;
  const opexRatioPct    = totalPaid > 0 ? (totalOpex   / totalPaid) * 100 : 0;

  // ── Per-project profitability ─────────────────────────────────────────────
  const projectData = PROJECTS.map(p => {
    const expenses    = EXPENSES.filter(e => e.projectId === p.id).reduce((s, e) => s + e.amount, 0);
    const wages       = PAYROLL_MAY.reduce((s, pw) => {
      const proj = pw.projects.find(x => x.projectId === p.id);
      return proj ? s + (proj.daysPresent + proj.daysHalf * 0.5) * pw.rate : s;
    }, 0);
    const totalCost   = expenses + wages;
    const net         = p.paid - totalCost;
    const marginPct   = p.paid > 0 ? (net / p.paid) * 100 : 0;
    const paidPct     = p.contractValue > 0 ? (p.paid / p.contractValue) * 100 : 0;
    const outstandingPct = p.contractValue > 0 ? ((p.contractValue - p.paid) / p.contractValue) * 100 : 0;
    const costPct     = p.paid > 0 ? Math.min((totalCost / p.paid) * 100, 100) : 0;
    return { ...p, expenses, wages, totalCost, net, marginPct, paidPct, outstandingPct, costPct };
  });

  // ── Cost waterfall ────────────────────────────────────────────────────────
  const matAmt   = EXPENSES.filter(e => e.category === "Material").reduce((s, e) => s + e.amount, 0);
  const transAmt = EXPENSES.filter(e => e.category === "Transport").reduce((s, e) => s + e.amount, 0);
  const otherAmt = EXPENSES.filter(e => e.category === "Lain-lain").reduce((s, e) => s + e.amount, 0);

  const waterfall = [
    { label: "Pendapatan terkumpul",  amount: totalPaid,              pct: 100,                                  type: "base" as const },
    { label: "Material",              amount: matAmt,                  pct: (matAmt / totalPaid) * 100,           type: "out"  as const },
    { label: "Upah pekerja",          amount: totalPayroll,            pct: (totalPayroll / totalPaid) * 100,     type: "out"  as const },
    { label: "Transport & lain-lain", amount: transAmt + otherAmt,     pct: ((transAmt + otherAmt) / totalPaid) * 100, type: "out" as const },
    { label: "Laba kotor",            amount: netProfit,               pct: (netProfit / totalPaid) * 100,        type: "net"  as const },
  ];

  // ── Worker efficiency ─────────────────────────────────────────────────────
  const WORKING_DAYS = 24;
  const workerRows = PAYROLL_MAY.map(pw => {
    const totalDays = pw.projects.reduce((s, p) => s + p.daysPresent + p.daysHalf * 0.5, 0);
    const wages     = payrollTotal(pw);
    const utilPct   = (totalDays / WORKING_DAYS) * 100;
    const revCredit = pw.projects.reduce((s, proj) => {
      const project = PROJECTS.find(p => p.id === proj.projectId);
      if (!project) return s;
      const projAllDays = PAYROLL_MAY.reduce((sum, w2) => {
        const p2 = w2.projects.find(x => x.projectId === proj.projectId);
        return p2 ? sum + p2.daysPresent + p2.daysHalf * 0.5 : sum;
      }, 0);
      const workerDays = proj.daysPresent + proj.daysHalf * 0.5;
      return s + (projAllDays > 0 ? project.paid * (workerDays / projAllDays) : 0);
    }, 0);
    const revPerDay = totalDays > 0 ? revCredit / totalDays : 0;
    const worker    = WORKERS.find(w => w.id === pw.workerId);
    return { ...pw, totalDays, wages, utilPct, revPerDay, workerRole: worker?.role ?? "" };
  }).sort((a, b) => b.revPerDay - a.revPerDay);

  const maxRevPerDay = Math.max(...workerRows.map(w => w.revPerDay), 1);

  // ── Operational stats (today) ─────────────────────────────────────────────
  const stats = [
    { n: "01", label: "Proyek aktif",        value: String(active.length).padStart(2, "0"), sub: `${PROJECTS.length} total`,           accentColor: "var(--kas-cobalt)" },
    { n: "02", label: "Pendapatan bulan ini", value: fmtIDRshort(24850000),                  sub: "+12% vs Apr",                         accentColor: "var(--kas-moss)" },
    { n: "03", label: "Belum dibayar",        value: fmtIDRshort(outstanding),               sub: "2 termin pending",                    accentColor: "var(--kas-rust)" },
    { n: "04", label: "Pekerja di lapangan",  value: String(workersOnSite).padStart(2, "0"), sub: `${WORKERS.length} pekerja total`,     accentColor: "var(--kas-ochre)" },
  ];

  // ── Derived ratios — each directly calculated from the stat above it ────
  const avgProgress = active.length > 0
    ? Math.round(active.reduce((s, p) => s + p.progress, 0) / active.length) : 0;
  const outstandingPct = totalContract > 0 ? (outstanding / totalContract) * 100 : 0;

  const derived = [
    {
      accentColor: "var(--kas-cobalt)",
      from: `${active.length} proyek aktif`,
      label: "Rata-rata progres",
      value: `${avgProgress}%`,
      sub: active.map(p => `${p.name.split(" ")[0]}: ${p.progress}%`).join(" · "),
      healthy: avgProgress >= 50,
      formula: `(${active.map(p => p.progress).join(" + ")}) ÷ ${active.length} proyek`,
    },
    {
      accentColor: "var(--kas-moss)",
      from: `pendapatan terkumpul ${fmtIDRshort(totalPaid)}`,
      label: "Margin kotor",
      value: `${grossMarginPct.toFixed(1)}%`,
      sub: `Laba ${fmtIDRshort(netProfit)} setelah semua biaya`,
      healthy: grossMarginPct > 25,
      formula: `${fmtIDRshort(netProfit)} ÷ ${fmtIDRshort(totalPaid)}`,
    },
    {
      accentColor: "var(--kas-rust)",
      from: `total kontrak ${fmtIDRshort(totalContract)}`,
      label: "Persentase belum terbayar",
      value: `${outstandingPct.toFixed(0)}%`,
      sub: `${fmtIDRshort(outstanding)} dari ${fmtIDRshort(totalContract)} kontrak`,
      healthy: outstandingPct < 30,
      formula: `${fmtIDRshort(outstanding)} ÷ ${fmtIDRshort(totalContract)}`,
    },
    {
      accentColor: "var(--kas-ochre)",
      from: `${WORKERS.length} pekerja, gaji ${fmtIDRshort(totalPayroll)}`,
      label: "Beban gaji",
      value: `${payrollRatioPct.toFixed(1)}%`,
      sub: `${fmtIDRshort(totalPayroll)} dari ${fmtIDRshort(totalPaid)} pendapatan`,
      healthy: payrollRatioPct < 20,
      formula: `${fmtIDRshort(totalPayroll)} ÷ ${fmtIDRshort(totalPaid)}`,
    },
  ];

  return (
    <div className="pb-14" style={{ fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <div className="px-9 pt-7">

        <TopBar title="Dashboard" />
        <SectionHead no="01" kicker={`${TODAY_SHORT} · LIVE`}>
          Empat angka, <em>satu pagi.</em>
        </SectionHead>

        {/* ── Row 1: Operational summary ───────────────────────────────────── */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)" }}>
          {stats.map((s, i) => (
            <div key={i} className="p-5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderTop: `3px solid ${s.accentColor}` }}>
              <div className="flex items-center gap-2">
                <MonoLabel size={10}>{s.n}</MonoLabel>
                <span className="flex-1" style={{ height: 1, background: "var(--kas-line-2)" }} />
              </div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, marginTop: 12, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 44, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 8, color: i === 2 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 8, letterSpacing: "0.08em" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Derived ratios — each is a direct function of the cell above ── */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
          {derived.map((d, i) => (
            <div key={i} className="px-5 py-4" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none", borderBottom: `3px solid ${d.accentColor}` }}>
              {/* Source label */}
              <div className="flex items-center gap-1.5 mb-3">
                <span style={{ color: d.accentColor, fontSize: 10, lineHeight: 1 }}>↳</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
                  dari {d.from}
                </span>
              </div>
              {/* Derived label */}
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 10, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{d.label}</div>
              {/* Derived value */}
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1, letterSpacing: "-0.01em", marginTop: 5, color: d.healthy ? "var(--kas-moss)" : "var(--kas-rust)" }}>{d.value}</div>
              {/* Formula */}
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 5, letterSpacing: "0.08em" }}>{d.formula}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.06em" }}>{d.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Active projects + activity feed ──────────────────────────────── */}
        <div className="grid gap-9 mt-11" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
          <section>
            <SectionHead no="02" kicker="DALAM PENGERJAAN">Proyek aktif, <em>sedang berjalan.</em></SectionHead>
            <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
              {active.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goProject(p.id)}
                  className="w-full grid gap-4 items-center py-4 text-left cursor-pointer"
                  style={{ gridTemplateColumns: "28px 1fr 1fr auto", border: "none", background: "transparent", borderBottom: "1px solid var(--kas-line)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--kas-paper-2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                  <div>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.client.name}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-1" style={{ height: 4, background: "var(--kas-line-2)", maxWidth: 140 }}>
                      <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                    </div>
                    <MonoLabel size={11}>{p.progress}%</MonoLabel>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={p.status} />
                    <span style={{ color: "var(--kas-ink-3)", fontSize: 18 }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHead no="03" kicker="HARI INI">Aktivitas <em>lapangan.</em></SectionHead>
            <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
              {[...PROJECTS[0].activity, ...PROJECTS[1].activity].slice(0, 6).map((a, i) => (
                <div key={i} className="grid gap-3.5 items-baseline py-3.5" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line)" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", minWidth: 56 }}>{a.t}</span>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{a.who}</span>
                    <span style={{ color: "var(--kas-ink-3)" }}> — {a.action}</span>
                  </div>
                  {a.action.includes("Hadir") && <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-cobalt)" }} />}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Portfolio breakdown ───────────────────────────────────────────── */}
        <section className="mt-14">
          <SectionHead no="04" kicker="PORTOFOLIO PROYEK">Kontrak per proyek, <em>terbayar vs tersisa.</em></SectionHead>

          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            <div className="flex items-center gap-5 py-2" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              {[
                { fill: "var(--kas-ink)",   label: "Sudah dibayar" },
                { fill: "var(--kas-line)",  label: "Belum terbayar" },
                { fill: "var(--kas-ochre)", label: "Biaya ops (dari bayaran)" },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 10, height: 10, background: l.fill }} />
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{l.label}</span>
                </div>
              ))}
            </div>

            {projectData.map((p, i) => (
              <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                <div className="flex justify-between items-baseline mb-2.5">
                  <div className="flex items-center gap-3">
                    <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                    <div>
                      <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17 }}>{p.name}</span>
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginLeft: 8, letterSpacing: "0.1em" }}>{p.code} · {p.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: p.marginPct < 0 ? "var(--kas-rust)" : "var(--kas-moss)", fontWeight: 600 }}>
                      Margin {p.marginPct.toFixed(0)}%
                    </span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>
                      {fmtIDRshort(p.contractValue)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", minWidth: 56 }}>Tagihan</span>
                  <div style={{ flex: 1, display: "flex", height: 8, gap: 1 }}>
                    <div style={{ width: `${p.paidPct}%`, background: "var(--kas-ink)", flexShrink: 0 }} />
                    <div style={{ width: `${p.outstandingPct}%`, background: "var(--kas-line)", flexShrink: 0 }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", minWidth: 36, textAlign: "right" }}>{p.paidPct.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", minWidth: 56 }}>Biaya</span>
                  <Bar pct={p.costPct} h={4} color={p.marginPct < 0 ? "var(--kas-rust)" : "var(--kas-ochre)"} />
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, minWidth: 36, textAlign: "right", color: p.marginPct < 0 ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>
                    {p.costPct.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cost waterfall + Worker ranking ──────────────────────────────── */}
        <div className="grid gap-10 mt-14" style={{ gridTemplateColumns: "1fr 1fr" }}>

          <section>
            <SectionHead no="05" kicker="ALIRAN LABA">Dari pendapatan <em>ke laba.</em></SectionHead>
            <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
              {waterfall.map((item, i) => {
                const isBase = item.type === "base";
                const isNet  = item.type === "net";
                const isOut  = item.type === "out";
                const barColor = isBase ? "var(--kas-ink)" : isNet ? (item.amount >= 0 ? "var(--kas-moss)" : "var(--kas-rust)") : "var(--kas-ochre)";
                return (
                  <div
                    key={i}
                    className="py-3.5"
                    style={{ borderBottom: isNet ? "none" : "1px solid var(--kas-line)", borderTop: isNet ? "1px solid var(--kas-ink)" : "none" }}
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: isNet ? 14 : 13, fontWeight: isNet ? 600 : 400, color: isOut ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                        {isOut && <span style={{ marginRight: 4, color: "var(--kas-rust)" }}>−</span>}
                        {item.label}
                      </span>
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: isNet ? 700 : 400, color: isNet ? barColor : isOut ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                        {isOut ? "−" : ""}{fmtIDRshort(Math.abs(item.amount))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bar pct={Math.abs(item.pct)} h={isBase || isNet ? 6 : 4} color={barColor} />
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", minWidth: 28, textAlign: "right" }}>
                        {Math.abs(item.pct).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <SectionHead no="06" kicker="EFISIENSI TIM">Pekerja, <em>per hari kerja.</em></SectionHead>
            <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
              <div className="grid gap-3 py-2" style={{ gridTemplateColumns: "26px 1fr 48px 80px", borderBottom: "1px solid var(--kas-line)" }}>
                {["#", "Pekerja", "Hari", "Rev/hari"].map((h, i) => (
                  <span key={i} style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
                ))}
              </div>
              {workerRows.map((w, i) => (
                <div key={w.workerId} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                  <div className="grid gap-3 items-center mb-2" style={{ gridTemplateColumns: "26px 1fr 48px 80px" }}>
                    <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                    <div>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{w.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{w.workerRole}</div>
                    </div>
                    <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{w.totalDays}h</div>
                    <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600 }}>{fmtIDRshort(w.revPerDay)}</div>
                  </div>
                  <div className="flex items-center gap-2" style={{ paddingLeft: 38 }}>
                    <Bar pct={(w.revPerDay / maxRevPerDay) * 100} h={3} />
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", minWidth: 64, textAlign: "right" }}>
                      gaji {fmtIDRshort(w.wages)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Material absorption cards ─────────────────────────────────────── */}
        <section className="mt-14">
          <SectionHead no="07" kicker="MATERIAL · GUDANG">Serapan vs anggaran, <em>per item.</em></SectionHead>

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {MATERIALS.map((m) => {
              const absorbPct = m.budget > 0 ? (m.used / m.budget) * 100 : 0;
              const lowStock  = m.stock <= m.minStock;
              const barColor  = absorbPct >= 90 ? "var(--kas-rust)" : absorbPct >= 70 ? "var(--kas-ochre)" : "var(--kas-ink)";
              return (
                <div
                  key={m.id}
                  className="p-4"
                  style={{
                    border: `1px solid ${lowStock ? "var(--kas-rust)" : "var(--kas-line)"}`,
                    background: lowStock ? "hsl(14 70% 98%)" : "transparent",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.2 }}>{m.name}</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.supplier}</div>
                    </div>
                    {lowStock && (
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--kas-rust)", border: "1px solid var(--kas-rust)", padding: "2px 5px", textTransform: "uppercase", flexShrink: 0 }}>
                        Stok rendah
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Serapan</span>
                    <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, color: barColor }}>{absorbPct.toFixed(0)}%</span>
                  </div>
                  <Bar pct={absorbPct} h={5} color={barColor} />
                  <div className="flex justify-between mt-3">
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>
                      {m.used} / {m.budget} {m.unit}
                    </span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.08em", color: lowStock ? "var(--kas-rust)" : "var(--kas-ink-3)", fontWeight: lowStock ? 700 : 400 }}>
                      sisa {m.stock} {m.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
