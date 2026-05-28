"use client";
import { useState } from "react";
import { PROJECTS, TODAY_SHORT } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";
import { ProjectSelector } from "./project-selector";
import { ClockSection } from "./clock-section";
import { SessionTimeline } from "./session-timeline";
import { LemburSection, type LemburSession } from "./lembur-section";
import { ConfirmDialog } from "./confirm-dialog";

type Session = { id: number; projectId: string; in: string; out: string | null; lemburJam?: number; lemburEndsAt?: number };
type AbsentProject = { id: string; reason: string };

const ABSENCE_REASONS = ["Izin", "Sakit", "Urusan Keluarga", "Yang Lain"];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomeTab({
  myProjects, me, state, setState, clockIn, clockOut, markProjectAbsent, activeSession, toast,
}: {
  myProjects: typeof PROJECTS;
  me: { name: string; short: string; role: string; phone: string; rate: number; id: string };
  state: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; overtime: number };
  setState: (fn: (s: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => void;
  clockIn: (pid: string, lemburJam?: number) => void;
  clockOut: () => void;
  markProjectAbsent: (pid: string, reason: string) => void;
  activeSession: Session | undefined;
  toast: (m: string) => void;
}) {
  const [lemburSessions, setLemburSessions] = useState<LemburSession[]>([]);
  const [absencePickerFor, setAbsencePickerFor] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [lemburExpanded, setLemburExpanded] = useState(false);
  const [showLemburConfirm, setShowLemburConfirm] = useState(false);
  const [showAbsenceConfirm, setShowAbsenceConfirm] = useState(false);

  const selectedProj            = myProjects.find((p) => p.id === state.selectedProjectId) || myProjects[0];
  const absentEntry             = state.absentProjects.find((a) => a.id === selectedProj?.id);
  const isAbsent                = !!absentEntry;
  const hasAnySession           = state.sessions.length > 0;
  const allSessionsClosed       = hasAnySession && !activeSession;
  const selectedProjHasSessions = state.sessions.some((s) => s.projectId === selectedProj?.id);
  const lemburActive            = lemburSessions.find((s) => s.out === null);
  const totalLemburMin          = lemburSessions.reduce((s, x) => {
    if (!x.out) return s;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return s + Math.max(0, toMin(x.out) - toMin(x.in));
  }, 0);

  const startLembur = (projectId: string, note: string, hours: number) => {
    const endsAt = Date.now() + hours * 3600 * 1000;
    setLemburSessions((ls) => [...ls, { id: Date.now(), projectId, note, hours, endsAt, in: nowTime(), out: null }]);
    toast(`Lembur ${hours}j dimulai.`);
  };
  const stopLembur = () => {
    setLemburSessions((ls) => ls.map((x) => x.out === null ? { ...x, out: nowTime() } : x));
    toast("Sesi lembur selesai.");
  };

  const handleSelectReason = (reason: string) => {
    if (!absencePickerFor) return;
    if (reason === "Yang Lain") { setShowCustomInput(true); return; }
    markProjectAbsent(absencePickerFor, reason);
    setAbsencePickerFor(null);
    setShowCustomInput(false);
    setCustomReason("");
  };

  const handleSubmitCustomReason = () => {
    if (!absencePickerFor || !customReason.trim()) return;
    markProjectAbsent(absencePickerFor, customReason.trim());
    setAbsencePickerFor(null);
    setShowCustomInput(false);
    setCustomReason("");
  };

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>Selamat pagi,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      <ProjectSelector
        projects={myProjects}
        sessions={state.sessions}
        selectedProjectId={selectedProj?.id || ""}
        activeSession={activeSession}
        absentProjects={state.absentProjects}
        onSelect={(id) => { setState((s) => ({ ...s, selectedProjectId: id })); setAbsencePickerFor(null); }}
      />

      <ClockSection
        selectedProj={selectedProj}
        activeSession={activeSession}
        isAbsent={isAbsent}
        absentReason={absentEntry?.reason}
        onClockIn={() => clockIn(selectedProj!.id)}
        onClockOut={clockOut}
        onClockInLembur={(hours) => { clockIn(selectedProj!.id, hours); }}
      />

      {/* Absence section — reason picker */}
      {selectedProj && !selectedProjHasSessions && !isAbsent && (
        <div className="mt-6">
          {/* Centered divider */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>atau</span>
            <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
          </div>

          {absencePickerFor === selectedProj.id ? (
            <div style={{ border: "1px solid var(--kas-ink-3)", background: "var(--kas-paper-2)", padding: "14px" }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 10, textAlign: "center" }}>
                Alasan tidak hadir
              </div>
              {showCustomInput ? (
                <div>
                  <input
                    autoFocus
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmitCustomReason(); }}
                    placeholder="Tulis alasan Anda..."
                    className="w-full px-3.5 py-3.5 mb-2"
                    style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-ink)", outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitCustomReason}
                    disabled={!customReason.trim()}
                    className="w-full py-3 text-center"
                    style={{ border: "none", background: customReason.trim() ? "var(--kas-ink)" : "var(--kas-line)", color: customReason.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: customReason.trim() ? "pointer" : "default" }}
                  >
                    Kirim →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {ABSENCE_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => handleSelectReason(reason)}
                      className="w-full text-center"
                      style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "11px 14px", cursor: "pointer", fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  onClick={() => { setAbsencePickerFor(null); setShowCustomInput(false); setCustomReason(""); }}
                  style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
                >
                  ← Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAbsenceConfirm(true)}
              className="w-full"
              style={{ border: "1px solid var(--kas-ink-3)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 0", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}
            >
              Tidak Hadir
            </button>
          )}
        </div>
      )}

      {hasAnySession && <SessionTimeline sessions={state.sessions} activeSession={activeSession} totalLemburMin={totalLemburMin} />}

      {allSessionsClosed && !lemburExpanded && !lemburActive && lemburSessions.length === 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowLemburConfirm(true)}
            className="w-full"
            style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 0", cursor: "pointer" }}
          >
            + Tambah Lembur
          </button>
        </div>
      )}

      {allSessionsClosed && (lemburExpanded || lemburActive || lemburSessions.length > 0) && (
        <LemburSection
          projects={myProjects}
          lemburSessions={lemburSessions}
          lemburActive={lemburActive}
          onStart={startLembur}
          onStop={stopLembur}
          toast={toast}
        />
      )}



      {(hasAnySession || state.absentProjects.length > 0) && (
        <button
          type="button"
          onClick={() => { setState(() => ({ sessions: [], absentProjects: [], selectedProjectId: myProjects[0]?.id || "", photos: 0, overtime: 0 })); setLemburSessions([]); setAbsencePickerFor(null); }}
          className="mt-4 w-full"
          style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", padding: "8px 0", textTransform: "uppercase", cursor: "pointer" }}
        >
          ↺ Reset demo
        </button>
      )}

      {showAbsenceConfirm && selectedProj && (
        <ConfirmDialog
          message="Apakah Anda sudah minta izin?"
          sub="Pastikan Anda sudah memberitahu mandor atau pemilik sebelum mencatat tidak hadir."
          confirmLabel="Ya, sudah izin"
          cancelLabel="Belum"
          onConfirm={() => { setShowAbsenceConfirm(false); setAbsencePickerFor(selectedProj.id); }}
          onCancel={() => setShowAbsenceConfirm(false)}
        />
      )}

      {showLemburConfirm && (
        <ConfirmDialog
          message="Apakah lembur sudah diizinkan oleh bos?"
          sub="Lembur hanya boleh dicatat jika sudah mendapat konfirmasi dari mandor atau pemilik proyek."
          confirmLabel="Ya, sudah dikonfirmasi"
          cancelLabel="Belum"
          onConfirm={() => { setShowLemburConfirm(false); setLemburExpanded(true); }}
          onCancel={() => setShowLemburConfirm(false)}
        />
      )}
    </div>
  );
}
