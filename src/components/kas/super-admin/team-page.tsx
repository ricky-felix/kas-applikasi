"use client";
import {
  WORKERS, PROJECTS, PAYROLL_MAY, WORK_REPORTS, MATERIAL_REQUESTS,
  fmtIDR, fmtIDRshort, payrollTotal,
} from "@/lib/data";
import { MonoLabel } from "../ui";
import { TopBar, SectionHead, Footer } from "./shared";

const WORKING_DAYS = 24;

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ position: "relative", width: 72, height: 3, background: "var(--kas-line-2)", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}

export default function TeamPage() {
  const workerData = WORKERS.map((w) => {
    const assignedProjects = PROJECTS.filter((p) => p.assigned.includes(w.id));
    const payroll = PAYROLL_MAY.find((pw) => pw.workerId === w.id);
    const totalDays = payroll
      ? payroll.projects.reduce((s, p) => s + p.daysPresent + p.daysHalf * 0.5, 0)
      : 0;
    const wages = payroll ? payrollTotal(payroll) : 0;
    const utilPct = (totalDays / WORKING_DAYS) * 100;

    const revCredit = payroll
      ? payroll.projects.reduce((s, proj) => {
          const project = PROJECTS.find((p) => p.id === proj.projectId);
          if (!project) return s;
          const projAllDays = PAYROLL_MAY.reduce((sum, w2) => {
            const p2 = w2.projects.find((x) => x.projectId === proj.projectId);
            return p2 ? sum + p2.daysPresent + p2.daysHalf * 0.5 : sum;
          }, 0);
          const workerDays = proj.daysPresent + proj.daysHalf * 0.5;
          return s + (projAllDays > 0 ? project.paid * (workerDays / projAllDays) : 0);
        }, 0)
      : 0;

    const revPerDay = totalDays > 0 ? revCredit / totalDays : 0;

    const daysPerProject = payroll
      ? payroll.projects.map((proj) => ({
          projectId: proj.projectId,
          days: proj.daysPresent + proj.daysHalf * 0.5,
          daysHalf: proj.daysHalf,
        }))
      : [];

    return { ...w, assignedProjects, totalDays, wages, utilPct, revCredit, revPerDay, daysPerProject };
  });

  const maxRevPerDay = Math.max(...workerData.map((w) => w.revPerDay), 1);
  const activeWorkers = workerData.filter((w) => w.assignedProjects.length > 0).length;
  const totalDaysAll = workerData.reduce((s, w) => s + w.totalDays, 0);
  const totalReports = WORK_REPORTS.length;
  void MATERIAL_REQUESTS;

  return (
    <div className="px-9 py-7 pb-14" style={{ fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <TopBar title="Tim & Absensi" />
      <SectionHead no="01" kicker={`${WORKERS.length} PEKERJA · MEI 2026`}>
        Tim, <em>aktif di lapangan.</em>
      </SectionHead>

      {/* ── Summary strip ───────────────────────────────────────────────────── */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid var(--kas-ink)", marginBottom: 36 }}>
        {[
          { label: "Aktif di proyek",      value: String(activeWorkers), sub: `dari ${WORKERS.length} pekerja`,  accent: "var(--kas-cobalt)" },
          { label: "Total hari kerja Mei", value: String(totalDaysAll),  sub: "semua pekerja gabungan",          accent: "var(--kas-moss)"   },
          { label: "Laporan terkirim",     value: String(totalReports),  sub: "work reports bulan ini",          accent: "var(--kas-ochre)"  },
        ].map((s, i) => (
          <div key={i} className="py-4 px-5" style={{
            borderRight: i < 2 ? "1px solid var(--kas-line)" : "none",
            borderBottom: "1px solid var(--kas-ink)",
            borderTop: `3px solid ${s.accent}`,
          }}>
            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 10, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, fontWeight: 500, lineHeight: 1, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 6, letterSpacing: "0.08em" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Worker rows ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {/* Header */}
        <div className="grid" style={{
          gridTemplateColumns: "28px 200px 1fr 100px 110px 120px",
          gap: 12,
          padding: "10px 0",
          borderBottom: "1px solid var(--kas-line)",
        }}>
          {["#", "Pekerja", "Proyek Ditangani", "Hari Kerja", "Rev / Hari", "Gaji Mei"].map((h, i) => (
            <div key={i} style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--kas-ink-3)",
              textAlign: i >= 3 ? "right" : "left",
            }}>{h}</div>
          ))}
        </div>

        {workerData.map((w, i) => {
          const utilColor = w.utilPct >= 70 ? "var(--kas-moss)" : w.utilPct >= 50 ? "var(--kas-ochre)" : "var(--kas-rust)";
          return (
            <div key={w.id} className="grid" style={{
              gridTemplateColumns: "28px 200px 1fr 100px 110px 120px",
              gap: 12,
              padding: "20px 0",
              borderBottom: "1px solid var(--kas-line)",
              alignItems: "start",
            }}>

              {/* # */}
              <div style={{ paddingTop: 2 }}>
                <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              </div>

              {/* Worker identity */}
              <div className="flex items-start gap-2.5">
                <div className="grid place-items-center" style={{
                  width: 34, height: 34, flexShrink: 0,
                  background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)",
                  fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 13,
                }}>
                  {w.short}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{w.role}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 1, letterSpacing: "0.08em" }}>{w.phone}</div>
                </div>
              </div>

              {/* Projects */}
              <div className="flex flex-col gap-2.5">
                {w.assignedProjects.length === 0 ? (
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.1em", paddingTop: 8 }}>
                    Tidak ada proyek aktif
                  </span>
                ) : (
                  w.assignedProjects.map((p) => {
                    const dp = w.daysPerProject.find((d) => d.projectId === p.id);
                    return (
                      <div key={p.id}>
                        <div className="flex items-center gap-2">
                          <span style={{ display: "inline-block", width: 6, height: 6, background: p.status === "Active" ? "var(--kas-cobalt)" : "var(--kas-line)", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{p.name}</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", paddingLeft: 14, marginTop: 2 }}>
                          {p.code} · {p.progress}% selesai
                          {dp && ` · ${dp.days} hari`}
                          {dp?.daysHalf ? ` (${dp.daysHalf}× setengah)` : ""}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Days / utilization */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, color: utilColor, lineHeight: 1 }}>
                  {w.totalDays}
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                  dari {WORKING_DAYS} hari
                </div>
                <div className="flex justify-end mt-2">
                  <MiniBar pct={w.utilPct} color={utilColor} />
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: utilColor, marginTop: 3, letterSpacing: "0.08em" }}>
                  {w.utilPct.toFixed(0)}% utilisasi
                </div>
              </div>

              {/* Rev / day */}
              <div style={{ textAlign: "right" }}>
                {w.revPerDay > 0 ? (
                  <>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500, lineHeight: 1 }}>
                      {fmtIDRshort(w.revPerDay)}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>per hari</div>
                    <div className="flex justify-end mt-2">
                      <MiniBar pct={(w.revPerDay / maxRevPerDay) * 100} color="var(--kas-ink)" />
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                      {fmtIDRshort(w.revCredit)} total
                    </div>
                  </>
                ) : (
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)" }}>—</span>
                )}
              </div>

              {/* Wages */}
              <div style={{ textAlign: "right" }}>
                {w.wages > 0 ? (
                  <>
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500, lineHeight: 1 }}>
                      {fmtIDRshort(w.wages)}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                      {fmtIDR(w.rate)}/hari
                    </div>
                  </>
                ) : (
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)" }}>—</span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
