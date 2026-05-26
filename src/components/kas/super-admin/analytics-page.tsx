"use client";
import {
  PROJECTS, EXPENSES, PAYROLL_MAY, MATERIALS, WORKERS,
  WORK_REPORTS, MATERIAL_REQUESTS, CHANGE_ORDERS,
  WEBSITE_MONTHLY, WEBSITE_PAGES, WEBSITE_FUNNEL,
  payrollTotal, fmtIDRshort,
} from "@/lib/data";
import { MonoLabel } from "../ui";
import { Footer } from "./shared";

// ── Shared primitives ─────────────────────────────────────────────────────

function HBar({ pct, color = "var(--kas-ink)", h = 4, bg = "var(--kas-line-2)" }: {
  pct: number; color?: string; h?: number; bg?: string;
}) {
  return (
    <div style={{ position: "relative", height: h, background: bg, flex: 1, minWidth: 0 }}>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}

function SecLabel({ no, kicker }: { no: string; kicker: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.14em" }}>{no}</span>
      <span style={{ flex: 1, height: 1, background: "var(--kas-line)" }} />
      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.2em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{kicker}</span>
    </div>
  );
}

function SecTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 18 }}>
      {children}
    </h2>
  );
}

function ChangeTag({ value, unit = "%" }: { value: number; unit?: string }) {
  const pos = value >= 0;
  return (
    <span style={{
      fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em",
      color: pos ? "var(--kas-moss)" : "var(--kas-rust)",
      border: `1px solid ${pos ? "var(--kas-moss)" : "var(--kas-rust)"}`,
      padding: "1px 5px",
    }}>
      {pos ? "+" : ""}{value}{unit}
    </span>
  );
}

export default function AnalyticsPage() {
  const WORKING_DAYS = 24;

  // ── Website data ──────────────────────────────────────────────────────────
  const cur  = WEBSITE_MONTHLY[WEBSITE_MONTHLY.length - 1];
  const prev = WEBSITE_MONTHLY[WEBSITE_MONTHLY.length - 2];
  const maxVisitors = Math.max(...WEBSITE_MONTHLY.map(m => m.visitors));

  const visitorsChg  = Math.round(((cur.visitors  - prev.visitors)  / prev.visitors)  * 100);
  const inquiriesChg = Math.round(((cur.inquiries  - prev.inquiries) / prev.inquiries) * 100);
  const bounceChg    = cur.bounceRate - prev.bounceRate;

  const funnelSteps = [
    { label: "Pengunjung web",     value: WEBSITE_FUNNEL.visitors,       pct: 100 },
    { label: "Inquiry dikirim",    value: WEBSITE_FUNNEL.inquiries,       pct: (WEBSITE_FUNNEL.inquiries / WEBSITE_FUNNEL.visitors) * 100 },
    { label: "Hubungi via WA",     value: WEBSITE_FUNNEL.waContacts,      pct: (WEBSITE_FUNNEL.waContacts / WEBSITE_FUNNEL.visitors) * 100 },
    { label: "Proyek ditanda tangani", value: WEBSITE_FUNNEL.projectsSigned, pct: (WEBSITE_FUNNEL.projectsSigned / WEBSITE_FUNNEL.visitors) * 100 },
  ];

  // ── App engagement ────────────────────────────────────────────────────────
  const pendingMR = MATERIAL_REQUESTS.filter(r => r.status === "Pending");
  const pendingCO = CHANGE_ORDERS.filter(co => co.status === "Menunggu");

  const appFeatures = [
    { label: "Laporan kerja dikirim",    value: WORK_REPORTS.length,      cap: 20,  color: "var(--kas-cobalt)" },
    { label: "Permintaan material",      value: MATERIAL_REQUESTS.length, cap: 10,  color: "var(--kas-cobalt)" },
    { label: "Change order",             value: CHANGE_ORDERS.length,     cap: 6,   color: "var(--kas-cobalt)" },
  ];

  // ── Employee performance ──────────────────────────────────────────────────
  const employeeRows = PAYROLL_MAY.map(pw => {
    const totalDays  = pw.projects.reduce((s, p) => s + p.daysPresent + p.daysHalf * 0.5, 0);
    const halfDays   = pw.projects.reduce((s, p) => s + p.daysHalf, 0);
    const wages      = payrollTotal(pw);
    const utilPct    = (totalDays / WORKING_DAYS) * 100;
    const reports    = WORK_REPORTS.filter(r => r.workerId === pw.workerId).length;
    const requests   = MATERIAL_REQUESTS.filter(r => r.workerId === pw.workerId).length;
    const revCredit  = pw.projects.reduce((s, proj) => {
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
    const appScore  = Math.min(Math.round((reports * 30 + requests * 20 + (utilPct / 100) * 50)), 100);
    return { ...pw, totalDays, halfDays, wages, utilPct, reports, requests, revPerDay, workerRole: worker?.role ?? "", appScore };
  }).sort((a, b) => b.utilPct - a.utilPct);

  const maxRevPerDay = Math.max(...employeeRows.map(w => w.revPerDay), 1);

  // ── Recommendations ───────────────────────────────────────────────────────
  type RecType = "danger" | "warning" | "info";
  const recs: { type: RecType; label: string; text: string; nav?: string }[] = [];

  MATERIALS.filter(m => m.stock <= m.minStock).forEach(m => {
    recs.push({
      type: "danger",
      label: "Stok Material",
      text: `${m.name} di bawah minimum — ${m.stock} ${m.unit} tersisa (min. ${m.minStock} ${m.unit}). Hubungi ${m.supplier}.`,
      nav: "Material",
    });
  });

  if (pendingMR.length > 0) {
    recs.push({
      type: "warning",
      label: "Permintaan Material",
      text: `${pendingMR.length} permintaan menunggu persetujuan dari ${[...new Set(pendingMR.map(r => r.workerName.split(" ").pop()))].join(", ")}.`,
      nav: "Material",
    });
  }

  if (pendingCO.length > 0) {
    const totalImpact = pendingCO.reduce((s, co) => s + co.costImpact, 0);
    recs.push({
      type: "warning",
      label: "Change Order",
      text: `${pendingCO.length} change order menunggu keputusan — potensi tambahan biaya ${fmtIDRshort(totalImpact)}.`,
      nav: "Proyek",
    });
  }

  const inquiryConvPct = WEBSITE_FUNNEL.visitors > 0
    ? (WEBSITE_FUNNEL.inquiries / WEBSITE_FUNNEL.visitors) * 100 : 0;
  if (inquiryConvPct < 5) {
    recs.push({
      type: "info",
      label: "Situs Web",
      text: `Konversi pengunjung ke inquiry hanya ${inquiryConvPct.toFixed(1)}% — tambahkan tombol CTA di halaman Portofolio dan Beranda.`,
    });
  }

  if (cur.bounceRate > 50) {
    recs.push({
      type: "info",
      label: "Situs Web",
      text: `Bounce rate ${cur.bounceRate}% — halaman Kontak (avg. ${WEBSITE_PAGES[2].avgTime}) paling cepat ditinggalkan. Sederhanakan formulir kontak.`,
    });
  }

  const lowUtilWorkers = employeeRows.filter(w => w.utilPct < 55);
  if (lowUtilWorkers.length > 0) {
    recs.push({
      type: "info",
      label: "Tim",
      text: `${lowUtilWorkers.map(w => w.name.split(" ").pop()).join(", ")} utilisasi di bawah 55% bulan ini — verifikasi absensi atau distribusikan ke proyek lain.`,
      nav: "Tim & Absensi",
    });
  }

  const recColors: Record<RecType, { bg: string; border: string; dot: string }> = {
    danger:  { bg: "hsl(14 70% 98%)",  border: "var(--kas-rust)",   dot: "var(--kas-rust)" },
    warning: { bg: "hsl(38 80% 98%)",  border: "var(--kas-ochre)",  dot: "var(--kas-ochre)" },
    info:    { bg: "hsl(218 70% 98%)", border: "var(--kas-cobalt)", dot: "var(--kas-cobalt)" },
  };

  return (
    <div style={{ fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>

      {/* ── Header — dual-source badge ───────────────────────────────────── */}
      <div className="px-9 pt-7 pb-6" style={{ borderBottom: "1px solid var(--kas-line)" }}>
        <div className="flex justify-between items-center mb-6">
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.22em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
            Analitik
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>Periode</span>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", border: "1px solid var(--kas-ink)", padding: "2px 8px", textTransform: "uppercase" }}>Mei 2026</span>
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 16 }}>
          Performa digital &amp; tim, <em>satu layar.</em>
        </div>

        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>Sumber data</span>
          {[
            { label: "karyaagungsejati.com", color: "var(--kas-cobalt)" },
            { label: "Tauke App",            color: "var(--kas-moss)" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5" style={{ border: "1px solid var(--kas-line)", padding: "4px 10px" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, background: s.color }} />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-9 pt-9 pb-14">

        {/* ── 01 · Website ─────────────────────────────────────────────────── */}
        <section className="mb-12">
          <SecLabel no="01" kicker="karyaagungsejati.com" />
          <SecTitle>Situs web, <em>performa bulan ini.</em></SecTitle>

          <div className="grid gap-9" style={{ gridTemplateColumns: "1.4fr 1fr" }}>

            {/* Left: metric tiles + trend bars */}
            <div>
              {/* KPI tiles */}
              <div className="grid mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--kas-line)" }}>
                {[
                  { label: "Pengunjung",    value: cur.visitors,  change: <ChangeTag value={visitorsChg} /> },
                  { label: "Tampilan",      value: cur.pageViews, change: <ChangeTag value={Math.round(((cur.pageViews - prev.pageViews) / prev.pageViews) * 100)} /> },
                  { label: "Inquiry masuk", value: cur.inquiries, change: <ChangeTag value={inquiriesChg} /> },
                  { label: "Bounce rate",   value: `${cur.bounceRate}%`, change: <ChangeTag value={bounceChg} unit="pp" /> },
                ].map((k, i) => (
                  <div key={i} className="p-3.5" style={{ borderRight: i < 3 ? "1px solid var(--kas-line)" : "none" }}>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
                    {k.change}
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.08em" }}>vs Apr</div>
                  </div>
                ))}
              </div>

              {/* Visitor trend bars */}
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
                  Tren pengunjung (Jan – Mei)
                </div>
                <div className="flex items-end gap-2" style={{ height: 64 }}>
                  {WEBSITE_MONTHLY.map((m, i) => {
                    const barH = Math.round((m.visitors / maxVisitors) * 56);
                    const isCur = i === WEBSITE_MONTHLY.length - 1;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: isCur ? "var(--kas-ink)" : "var(--kas-ink-3)" }}>{m.visitors}</span>
                        <div style={{ width: "100%", height: barH, background: isCur ? "var(--kas-ink)" : "var(--kas-line)" }} />
                        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.08em", color: isCur ? "var(--kas-ink)" : "var(--kas-ink-4)", textTransform: "uppercase" }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: top pages */}
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
                Halaman teratas · Mei 2026
              </div>
              <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
                <div className="grid gap-3 py-2" style={{ gridTemplateColumns: "1fr 48px 48px", borderBottom: "1px solid var(--kas-line)" }}>
                  {["Halaman", "Views", "Avg"].map((h, i) => (
                    <span key={i} style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", textAlign: i > 0 ? "right" : "left" }}>{h}</span>
                  ))}
                </div>
                {WEBSITE_PAGES.map((p, i) => {
                  const pct = (p.views / WEBSITE_PAGES[0].views) * 100;
                  return (
                    <div key={i} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                      <div className="grid gap-3 items-center mb-1.5" style={{ gridTemplateColumns: "1fr 48px 48px" }}>
                        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{p.label}</span>
                        <span style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: i === 0 ? 600 : 400 }}>{p.views}</span>
                        <span style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>{p.avgTime}</span>
                      </div>
                      <HBar pct={pct} h={3} color={i === 0 ? "var(--kas-cobalt)" : "var(--kas-line)"} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 · Conversion funnel ───────────────────────────────────────── */}
        <section className="mb-12">
          <SecLabel no="02" kicker="Corong Konversi" />
          <SecTitle>Dari pengunjung <em>ke proyek.</em></SecTitle>

          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {funnelSteps.map((step, i) => {
              const convFromPrev = i > 0
                ? ((funnelSteps[i].value / funnelSteps[i - 1].value) * 100).toFixed(0) + "% dari langkah sebelumnya"
                : "Titik masuk";
              return (
                <div key={i} className="grid items-center gap-6 py-3.5" style={{ gridTemplateColumns: "180px 1fr 90px 180px", borderBottom: "1px solid var(--kas-line)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 500 }}>{step.label}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{convFromPrev}</div>
                  </div>
                  <HBar pct={step.pct} h={6} color={i === 0 ? "var(--kas-cobalt)" : i === funnelSteps.length - 1 ? "var(--kas-moss)" : "var(--kas-ink)"} />
                  <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 24, fontWeight: 500 }}>{step.value}</div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>
                    {step.pct.toFixed(1)}% dari pengunjung
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 03 · Employee performance ────────────────────────────────────── */}
        <section className="mb-12">
          <SecLabel no="03" kicker="Performa Tim · Mei 2026" />
          <SecTitle>Pekerja, <em>utilisasi &amp; kontribusi.</em></SecTitle>

          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {/* Table header */}
            <div className="grid gap-4 py-2" style={{ gridTemplateColumns: "28px 1.4fr 80px 60px 60px 60px 1fr 80px", borderBottom: "1px solid var(--kas-line)" }}>
              {["#", "Pekerja", "Upah/hari", "Hari", "Setengah", "Laporan", "Utilisasi (24 hari)", "Rev. dikontrib."].map((h, i) => (
                <span key={i} style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
              ))}
            </div>

            {employeeRows.map((w, i) => {
              const utilColor = w.utilPct >= 70 ? "var(--kas-moss)" : w.utilPct >= 50 ? "var(--kas-ochre)" : "var(--kas-rust)";
              return (
                <div key={w.workerId} className="grid gap-4 items-center py-3.5" style={{ gridTemplateColumns: "28px 1.4fr 80px 60px 60px 60px 1fr 80px", borderBottom: "1px solid var(--kas-line)" }}>
                  <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                  <div>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{w.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 1 }}>{w.workerRole}</div>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{fmtIDRshort(w.rate)}</div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, fontWeight: 600 }}>{w.totalDays}</div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: w.halfDays > 0 ? "var(--kas-ochre)" : "var(--kas-ink-3)" }}>{w.halfDays > 0 ? w.halfDays : "—"}</div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{w.reports > 0 ? w.reports : "—"}</div>
                  <div className="flex items-center gap-2">
                    <HBar pct={w.utilPct} h={4} color={utilColor} />
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, minWidth: 32, textAlign: "right", color: utilColor, fontWeight: 600 }}>
                      {w.utilPct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{fmtIDRshort(w.revPerDay)}<span style={{ color: "var(--kas-ink-3)", fontSize: 8 }}>/hr</span></div>
                </div>
              );
            })}

            {/* Summary row */}
            <div className="grid gap-4 items-center py-3" style={{ gridTemplateColumns: "28px 1.4fr 80px 60px 60px 60px 1fr 80px" }}>
              <div />
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>Total Mei</span>
              <div />
              <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>
                {employeeRows.reduce((s, w) => s + w.totalDays, 0)}
              </div>
              <div />
              <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>
                {WORK_REPORTS.length}
              </div>
              <div />
              <div style={{ textAlign: "right", fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>
                {fmtIDRshort(PAYROLL_MAY.reduce((s, e) => s + payrollTotal(e), 0))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 · App engagement ──────────────────────────────────────────── */}
        <section className="mb-12">
          <SecLabel no="04" kicker="Tauke App · Adopsi Fitur" />
          <SecTitle>Penggunaan aplikasi, <em>bulan ini.</em></SecTitle>

          <div className="grid gap-9" style={{ gridTemplateColumns: "1fr 1fr" }}>

            {/* Feature usage bars */}
            <div>
              <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
                {appFeatures.map((f, i) => (
                  <div key={i} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{f.label}</span>
                      <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}>{f.value}</span>
                    </div>
                    <HBar pct={(f.value / f.cap) * 100} h={4} color={f.color} />
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 5, letterSpacing: "0.08em" }}>
                      {f.value} dari target {f.cap} bulan ini
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending queue */}
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>
                Antrian persetujuan
              </div>
              <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
                {pendingMR.length === 0 && pendingCO.length === 0 ? (
                  <div className="py-5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>
                    Tidak ada item menunggu.
                  </div>
                ) : (
                  <>
                    {pendingMR.map((r, i) => (
                      <div key={i} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                        <div className="flex justify-between items-baseline">
                          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.materialName}</span>
                          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ochre)", border: "1px solid var(--kas-ochre)", padding: "1px 5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Material</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                          {r.workerName} · {r.qty} {r.unit} · {r.date}
                        </div>
                      </div>
                    ))}
                    {pendingCO.map((co, i) => (
                      <div key={i} className="py-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
                        <div className="flex justify-between items-baseline">
                          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, flex: 1, marginRight: 8 }}>{co.description.length > 40 ? co.description.slice(0, 40) + "…" : co.description}</span>
                          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-cobalt)", border: "1px solid var(--kas-cobalt)", padding: "1px 5px", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>Change Order</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                          {fmtIDRshort(co.costImpact)} · {co.requestedBy} · {co.date}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 · Recommendations ─────────────────────────────────────────── */}
        <section>
          <SecLabel no="05" kicker="Rekomendasi Peningkatan" />
          <SecTitle>Tindakan yang <em>perlu diambil.</em></SecTitle>

          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {recs.length === 0 ? (
              <div className="py-6" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-moss)", letterSpacing: "0.12em" }}>
                Semua indikator dalam kondisi baik. Tidak ada tindakan mendesak.
              </div>
            ) : (
              recs.map((r, i) => {
                const c = recColors[r.type];
                return (
                  <div
                    key={i}
                    className="grid gap-4 items-start py-4"
                    style={{ gridTemplateColumns: "8px 100px 1fr auto", borderBottom: "1px solid var(--kas-line)", background: c.bg }}
                  >
                    <div style={{ width: 8, height: 8, background: c.dot, marginTop: 4, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", color: c.dot, textTransform: "uppercase", fontWeight: 700, paddingTop: 3 }}>
                      {r.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, lineHeight: 1.5 }}>{r.text}</span>
                    {r.nav && (
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 3 }}>
                        → {r.nav}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
