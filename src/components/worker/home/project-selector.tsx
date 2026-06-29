import type { Project } from "@/lib/data";
import { Kicker, MonoLabel } from "@/components/primitives";

type Session = { id: number; projectId: string; in: string; out: string | null };

function fmtDurStr(mins: number) {
  return `${Math.floor(mins / 60)}j ${String(mins % 60).padStart(2, "0")}m`;
}

function sessionMinutes(inTime: string, outTime: string | null): number {
  if (!outTime) return 0;
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  return Math.max(0, toMin(outTime) - toMin(inTime));
}

export function ProjectSelector({
  projects,
  sessions,
  selectedProjectId,
  activeSession,
  absentProjects,
  onSelect,
}: {
  projects: Project[];
  sessions: Session[];
  selectedProjectId: string;
  activeSession: Session | undefined;
  absentProjects: { id: string; reason: string }[];
  onSelect: (id: string) => void;
}) {
  const minByProj = (pid: string) =>
    sessions.filter((s) => s.projectId === pid).reduce((a, x) => a + sessionMinutes(x.in, x.out), 0);

  return (
    <div className="mt-4">
      <Kicker no="01" label={`PROYEK ANDA · ${projects.length}`} />
      <div className="flex flex-col gap-2">
        {projects.map((p) => {
          const isSelected    = p.id === selectedProjectId;
          const isActive      = activeSession?.projectId === p.id;
          const absentEntry   = absentProjects.find((a) => a.id === p.id);
          const isAbsentProj  = !!absentEntry;
          const mins          = minByProj(p.id);
          const closed        = sessions.filter((s) => s.projectId === p.id && s.out !== null).length;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className="grid gap-3 items-center text-left cursor-pointer p-3.5"
              style={{ gridTemplateColumns: "auto 1fr auto", border: `1px solid ${isSelected ? "var(--kas-ink)" : "var(--kas-line)"}`, background: isSelected ? "var(--kas-paper-2)" : "var(--kas-paper)" }}
            >
              <span className="grid place-items-center" style={{ width: 28, height: 28, background: isActive ? "var(--kas-cobalt)" : "var(--kas-paper)", border: `1px solid ${isActive ? "var(--kas-cobalt)" : isAbsentProj ? "var(--kas-ochre)" : "var(--kas-line)"}`, color: isActive ? "var(--kas-paper)" : isAbsentProj ? "var(--kas-ochre)" : "var(--kas-ink-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                {isActive ? "●" : isAbsentProj ? "✕" : closed > 0 ? "✓" : "○"}
              </span>
              <div className="min-w-0">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                  {isActive ? `Sedang bekerja · sejak ${activeSession?.in}` : isAbsentProj ? `Tidak hadir · ${absentEntry!.reason}` : mins > 0 ? `${fmtDurStr(mins)} · ${closed} sesi` : p.address}
                </div>
              </div>
              <MonoLabel size={9}>{isActive ? "AKTIF" : isAbsentProj ? "ABSEN" : closed > 0 ? "SELESAI" : "MULAI"}</MonoLabel>
            </button>
          );
        })}
      </div>
    </div>
  );
}
