"use client";
import { PROJECTS, WORKERS, EXPENSES, CASHFLOW_MAY, PAYROLL_MAY, MATERIALS, TODAY_SHORT, fmtIDR, fmtIDRshort, payrollTotal } from "@/lib/data";
import { TopBar, SectionHead, Footer } from "./shared";
import { StatsGrid } from "./dashboard/stats-grid";
import { ActiveProjects } from "./dashboard/active-projects";
import { ActivityFeed } from "./dashboard/activity-feed";
import { PortfolioBreakdown } from "./dashboard/portfolio-breakdown";
import { CostWaterfall } from "./dashboard/cost-waterfall";
import { WorkerEfficiency } from "./dashboard/worker-efficiency";
import { MaterialCards } from "./dashboard/material-cards";

export default function Dashboard({ goProject, goProjects }: { goProject: (id: string) => void; goProjects: () => void }) {
  const active        = PROJECTS.filter((p) => p.status === "Active");
  const outstanding   = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersOnSite = WORKERS.filter((w) => active.some((p) => p.assigned.includes(w.id))).length;

  const totalContract = PROJECTS.reduce((s, p) => s + p.contractValue, 0);
  const totalPaid     = PROJECTS.reduce((s, p) => s + p.paid, 0);
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalPayroll  = PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0);
  const totalOpex     = totalExpenses + totalPayroll;
  const netProfit     = totalPaid - totalOpex;

  const grossMarginPct  = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
  const outstandingPct  = totalContract > 0 ? (outstanding / totalContract) * 100 : 0;
  const payrollRatioPct = totalPaid > 0 ? (totalPayroll / totalPaid) * 100 : 0;
  const avgProgress     = active.length > 0 ? Math.round(active.reduce((s, p) => s + p.progress, 0) / active.length) : 0;

  const stats = [
    { n: "01", label: "Proyek aktif",        value: String(active.length).padStart(2, "0"), sub: `${PROJECTS.length} total`,           accentColor: "var(--kas-cobalt)" },
    { n: "02", label: "Pendapatan bulan ini", value: fmtIDRshort(24850000),                  sub: "+12% vs Apr",                         accentColor: "var(--kas-moss)"   },
    { n: "03", label: "Belum dibayar",        value: fmtIDRshort(outstanding),               sub: "2 termin pending",                    accentColor: "var(--kas-rust)"   },
    { n: "04", label: "Pekerja di lapangan",  value: String(workersOnSite).padStart(2, "0"), sub: `${WORKERS.length} pekerja total`,     accentColor: "var(--kas-ochre)"  },
  ];

  const derived = [
    { accentColor: "var(--kas-cobalt)", from: `${active.length} proyek aktif`,                         label: "Rata-rata progres",          value: `${avgProgress}%`,                 sub: active.map(p => `${p.name.split(" ")[0]}: ${p.progress}%`).join(" · "), healthy: avgProgress >= 50,        formula: `(${active.map(p => p.progress).join(" + ")}) ÷ ${active.length} proyek`                 },
    { accentColor: "var(--kas-moss)",   from: `pendapatan terkumpul ${fmtIDRshort(totalPaid)}`,        label: "Margin kotor",               value: `${grossMarginPct.toFixed(1)}%`,   sub: `Laba ${fmtIDRshort(netProfit)} setelah semua biaya`,                   healthy: grossMarginPct > 25,      formula: `${fmtIDRshort(netProfit)} ÷ ${fmtIDRshort(totalPaid)}`                                   },
    { accentColor: "var(--kas-rust)",   from: `total kontrak ${fmtIDRshort(totalContract)}`,           label: "Persentase belum terbayar",  value: `${outstandingPct.toFixed(0)}%`,   sub: `${fmtIDRshort(outstanding)} dari ${fmtIDRshort(totalContract)} kontrak`, healthy: outstandingPct < 30,      formula: `${fmtIDRshort(outstanding)} ÷ ${fmtIDRshort(totalContract)}`                             },
    { accentColor: "var(--kas-ochre)",  from: `${WORKERS.length} pekerja, gaji ${fmtIDRshort(totalPayroll)}`, label: "Beban gaji",         value: `${payrollRatioPct.toFixed(1)}%`,  sub: `${fmtIDRshort(totalPayroll)} dari ${fmtIDRshort(totalPaid)} pendapatan`, healthy: payrollRatioPct < 20,     formula: `${fmtIDRshort(totalPayroll)} ÷ ${fmtIDRshort(totalPaid)}`                                },
  ];

  const projectData = PROJECTS.map(p => {
    const expenses  = EXPENSES.filter(e => e.projectId === p.id).reduce((s, e) => s + e.amount, 0);
    const wages     = PAYROLL_MAY.reduce((s, pw) => { const proj = pw.projects.find(x => x.projectId === p.id); return proj ? s + (proj.daysPresent + proj.daysHalf * 0.5) * pw.rate : s; }, 0);
    const totalCost = expenses + wages;
    const net       = p.paid - totalCost;
    const marginPct = p.paid > 0 ? (net / p.paid) * 100 : 0;
    const paidPct   = p.contractValue > 0 ? (p.paid / p.contractValue) * 100 : 0;
    const outstandingPct2 = p.contractValue > 0 ? ((p.contractValue - p.paid) / p.contractValue) * 100 : 0;
    const costPct   = p.paid > 0 ? Math.min((totalCost / p.paid) * 100, 100) : 0;
    return { ...p, expenses, wages, totalCost, net, marginPct, paidPct, outstandingPct: outstandingPct2, costPct };
  });

  const matAmt   = EXPENSES.filter(e => e.category === "Material").reduce((s, e) => s + e.amount, 0);
  const transAmt = EXPENSES.filter(e => e.category === "Transport").reduce((s, e) => s + e.amount, 0);
  const otherAmt = EXPENSES.filter(e => e.category === "Lain-lain").reduce((s, e) => s + e.amount, 0);

  const waterfall = [
    { label: "Pendapatan terkumpul",  amount: totalPaid,          pct: 100,                                            type: "base" as const },
    { label: "Material",              amount: matAmt,             pct: (matAmt / totalPaid) * 100,                     type: "out"  as const },
    { label: "Upah pekerja",          amount: totalPayroll,       pct: (totalPayroll / totalPaid) * 100,               type: "out"  as const },
    { label: "Transport & lain-lain", amount: transAmt + otherAmt, pct: ((transAmt + otherAmt) / totalPaid) * 100,    type: "out"  as const },
    { label: "Laba kotor",            amount: netProfit,          pct: (netProfit / totalPaid) * 100,                  type: "net"  as const },
  ];

  const WORKING_DAYS = 24;
  const workerRows = PAYROLL_MAY.map(pw => {
    const totalDays = pw.projects.reduce((s, p) => s + p.daysPresent + p.daysHalf * 0.5, 0);
    const wages     = payrollTotal(pw);
    const utilPct   = (totalDays / WORKING_DAYS) * 100;
    const revCredit = pw.projects.reduce((s, proj) => {
      const project = PROJECTS.find(p => p.id === proj.projectId);
      if (!project) return s;
      const projAllDays = PAYROLL_MAY.reduce((sum, w2) => { const p2 = w2.projects.find(x => x.projectId === proj.projectId); return p2 ? sum + p2.daysPresent + p2.daysHalf * 0.5 : sum; }, 0);
      return s + (projAllDays > 0 ? project.paid * ((proj.daysPresent + proj.daysHalf * 0.5) / projAllDays) : 0);
    }, 0);
    const revPerDay  = totalDays > 0 ? revCredit / totalDays : 0;
    const workerRole = WORKERS.find(w => w.id === pw.workerId)?.role ?? "";
    return { ...pw, totalDays, wages, utilPct, revPerDay, workerRole };
  }).sort((a, b) => b.revPerDay - a.revPerDay);

  const maxRevPerDay = Math.max(...workerRows.map(w => w.revPerDay), 1);

  return (
    <div className="pb-14" style={{ fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <div className="px-9 pt-7">
        <TopBar title="Dashboard" />
        <SectionHead no="01" kicker={`${TODAY_SHORT} · LIVE`}>Empat angka, <em>satu pagi.</em></SectionHead>

        <StatsGrid stats={stats} derived={derived} />

        <div className="grid gap-9 mt-11" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
          <ActiveProjects projects={active} onSelect={goProject} />
          <ActivityFeed />
        </div>

        <PortfolioBreakdown projects={projectData} />

        <div className="grid gap-10 mt-14" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <CostWaterfall items={waterfall} />
          <WorkerEfficiency workers={workerRows} maxRevPerDay={maxRevPerDay} />
        </div>

        <MaterialCards />
        <Footer />
      </div>
    </div>
  );
}
