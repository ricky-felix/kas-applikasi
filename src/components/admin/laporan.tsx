"use client";
import { useState } from "react";
import { useProjects } from "@/lib/projects-store";
import { useWorkReports } from "@/lib/stores";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

const PHASES = ["Sebelum", "Sedang", "Sesudah"] as const;

// Distribute photo count across phases for display
function distributePhotos(total: number): Record<string, number> {
  if (total === 0) return {};
  if (total === 1) return { Sedang: 1 };
  if (total === 2) return { Sebelum: 1, Sesudah: 1 };
  return { Sebelum: 1, Sedang: total - 2, Sesudah: 1 };
}

// Subtle grey-tone placeholder backgrounds per phase
const PHASE_BG: Record<string, string> = {
  Sebelum: "var(--kas-paper-2)",
  Sedang:  "var(--kas-line-2)",
  Sesudah: "var(--kas-paper-2)",
};

export default function AMLaporan() {
  const PROJECTS = useProjects();
  const WORK_REPORTS = useWorkReports();
  const [filterProject, setFilterProject] = useState("all");

  const projects = PROJECTS.filter((p) =>
    WORK_REPORTS.some((r) => r.projectId === p.id)
  );

  const visibleProjects = projects.filter(
    (p) => filterProject === "all" || p.id === filterProject
  );

  const totalReports = WORK_REPORTS.filter(
    (r) => filterProject === "all" || r.projectId === filterProject
  ).length;

  return (
    <div className="pt-4 pb-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-5">
        <Kicker no="02" label={`${totalReports} LAPORAN HARI INI`} />
        <DisplayHeading size={28}>Laporan,<br /><em>dari lapangan.</em></DisplayHeading>

        {/* Project filter */}
        <div className="relative mt-4">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full appearance-none px-3.5 py-2.5 pr-8"
            style={{
              border: "1px solid var(--kas-ink)",
              background: "var(--kas-paper)",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--kas-ink)", cursor: "pointer", outline: "none",
            }}
          >
            <option value="all">Semua Proyek</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.address}</option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>▾</span>
        </div>
      </div>

      {/* ── Project groups ──────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-col gap-6">
        {visibleProjects.map((proj) => {
          const reports = WORK_REPORTS.filter((r) => r.projectId === proj.id);
          if (reports.length === 0) return null;

          return (
            <div key={proj.id}>
              {/* Project header */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.1 }}>{proj.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", opacity: 0.6, marginTop: 3 }}>
                    {proj.code} · {reports.length} LAPORAN
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, lineHeight: 1, opacity: 0.25 }}>
                  {reports.length}
                </span>
              </div>

              {/* Report cards */}
              <div>
                {reports.map((r, ri) => {
                  const photoMap  = distributePhotos(r.photos);
                  const allPhotos = PHASES.flatMap((ph) =>
                    Array.from({ length: photoMap[ph] ?? 0 }, (_, i) => ({ phase: ph, idx: i }))
                  );

                  return (
                    <div
                      key={r.id}
                      className="px-5 pt-4 pb-5"
                      style={{ borderBottom: ri < reports.length - 1 ? "1px solid var(--kas-line)" : "none", background: "var(--kas-paper)" }}
                    >
                      {/* Worker + date row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="grid place-items-center flex-shrink-0"
                            style={{ width: 34, height: 34, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500 }}
                          >
                            {r.workerShort}
                          </div>
                          <div>
                            <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{r.workerName}</div>
                            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              Team Leader
                            </div>
                          </div>
                        </div>
                        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>
                          {r.date}
                        </span>
                      </div>

                      {/* Photo grid */}
                      {allPhotos.length > 0 && (
                        <div className="mb-3">
                          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${Math.min(allPhotos.length, 3)}, 1fr)` }}>
                            {allPhotos.map((photo, pi) => (
                              <div
                                key={pi}
                                className="relative flex items-end"
                                style={{
                                  aspectRatio: "1 / 1",
                                  background: PHASE_BG[photo.phase],
                                  border: "1px solid var(--kas-line)",
                                  overflow: "hidden",
                                }}
                              >
                                {/* Camera placeholder icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kas-line)" strokeWidth="1.4">
                                    <rect x="3" y="6" width="18" height="14" />
                                    <circle cx="12" cy="13" r="3.5" />
                                    <path d="M8 6l1.5-2h5L16 6" />
                                  </svg>
                                </div>
                                {/* Phase label */}
                                <span
                                  className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 text-center"
                                  style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(22,28,44,0.55)", color: "#fff" }}
                                >
                                  {photo.phase}
                                </span>
                              </div>
                            ))}
                          </div>
                          {/* Phase summary strip */}
                          <div className="flex gap-px">
                            {PHASES.map((ph) => {
                              const count = photoMap[ph] ?? 0;
                              return (
                                <div
                                  key={ph}
                                  className="flex-1 px-2 py-1.5"
                                  style={{ background: count > 0 ? "var(--kas-paper-2)" : "transparent", border: "1px solid var(--kas-line-2)" }}
                                >
                                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{ph}</div>
                                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500, lineHeight: 1, marginTop: 1, color: count > 0 ? "var(--kas-ink)" : "var(--kas-ink-4)" }}>
                                    {count > 0 ? String(count).padStart(2, "0") : "—"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Catatan harian */}
                      <div>
                        <MonoLabel size={8}>CATATAN HARIAN</MonoLabel>
                        <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15, lineHeight: 1.65, color: "var(--kas-ink-2)", margin: "6px 0 0" }}>
                          {r.note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {visibleProjects.length === 0 && (
          <div className="px-5 py-10 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Tidak ada laporan
          </div>
        )}
      </div>
    </div>
  );
}
