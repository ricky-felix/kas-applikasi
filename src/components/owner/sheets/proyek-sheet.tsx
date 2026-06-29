"use client";
import type { Project } from "@/lib/data";
import { useWorkers } from "@/lib/stores";
import { MonoLabel } from "@/components/primitives";

const MONTH_MAP: Record<string, number> = {
  Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
  Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
};

function parseIdDate(s: string): Date {
  const [day, month, year] = s.split(" ");
  const d = new Date(parseInt(year), MONTH_MAP[month] ?? 0, parseInt(day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function deadlineInfo(start: string, endEst: string) {
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = parseIdDate(start);
  const endDate   = parseIdDate(endEst);
  const totalMs   = endDate.getTime() - startDate.getTime();
  const elapsedMs = today.getTime() - startDate.getTime();
  const totalDays    = Math.round(totalMs / 86400000);
  const elapsedDays  = Math.round(elapsedMs / 86400000);
  const remainingMs  = endDate.getTime() - today.getTime();
  const remainingDays = Math.round(remainingMs / 86400000);
  const timePct = totalDays > 0 ? Math.min(Math.max(elapsedDays / totalDays, 0), 1) : 1;
  const isLate  = remainingDays < 0;

  return { totalDays, elapsedDays, remainingDays, timePct, isLate };
}

export function ProyekSheet({ projects }: { projects: Project[] }) {
  const WORKERS = useWorkers();
  return (
    <div className="mt-4">
      {projects.map((p, i) => {
        const members   = WORKERS.filter((w) => p.assigned.includes(w.id));
        const leader    = members.find((w) => w.isKepalaProyek);
        const teammates = members.filter((w) => !w.isKepalaProyek);

        const { totalDays, remainingDays, timePct, isLate } = deadlineInfo(p.start, p.endEst);

        // Work ahead/behind relative to time consumed
        const workAhead = p.progress / 100 > timePct + 0.1;
        const atRisk    = !isLate && p.progress / 100 < timePct - 0.1;

        const barColor = isLate
          ? "var(--kas-rust)"
          : atRisk
          ? "var(--kas-ochre)"
          : "var(--kas-ink)";

        const statusLabel = isLate
          ? `${Math.abs(remainingDays)} hari terlambat`
          : workAhead
          ? `${remainingDays} hari tersisa · lebih awal`
          : atRisk
          ? `${remainingDays} hari tersisa · risiko`
          : `${remainingDays} hari tersisa`;

        const statusColor = isLate
          ? "var(--kas-rust)"
          : workAhead
          ? "var(--kas-moss-ink)"
          : atRisk
          ? "var(--kas-ochre-ink)"
          : "var(--kas-ink-3)";

        return (
          <div key={p.id} className="py-4" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {/* Header row */}
            <div className="grid gap-3 items-start" style={{ gridTemplateColumns: "auto 1fr auto" }}>
              <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, marginTop: 3, letterSpacing: "0.08em", color: statusColor }}>
                  {p.code} · {statusLabel}
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.06em" }}>
                  {p.start} – {p.endEst} · {totalDays} hari
                </div>
              </div>
              {/* Deadline progress bar */}
              <div className="relative self-start mt-2" style={{ width: 48, height: 5, background: "var(--kas-line-2)" }}>
                <div
                  className="absolute inset-y-0 left-0"
                  style={{ width: `${Math.round(timePct * 100)}%`, background: barColor }}
                />
              </div>
            </div>

            {/* Team info */}
            {members.length > 0 && (
              <div className="mt-3 ml-6 flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-4)", width: 72, flexShrink: 0 }}>
                    Klien
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-2)" }}>
                    {p.client.name}
                  </span>
                </div>
                {leader && (
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-4)", width: 72, flexShrink: 0 }}>
                      Team Leader
                    </span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink)" }}>
                      {leader.name}
                    </span>
                  </div>
                )}
                {teammates.length > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-4)", width: 72, flexShrink: 0 }}>
                      Anggota
                    </span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-2)", lineHeight: 1.6 }}>
                      {teammates.map((w) => w.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
