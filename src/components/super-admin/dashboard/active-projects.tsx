import type { Project } from "@/lib/data";
import { MonoLabel, StatusPill } from "@/components/primitives";
import { SectionHead } from "../shared";

export function ActiveProjects({ projects, onSelect }: { projects: Project[]; onSelect: (id: string) => void }) {
  return (
    <section>
      <SectionHead no="02" kicker="DALAM PENGERJAAN">Proyek aktif, <em>sedang berjalan.</em></SectionHead>
      <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="w-full grid gap-4 items-center py-4 text-left cursor-pointer"
            style={{ gridTemplateColumns: "28px 1fr 1fr auto", border: "none", background: "transparent", borderBottom: "1px solid var(--kas-line)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--kas-paper-2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
            <div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.client.name}</div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1" style={{ height: 4, background: "var(--kas-line-2)", maxWidth: 140 }}>
                <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
              </div>
              <MonoLabel size={11}>{p.progress}%</MonoLabel>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={p.status} />
              <span style={{ color: "var(--kas-ink-3)", fontSize: 18 }}>→</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
