import { MonoLabel } from "@/components/primitives";
import { SectionHead } from "../shared";

const PHASES = [
  { phase: "Sebelum",    n: 12 },
  { phase: "Pengerjaan", n: 28 },
  { phase: "Sesudah",    n: 7  },
];

export function PhotosTab() {
  return (
    <div>
      <SectionHead no="01" kicker="LOG VISUAL">Foto, <em>tiga fase.</em></SectionHead>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {PHASES.map((g, i) => (
          <div key={i}>
            <div className="relative grid place-items-center" style={{ aspectRatio: "4/3", background: "repeating-linear-gradient(45deg, var(--kas-paper-2) 0 12px, var(--kas-line-2) 12px 13px)", border: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{g.n} foto</MonoLabel>
              <div className="absolute top-2 left-2" style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontStyle: "italic", background: "var(--kas-paper)", padding: "2px 8px" }}>
                {["I","II","III"][i]}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, marginTop: 10 }}>{g.phase}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
