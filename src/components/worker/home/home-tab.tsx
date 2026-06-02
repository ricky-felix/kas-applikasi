"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, TODAY_SHORT } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";
import { ProjectSelector } from "./project-selector";
import { ClockSection } from "./clock-section";
import { SessionTimeline } from "./session-timeline";
import { ConfirmDialog } from "./confirm-dialog";
import type { LemburType } from "@/screens/worker";

type Session = { id: number; projectId: string; in: string; out: string | null; lemburType?: LemburType };
type AbsentProject = { id: string; reason: string };

const ABSENCE_REASONS = ["Izin", "Sakit", "Urusan Keluarga", "Yang Lain"];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomeTab({
  myProjects, me, isKepalaProyek, state, setState, clockIn, clockOut, markProjectAbsent, activeSession, toast,
}: {
  myProjects: typeof PROJECTS;
  me: { name: string; short: string; role: string; phone: string; rate: number; id: string };
  isKepalaProyek: boolean;
  state: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; overtime: number };
  setState: (fn: (s: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => void;
  clockIn: (pid: string, lemburType?: LemburType) => void;
  clockOut: () => void;
  markProjectAbsent: (pid: string, reason: string) => void;
  activeSession: Session | undefined;
  toast: (m: string) => void;
}) {
  // Regular pekerja (non-kepala) are read-only: they can only view today's
  // attendance status as recorded for them by the kepala proyek.
  if (!isKepalaProyek) {
    return <PekerjaReadOnlyHome myProjects={myProjects} me={me} state={state} setState={setState} />;
  }

  return (
    <KepalaHome
      myProjects={myProjects} me={me} state={state} setState={setState}
      clockIn={clockIn} clockOut={clockOut} markProjectAbsent={markProjectAbsent}
      activeSession={activeSession} toast={toast}
    />
  );
}

// ── Read-only home for regular pekerja ──────────────────────────────────────
function PekerjaReadOnlyHome({
  myProjects, me, state, setState,
}: {
  myProjects: typeof PROJECTS;
  me: { name: string };
  state: { selectedProjectId: string };
  setState: (fn: (s: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => void;
}) {
  const selectedProj = myProjects.find((p) => p.id === state.selectedProjectId) || myProjects[0];
  const kepala = selectedProj
    ? WORKERS.find((w) => selectedProj.assigned.includes(w.id) && w.isKepalaProyek)
    : undefined;

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>Selamat pagi,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      {/* Project switcher (view only) */}
      {myProjects.length > 1 && (
        <div className="mt-4">
          <Kicker no="01" label={`PROYEK ANDA · ${myProjects.length}`} />
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {myProjects.map((p) => {
              const sel = p.id === selectedProj?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, selectedProjectId: p.id }))}
                  className="px-3 py-2 whitespace-nowrap cursor-pointer"
                  style={{
                    border: `1px solid ${sel ? "var(--kas-ink)" : "var(--kas-line)"}`,
                    background: sel ? "var(--kas-ink)" : "var(--kas-paper)",
                    color: sel ? "var(--kas-paper)" : "var(--kas-ink)",
                    fontFamily: "var(--font-jetbrains), monospace", fontSize: 10,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}
                >
                  {p.address}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's status — recorded by the kepala proyek */}
      <div className="mt-5">
        <Kicker no="02" label="STATUS HARI INI" />
        {selectedProj ? (
          <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-moss)" }} />
              <MonoLabel size={10}>HADIR · TERCATAT</MonoLabel>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
              Masuk 07:58.
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em", marginTop: 8 }}>
              {selectedProj.address.toUpperCase()}
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.08em", marginTop: 3 }}>
              Dicatat oleh {kepala?.name ?? "Kepala Proyek"}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Belum ada proyek untuk hari ini
          </div>
        )}
        <div className="mt-3 px-3 py-2.5" style={{ background: "var(--kas-paper)", border: "1px solid var(--kas-line)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.06em", lineHeight: 1.6 }}>
            Absensi, lembur, laporan & material dikelola oleh kepala proyek.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Interactive home for kepala proyek ──────────────────────────────────────
function KepalaHome({
  myProjects, me, state, setState, clockIn, clockOut, markProjectAbsent, activeSession, toast,
}: {
  myProjects: typeof PROJECTS;
  me: { name: string; short: string; role: string; phone: string; rate: number; id: string };
  state: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; overtime: number };
  setState: (fn: (s: { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; absentProjects: AbsentProject[]; selectedProjectId: string; photos: number; overtime: number }) => void;
  clockIn: (pid: string, lemburType?: LemburType) => void;
  clockOut: () => void;
  markProjectAbsent: (pid: string, reason: string) => void;
  activeSession: Session | undefined;
  toast: (m: string) => void;
}) {
  const [absencePickerFor, setAbsencePickerFor] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAbsenceConfirm, setShowAbsenceConfirm] = useState(false);

  const selectedProj            = myProjects.find((p) => p.id === state.selectedProjectId) || myProjects[0];
  const absentEntry             = state.absentProjects.find((a) => a.id === selectedProj?.id);
  const isAbsent                = !!absentEntry;
  const hasAnySession           = state.sessions.length > 0;
  const selectedProjHasSessions = state.sessions.some((s) => s.projectId === selectedProj?.id);

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
        workerName={me.name}
        onClockIn={() => clockIn(selectedProj!.id)}
        onClockOut={clockOut}
        onClockInLembur={(type) => { clockIn(selectedProj!.id, type); }}
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

      {hasAnySession && <SessionTimeline sessions={state.sessions} activeSession={activeSession} />}

      {(hasAnySession || state.absentProjects.length > 0) && (
        <button
          type="button"
          onClick={() => { setState(() => ({ sessions: [], absentProjects: [], selectedProjectId: myProjects[0]?.id || "", photos: 0, overtime: 0 })); setAbsencePickerFor(null); }}
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

    </div>
  );
}
