import type { Project } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";

export function ProyekSheet({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-4">
      {projects.map((p, i) => (
        <div key={p.id} className="grid gap-3 py-3.5" style={{ gridTemplateColumns: "auto 1fr auto", borderTop: "1px solid var(--kas-line-2)" }}>
          <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
          <div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.name}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.progress}%</div>
          </div>
          <div className="relative self-center" style={{ width: 48, height: 6, background: "var(--kas-line-2)" }}>
            <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
