import { WORK_REPORTS, PROJECTS } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";

export function LaporanSheet() {
  // Group today's reports by project
  const today   = WORK_REPORTS.filter((r) => r.date === WORK_REPORTS[0]?.date); // same day as most recent
  const allReports = WORK_REPORTS; // show all for demo

  const byProject = PROJECTS
    .filter((p) => allReports.some((r) => r.projectId === p.id))
    .map((p) => ({
      project: p,
      reports: allReports.filter((r) => r.projectId === p.id),
    }));

  const totalReports = allReports.length;
  const totalPhotos  = allReports.reduce((s, r) => s + r.photos, 0);

  return (
    <div className="mt-4">
      {/* Summary row */}
      <div
        className="flex justify-between items-center px-4 py-3 mb-4"
        style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}
      >
        <MonoLabel size={9}>Hari ini</MonoLabel>
        <div className="flex gap-4">
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
            {String(totalReports).padStart(2, "0")}{" "}
            <span style={{ color: "var(--kas-ink-3)", fontSize: 9 }}>LAPORAN</span>
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
            {String(totalPhotos).padStart(2, "0")}{" "}
            <span style={{ color: "var(--kas-ink-3)", fontSize: 9 }}>FOTO</span>
          </span>
        </div>
      </div>

      {byProject.map(({ project: p, reports }) => (
        <div key={p.id} className="mb-5">
          {/* Project header */}
          <div
            className="px-3 py-2 mb-2"
            style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}
          >
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, lineHeight: 1.2 }}>
              {p.name}
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, opacity: 0.5, letterSpacing: "0.14em", marginTop: 2 }}>
              {p.code}
            </div>
          </div>

          {/* Reports */}
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex gap-3 py-3 px-1"
              style={{ borderBottom: "1px solid var(--kas-line-2)" }}
            >
              {/* Avatar */}
              <div
                className="grid place-items-center flex-shrink-0"
                style={{
                  width: 32, height: 32,
                  background: "var(--kas-paper-2)",
                  border: "1px solid var(--kas-line)",
                  fontFamily: "var(--font-newsreader), serif",
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {r.workerShort}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600 }}>
                    {r.workerName}
                  </span>
                  {r.photos > 0 && (
                    <span
                      className="flex-shrink-0 px-1.5 py-0.5"
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 8, letterSpacing: "0.12em",
                        background: "var(--kas-paper-2)",
                        border: "1px solid var(--kas-line)",
                        color: "var(--kas-ink-3)",
                      }}
                    >
                      {r.photos} FOTO
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 12, lineHeight: 1.5,
                    color: "var(--kas-ink-2)", marginTop: 3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {r.note}
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 3, letterSpacing: "0.08em" }}>
                  {r.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
