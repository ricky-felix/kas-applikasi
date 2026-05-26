"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, TODAY_SHORT } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "../ui";

export default function AMAttend({ toast }: { toast: (m: string) => void }) {
  const active = PROJECTS.filter((p) => p.status === "Active");
  const [proj, setProj] = useState(active[0]?.id);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const setMark = (wid: string, s: string) => { setMarks({ ...marks, [wid]: s }); toast(`${s} tercatat.`); };
  const p = PROJECTS.find((x) => x.id === proj);
  const ws = WORKERS.filter((w) => p?.assigned.includes(w.id));

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="LOG HARIAN" />
      <DisplayHeading size={28}>Absensi,<br /><em>{TODAY_SHORT.toLowerCase()}.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-line)" }}>
        <div className="flex gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
          {active.map((x) => (
            <button
              key={x.id}
              onClick={() => setProj(x.id)}
              className="px-3 py-2 whitespace-nowrap cursor-pointer"
              style={{
                border: "1px solid var(--kas-ink)",
                background: proj === x.id ? "var(--kas-ink)" : "var(--kas-paper)",
                color: proj === x.id ? "var(--kas-paper)" : "var(--kas-ink)",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {x.address}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        {ws.map((w) => {
          const mark = marks[w.id];
          return (
            <div key={w.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontWeight: 500 }}>{w.short}</div>
                <div className="flex-1">
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.role}</div>
                </div>
                {mark && <span className="px-2 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{mark}</span>}
              </div>
              <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[{ k: "Hadir", l: "Hadir" }, { k: "Setengah", l: "1/2 Hari" }, { k: "Tidak", l: "Tidak" }].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setMark(w.id, opt.k)}
                    className="py-2.5 cursor-pointer"
                    style={{
                      border: `1px solid ${mark === opt.k ? "var(--kas-ink)" : "var(--kas-line)"}`,
                      background: mark === opt.k ? "var(--kas-ink)" : "var(--kas-paper)",
                      color: mark === opt.k ? "var(--kas-paper)" : "var(--kas-ink)",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
