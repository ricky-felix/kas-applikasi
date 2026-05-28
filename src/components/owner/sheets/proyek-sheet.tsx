import type { Project } from "@/lib/data";
import { WORKERS } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";

export function ProyekSheet({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-4">
      {projects.map((p, i) => {
        const members    = WORKERS.filter((w) => p.assigned.includes(w.id));
        const leader     = members.find((w) => w.isKepalaProyek);
        const teammates  = members.filter((w) => !w.isKepalaProyek);

        return (
          <div key={p.id} className="py-4" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {/* Header row */}
            <div className="grid gap-3 items-start" style={{ gridTemplateColumns: "auto 1fr auto" }}>
              <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>
                  {p.code} · {p.progress}%
                </div>
              </div>
              <div className="relative self-start mt-2" style={{ width: 48, height: 5, background: "var(--kas-line-2)" }}>
                <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
              </div>
            </div>

            {/* Team info */}
            {members.length > 0 && (
              <div className="mt-3 ml-6 flex flex-col gap-2">
                {/* Client / Owner */}
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-4)", width: 72, flexShrink: 0 }}>
                    Owner
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-2)" }}>
                    {p.client.name}
                  </span>
                </div>

                {/* Team Leader */}
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

                {/* Members */}
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
