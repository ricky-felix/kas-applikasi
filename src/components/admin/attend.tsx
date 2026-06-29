"use client";
import { useState } from "react";
import { TODAY_SHORT } from "@/lib/data";
import { useProjects } from "@/lib/projects-store";
import { useWorkers } from "@/lib/stores";
import { Kicker, DisplayHeading } from "@/components/primitives";

const IZIN_REASONS = ["Sakit", "Acara Keluarga", "Urusan Pribadi", "Cuti", "Yang Lain"];

type Mark = { status: string; reason?: string };

export default function AMAttend({ toast }: { toast: (m: string) => void }) {
  const PROJECTS = useProjects();
  const WORKERS = useWorkers();
  const active = PROJECTS.filter((p) => p.status === "Active");
  const [proj, setProj] = useState(active[0]?.id);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [izinFor, setIzinFor] = useState<string | null>(null);
  const [customFor, setCustomFor] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const setStatus = (wid: string, status: string) => {
    setMarks((m) => ({ ...m, [wid]: { status } }));
    setIzinFor(null);
    setCustomFor(null);
    setCustomReason("");
    toast(`${status} tercatat.`);
  };

  const pickStatus = (wid: string, status: string) => {
    if (status === "Izin") {
      setIzinFor(izinFor === wid ? null : wid);
      setCustomFor(null);
      setCustomReason("");
      return;
    }
    setStatus(wid, status);
  };

  const setIzinReason = (wid: string, reason: string) => {
    if (reason === "Yang Lain") { setCustomFor(wid); return; }
    setMarks((m) => ({ ...m, [wid]: { status: "Izin", reason } }));
    setIzinFor(null);
    setCustomFor(null);
    setCustomReason("");
    toast(`Izin · ${reason} tercatat.`);
  };

  const submitCustom = (wid: string) => {
    if (!customReason.trim()) return;
    setMarks((m) => ({ ...m, [wid]: { status: "Izin", reason: customReason.trim() } }));
    setIzinFor(null);
    setCustomFor(null);
    setCustomReason("");
    toast(`Izin · ${customReason.trim()} tercatat.`);
  };

  const p = PROJECTS.find((x) => x.id === proj);
  const ws = WORKERS.filter((w) => p?.assigned.includes(w.id));

  const STATUS_OPTS = [
    { k: "Hadir",    l: "Hadir"    },
    { k: "Setengah", l: "1/2 Hari" },
    { k: "Izin",     l: "Izin"     },
    { k: "Tidak",    l: "Tidak"    },
  ];

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
          const izinOpen = izinFor === w.id;
          const badge = mark ? (mark.reason ? `${mark.status} · ${mark.reason}` : mark.status) : null;
          return (
            <div key={w.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center" style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontWeight: 500 }}>{w.short}</div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{w.role}</div>
                </div>
                {badge && <span className="px-2 py-0.5 flex-shrink-0" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{badge}</span>}
              </div>
              <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {STATUS_OPTS.map((opt) => {
                  const isSel = mark?.status === opt.k;
                  return (
                    <button
                      key={opt.k}
                      onClick={() => pickStatus(w.id, opt.k)}
                      className="py-2.5 cursor-pointer"
                      style={{
                        border: `1px solid ${isSel || (opt.k === "Izin" && izinOpen) ? "var(--kas-ink)" : "var(--kas-line)"}`,
                        background: isSel || (opt.k === "Izin" && izinOpen) ? "var(--kas-ink)" : "var(--kas-paper)",
                        color: isSel || (opt.k === "Izin" && izinOpen) ? "var(--kas-paper)" : "var(--kas-ink)",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>

              {/* Izin reason picker */}
              {izinOpen && (
                <div className="mt-2" style={{ border: "1px solid var(--kas-ink-3)", background: "var(--kas-paper-2)", padding: "12px" }}>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 10, textAlign: "center" }}>
                    Alasan izin
                  </div>
                  {customFor === w.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitCustom(w.id); }}
                        placeholder="Tulis alasan..."
                        className="flex-1 px-3 py-2.5"
                        style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 15, color: "var(--kas-ink)", outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => submitCustom(w.id)}
                        disabled={!customReason.trim()}
                        style={{ border: "none", background: customReason.trim() ? "var(--kas-ink)" : "var(--kas-line)", color: customReason.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "0 16px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: customReason.trim() ? "pointer" : "default" }}
                      >
                        Kirim
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {IZIN_REASONS.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setIzinReason(w.id, reason)}
                          style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "10px 8px", cursor: "pointer", fontFamily: "var(--font-newsreader), serif", fontSize: 15, textAlign: "center" }}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-center mt-2.5">
                    <button
                      type="button"
                      onClick={() => { setIzinFor(null); setCustomFor(null); setCustomReason(""); }}
                      style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
                    >
                      ← Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
