"use client";
import { useState } from "react";
import { type Worker, type Project } from "@/lib/data";
import { useProjects } from "@/lib/projects-store";

export function PekerjaSheet({ workers, activeProjects }: { workers: Worker[]; activeProjects: Project[] }) {
  const PROJECTS = useProjects();
  // assignments: workerId → set of projectIds
  const [assignments, setAssignments] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(
      workers.map((w) => {
        const assigned = activeProjects.filter((p) => p.assigned.includes(w.id)).map((p) => p.id);
        return [w.id, new Set(assigned)];
      })
    )
  );

  // kepala proyek designation per worker
  const [kepala, setKepala] = useState<Set<string>>(
    () => new Set(workers.filter((w) => w.isKepalaProyek).map((w) => w.id))
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleProject = (workerId: string, projId: string) => {
    setAssignments((prev) => {
      const s = new Set(prev[workerId]);
      s.has(projId) ? s.delete(projId) : s.add(projId);
      return { ...prev, [workerId]: s };
    });
  };

  const toggleKepala = (workerId: string) => {
    setKepala((prev) => {
      const s = new Set(prev);
      s.has(workerId) ? s.delete(workerId) : s.add(workerId);
      return s;
    });
  };

  return (
    <div className="mt-4">
      {workers.map((w) => {
        const workerProjs  = [...(assignments[w.id] ?? new Set())];
        const isKepala     = kepala.has(w.id);
        const isExpanded   = expandedId === w.id;

        return (
          <div key={w.id} style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {/* Worker row */}
            <div className="grid gap-3 items-center py-3.5" style={{ gridTemplateColumns: "32px 1fr auto" }}>
              <div className="grid place-items-center" style={{ width: 32, height: 32, background: isKepala ? "var(--kas-ink)" : "var(--kas-paper-2)", color: isKepala ? "var(--kas-paper)" : "var(--kas-ink)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500 }}>
                {w.short}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{w.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>
                  {w.role}{isKepala ? " · Team Leader" : ""}
                  {workerProjs.length > 0
                    ? ` · ${workerProjs.map((id) => PROJECTS.find((p) => p.id === id)?.address).filter(Boolean).join(", ")}`
                    : " · Belum ditugaskan"
                  }
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : w.id)}
                style={{ border: "1px solid var(--kas-line)", background: isExpanded ? "var(--kas-ink)" : "var(--kas-paper)", color: isExpanded ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 10px", cursor: "pointer" }}
              >
                {isExpanded ? "Tutup" : "Atur"}
              </button>
            </div>

            {/* Expanded options */}
            {isExpanded && (
              <div className="pb-4 flex flex-col gap-3">
                {/* Project picker — multi-select */}
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 6 }}>
                    Proyek (boleh lebih dari satu)
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {activeProjects.map((p) => {
                      const checked = assignments[w.id]?.has(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProject(w.id, p.id)}
                          className="w-full flex items-center gap-3 text-left"
                          style={{ border: `1px solid ${checked ? "var(--kas-ink)" : "var(--kas-line)"}`, background: checked ? "var(--kas-ink)" : "var(--kas-paper)", color: checked ? "var(--kas-paper)" : "var(--kas-ink)", padding: "10px 12px", cursor: "pointer" }}
                        >
                          <span style={{ width: 14, height: 14, border: `1px solid ${checked ? "var(--kas-paper)" : "var(--kas-line)"}`, background: checked ? "var(--kas-paper)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink)" }}>
                            {checked ? "✓" : ""}
                          </span>
                          <div>
                            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{p.name}</div>
                            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, opacity: 0.6, marginTop: 1, letterSpacing: "0.1em" }}>{p.code} · {p.progress}% selesai</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Leader toggle */}
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 6 }}>
                    Jabatan
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleKepala(w.id)}
                    className="w-full flex items-center gap-3"
                    style={{ border: `1px solid ${isKepala ? "var(--kas-ink)" : "var(--kas-line)"}`, background: isKepala ? "var(--kas-ink)" : "var(--kas-paper)", color: isKepala ? "var(--kas-paper)" : "var(--kas-ink)", padding: "10px 12px", cursor: "pointer" }}
                  >
                    <span style={{ width: 14, height: 14, border: `1px solid ${isKepala ? "var(--kas-paper)" : "var(--kas-line)"}`, background: isKepala ? "var(--kas-paper)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink)" }}>
                      {isKepala ? "✓" : ""}
                    </span>
                    <div>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>Team Leader</div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, opacity: 0.6, marginTop: 1, letterSpacing: "0.1em" }}>Wajib isi laporan harian saat pulang</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
