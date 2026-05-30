"use client";
import { useEffect, useState } from "react";
import { PROJECTS } from "@/lib/data";
import { Kicker, MonoLabel } from "@/components/primitives";

export type LemburSession = {
  id: number;
  projectId: string;
  note: string;
  hours: number;
  endsAt: number;
  in: string;
  out: string | null;
};

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

function sessionMinutes(inTime: string, outTime: string | null) {
  if (!outTime) return 0;
  return Math.max(0, toMin(outTime) - toMin(inTime));
}

function fmtDurStr(mins: number) {
  return `${Math.floor(mins / 60)}j ${String(mins % 60).padStart(2, "0")}m`;
}

function fmtCountdown(ms: number) {
  const s  = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return { hh, mm, ss };
}

function useCountdown(endsAt: number) {
  const [msLeft, setMsLeft] = useState(() => Math.max(0, endsAt - Date.now()));
  useEffect(() => {
    const tick = () => setMsLeft(Math.max(0, endsAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return msLeft;
}

const LEMBUR_REASONS = [
  { id: "belum-selesai", label: "Pekerjaan belum selesai", icon: "🔨" },
  { id: "perintah",      label: "Perintah mandor",         icon: "📋" },
  { id: "kejar-target",  label: "Kejar target proyek",     icon: "🎯" },
  { id: "lainnya",       label: "Keperluan lain",          icon: "📝" },
];

const LEMBUR_HOURS = [1, 2, 3, 4, 5];

type Phase = "pick-reason" | "pick-project" | "pending" | "approved" | "pick-hours";

function ActiveLembur({ session, onStop }: { session: LemburSession; onStop: () => void }) {
  const msLeft   = useCountdown(session.endsAt);
  const overtime = msLeft === 0;
  const cd       = fmtCountdown(msLeft);

  return (
    <div style={{ border: `2px solid ${overtime ? "var(--kas-rust)" : "var(--kas-ochre)"}` }}>
      <div
        className="px-4 pt-4 pb-3"
        style={{ background: overtime ? "var(--kas-rust)" : "var(--kas-ochre)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-ink)", opacity: 0.5 }} />
          <MonoLabel size={9} color="var(--kas-ink)">
            {overtime ? "WAKTU LEMBUR HABIS" : `LEMBUR · ${session.hours}J DISETUJUI`}
          </MonoLabel>
        </div>

        <div
          className="flex items-end gap-1"
          style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          <span style={{ fontSize: 52 }}>{cd.hh}</span>
          <span style={{ fontSize: 32, marginBottom: 4, opacity: 0.5 }}>:</span>
          <span style={{ fontSize: 52 }}>{cd.mm}</span>
          <span style={{ fontSize: 32, marginBottom: 4, opacity: 0.5 }}>:</span>
          <span style={{ fontSize: 52 }}>{cd.ss}</span>
        </div>

        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 6, opacity: 0.6 }}>
          {overtime ? "Segera selesaikan pekerjaan" : "Sisa waktu lembur"}
        </div>

        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, marginTop: 8, opacity: 0.65, letterSpacing: "0.08em" }}>
          {PROJECTS.find((p) => p.id === session.projectId)?.address} · Mulai {session.in}
        </div>
      </div>

      <button
        type="button"
        onClick={onStop}
        className="w-full flex items-center justify-center"
        style={{
          border: "none",
          background: "var(--kas-ink)",
          color: "var(--kas-paper)",
          fontFamily: "var(--font-newsreader), serif",
          fontWeight: 500,
          fontSize: 26,
          padding: "20px 16px",
          cursor: "pointer",
        }}
      >
        Selesai <em style={{ marginLeft: 6 }}>lembur.</em>
      </button>
    </div>
  );
}

export function LemburSection({
  projects,
  lemburSessions,
  lemburActive,
  onStart,
  onStop,
  toast,
}: {
  projects: typeof PROJECTS;
  lemburSessions: LemburSession[];
  lemburActive: LemburSession | undefined;
  onStart: (projectId: string, note: string, hours: number) => void;
  onStop: () => void;
  toast: (m: string) => void;
}) {
  const [phase, setPhase]                   = useState<Phase>("pick-reason");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || "");
  const [selectedHours, setSelectedHours]   = useState(0);

  const pendingProj  = PROJECTS.find((p) => p.id === selectedProjId);
  const reasonLabel  = LEMBUR_REASONS.find((r) => r.id === selectedReason)?.label ?? selectedReason;
  const multiProject = projects.length > 1;

  const pastSessions = lemburSessions.filter((s) => s.out !== null);
  const totalDone    = pastSessions.reduce((s, x) => s + sessionMinutes(x.in, x.out), 0);

  const handlePickReason = (reasonId: string) => {
    setSelectedReason(reasonId);
    if (multiProject) {
      setPhase("pick-project");
    } else {
      setSelectedProjId(projects[0]?.id || "");
      submitRequest(projects[0]?.id || "", reasonId);
    }
  };

  const handlePickProject = (projId: string) => {
    setSelectedProjId(projId);
    submitRequest(projId, selectedReason);
  };

  const submitRequest = (projId: string, reason: string) => {
    toast("Permintaan lembur dikirim ke pemilik.");
    setSelectedProjId(projId);
    setSelectedReason(reason);
    setPhase("pending");
  };

  const handleApprove = () => {
    toast("Lembur disetujui! Pilih durasi.");
    setPhase("approved");
  };

  const handlePickHours = (h: number) => {
    setSelectedHours(h);
    setPhase("pick-hours");
  };

  const handleStart = () => {
    onStart(selectedProjId, reasonLabel, selectedHours);
    setPhase("pick-reason");
    setSelectedReason("");
    setSelectedHours(0);
  };

  const handleStop = () => {
    onStop();
    setPhase("pick-reason");
    setSelectedReason("");
    setSelectedHours(0);
  };

  const handleCancel = () => {
    setPhase("pick-reason");
    setSelectedReason("");
    setSelectedHours(0);
  };

  return (
    <div className="mt-5">
      <Kicker no="04" label={`LEMBUR${lemburSessions.length > 0 ? ` · ${fmtDurStr(totalDone)} tercatat` : ""}`} />

      {lemburActive && <ActiveLembur session={lemburActive} onStop={handleStop} />}

      {!lemburActive && phase === "pick-reason" && (
        <div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.2, marginBottom: 14, color: "var(--kas-ink-2)" }}>
            Kenapa perlu lembur?
          </div>
          <div className="flex flex-col gap-2">
            {LEMBUR_REASONS.map((r) => (
              <button key={r.id} type="button" onClick={() => handlePickReason(r.id)}
                className="w-full flex items-center gap-4 text-left"
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "16px 16px", cursor: "pointer" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2 }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!lemburActive && phase === "pick-project" && (
        <div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.2, marginBottom: 4, color: "var(--kas-ink-2)" }}>Di proyek mana?</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ochre)", marginBottom: 14 }}>{reasonLabel}</div>
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <button key={p.id} type="button" onClick={() => handlePickProject(p.id)}
                className="w-full text-left"
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "16px 16px", cursor: "pointer" }}>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{p.address}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.1em" }}>{p.code}</div>
              </button>
            ))}
          </div>
          <button type="button" onClick={handleCancel}
            style={{ marginTop: 10, border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0" }}>
            ← Ubah alasan
          </button>
        </div>
      )}

      {!lemburActive && phase === "pending" && (
        <div style={{ border: "2px solid var(--kas-ochre)" }}>
          <div style={{ background: "var(--kas-ochre)", padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Menunggu persetujuan pemilik</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1.2 }}>{pendingProj?.address}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, marginTop: 3, opacity: 0.7 }}>{reasonLabel}</div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Demo — simulasikan persetujuan pemilik
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr auto" }}>
              <button type="button" onClick={handleApprove}
                style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "14px 0", fontFamily: "var(--font-newsreader), serif", fontSize: 18, cursor: "pointer" }}>
                ✓ Setujui
              </button>
              <button type="button" onClick={handleCancel}
                style={{ border: "1px solid var(--kas-line)", background: "transparent", color: "var(--kas-ink-3)", padding: "14px 16px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {!lemburActive && phase === "approved" && (
        <div>
          <div style={{ background: "var(--kas-moss-soft)", border: "1px solid var(--kas-moss)", padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-moss-ink)", marginBottom: 2 }}>✓ Disetujui</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-moss-ink)" }}>{pendingProj?.address} · {reasonLabel}</div>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.2, marginBottom: 14, color: "var(--kas-ink-2)" }}>Berapa jam lembur?</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {LEMBUR_HOURS.map((h) => (
              <button key={h} type="button" onClick={() => handlePickHours(h)}
                style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", padding: "18px 0", fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, cursor: "pointer", textAlign: "center" }}>
                {h}<span style={{ fontSize: 12 }}>j</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={handleCancel}
            style={{ marginTop: 10, border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0" }}>
            ← Batal
          </button>
        </div>
      )}

      {!lemburActive && phase === "pick-hours" && (
        <div>
          <div style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", padding: "16px" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 6 }}>Ringkasan lembur</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.2, marginBottom: 2 }}>{pendingProj?.address}</div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em", marginBottom: 8 }}>{reasonLabel}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, fontWeight: 500, lineHeight: 1, color: "var(--kas-ochre)" }}>
              {selectedHours}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-ink-3)", marginLeft: 6 }}>JAM</span>
            </div>
          </div>
          <button type="button" onClick={handleStart} className="w-full mt-2"
            style={{ border: "none", background: "var(--kas-ochre)", color: "var(--kas-ink)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 26, padding: "22px 16px", cursor: "pointer", letterSpacing: "-0.01em" }}>
            Mulai <em>lembur.</em>
          </button>
          <button type="button" onClick={() => setPhase("approved")}
            style={{ marginTop: 10, border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0" }}>
            ← Ubah durasi
          </button>
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="mt-4" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
          {pastSessions.map((ls) => {
            const proj = PROJECTS.find((p) => p.id === ls.projectId);
            return (
              <div key={ls.id} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid var(--kas-line-2)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>{proj?.address ?? "Lembur"}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1, letterSpacing: "0.08em" }}>
                    {ls.in} — {ls.out}{ls.note && <span style={{ marginLeft: 6 }}>· {ls.note}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ochre)", fontWeight: 500 }}>{fmtDurStr(sessionMinutes(ls.in, ls.out))}</span>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", letterSpacing: "0.1em", marginTop: 1 }}>{ls.hours}j disetujui</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
