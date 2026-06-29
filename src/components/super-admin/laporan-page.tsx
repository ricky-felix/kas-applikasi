"use client";
import { useState } from "react";
import { useProjects } from "@/lib/projects-store";
import { useWorkReports, useWorkers } from "@/lib/stores";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

const PHASES = ["Sebelum", "Sedang", "Sesudah"] as const;
const PHASE_BG: Record<string, string> = {
  Sebelum: "var(--kas-paper-2)",
  Sedang:  "var(--kas-line-2)",
  Sesudah: "var(--kas-paper-2)",
};

function distributePhotos(total: number): Record<string, number> {
  if (total === 0) return {};
  if (total === 1) return { Sedang: 1 };
  if (total === 2) return { Sebelum: 1, Sesudah: 1 };
  return { Sebelum: 1, Sedang: total - 2, Sesudah: 1 };
}

export default function LaporanPage() {
  const PROJECTS = useProjects();
  const WORK_REPORTS = useWorkReports();
  const WORKERS = useWorkers();
  const [projFilter, setProjFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");

  const projectsWithReports = PROJECTS.filter((p) =>
    WORK_REPORTS.some((r) => r.projectId === p.id)
  );

  const visible = WORK_REPORTS
    .filter((r) => projFilter   === "all" || r.projectId === projFilter)
    .filter((r) => workerFilter === "all" || r.workerId  === workerFilter);

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Laporan Harian" />
      <div className="flex items-end justify-between mb-4">
        <SectionHead no="10" kicker={`${visible.length} LAPORAN`}>
          Laporan harian, <em>semua proyek.</em>
        </SectionHead>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <select
            value={projFilter}
            onChange={(e) => setProjFilter(e.target.value)}
            className="appearance-none px-3 py-2 pr-7"
            style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--kas-ink)", outline: "none", cursor: "pointer" }}
          >
            <option value="all">Semua Proyek</option>
            {projectsWithReports.map((p) => (
              <option key={p.id} value={p.id}>{p.address}</option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>▾</span>
        </div>

        <div className="relative">
          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="appearance-none px-3 py-2 pr-7"
            style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--kas-ink)", outline: "none", cursor: "pointer" }}
          >
            <option value="all">Semua Pekerja</option>
            {WORKERS.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>▾</span>
        </div>
      </div>

      {/* Reports grouped by project */}
      {projectsWithReports
        .filter((p) => projFilter === "all" || p.id === projFilter)
        .map((proj) => {
          const reports = visible.filter((r) => r.projectId === proj.id);
          if (reports.length === 0) return null;
          return (
            <div key={proj.id} className="mb-8">
              {/* Project header */}
              <div className="flex items-center justify-between px-5 py-3 mb-0" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.1 }}>{proj.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", opacity: 0.6, marginTop: 3 }}>
                    {proj.code} · {reports.length} LAPORAN
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, opacity: 0.25 }}>{reports.length}</span>
              </div>

              {reports.map((r, ri) => {
                const photoMap  = distributePhotos(r.photos);
                const allPhotos = PHASES.flatMap((ph) =>
                  Array.from({ length: photoMap[ph] ?? 0 }, (_, i) => ({ phase: ph, idx: i }))
                );
                const worker = WORKERS.find((w) => w.id === r.workerId);
                return (
                  <div key={r.id} className="px-5 pt-4 pb-5" style={{ borderBottom: ri < reports.length - 1 ? "1px solid var(--kas-line)" : "1px solid var(--kas-ink)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid place-items-center" style={{ width: 34, height: 34, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500 }}>
                          {r.workerShort}
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 700 }}>{r.workerName}</div>
                          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>
                            {worker?.role}{worker?.isKepalaProyek ? " · Kepala Proyek" : ""}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{r.date}</span>
                    </div>

                    {allPhotos.length > 0 && (
                      <div className="mb-3">
                        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${Math.min(allPhotos.length, 3)}, 80px)` }}>
                          {allPhotos.map((photo, pi) => (
                            <div key={pi} className="relative flex items-end" style={{ aspectRatio: "1/1", background: PHASE_BG[photo.phase], border: "1px solid var(--kas-line)", overflow: "hidden", width: 80 }}>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kas-line)" strokeWidth="1.4">
                                  <rect x="3" y="6" width="18" height="14" /><circle cx="12" cy="13" r="3.5" /><path d="M8 6l1.5-2h5L16 6" />
                                </svg>
                              </div>
                              <span className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(22,28,44,0.55)", color: "#fff" }}>
                                {photo.phase}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-px" style={{ maxWidth: 240 }}>
                          {PHASES.map((ph) => {
                            const count = photoMap[ph] ?? 0;
                            return (
                              <div key={ph} className="flex-1 px-2 py-1.5" style={{ background: count > 0 ? "var(--kas-paper-2)" : "transparent", border: "1px solid var(--kas-line-2)" }}>
                                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{ph}</div>
                                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontWeight: 500, color: count > 0 ? "var(--kas-ink)" : "var(--kas-ink-4)" }}>{count > 0 ? String(count).padStart(2, "0") : "—"}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <MonoLabel size={8}>Catatan Harian</MonoLabel>
                      <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.65, color: "var(--kas-ink-2)", margin: "5px 0 0" }}>{r.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      <Footer />
    </div>
  );
}
