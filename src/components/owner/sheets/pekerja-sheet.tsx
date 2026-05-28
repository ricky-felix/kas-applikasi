import type { Worker, Project } from "@/lib/data";

export function PekerjaSheet({ workers, activeProjects }: { workers: Worker[]; activeProjects: Project[] }) {
  return (
    <div className="mt-4">
      {workers.map((w) => {
        const p = activeProjects.find((pr) => pr.assigned.includes(w.id));
        return (
          <div key={w.id} className="grid gap-3 items-center py-3.5" style={{ gridTemplateColumns: "32px 1fr auto", borderTop: "1px solid var(--kas-line-2)" }}>
            <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500 }}>{w.short}</div>
            <div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{w.name}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{p?.address}</div>
            </div>
            <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", color: "var(--kas-cobalt-ink)", background: "var(--kas-cobalt-soft)" }}>HADIR</span>
          </div>
        );
      })}
    </div>
  );
}
