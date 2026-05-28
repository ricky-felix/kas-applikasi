"use client";
import { useState } from "react";
import { PROJECTS, TODAY_SHORT } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";
import { ProjectSelector } from "./project-selector";
import { ClockSection } from "./clock-section";
import { SessionTimeline } from "./session-timeline";
import { LemburSection } from "./lembur-section";
import { DailyReport } from "./daily-report";
import { MaterialRequest } from "./material-request";

type Session      = { id: number; projectId: string; in: string; out: string | null };
type LemburSession = { id: number; in: string; out: string | null };

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomeTab({
  myProjects, me, state, setState, clockIn, clockOut, markProjectAbsent, activeSession, toast,
}: {
  myProjects: typeof PROJECTS;
  me: { name: string; short: string; role: string; phone: string; rate: number; id: string };
  state: { sessions: Session[]; absentProjectIds: string[]; selectedProjectId: string; overtime: number };
  setState: (fn: (s: { sessions: Session[]; absentProjectIds: string[]; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; absentProjectIds: string[]; selectedProjectId: string; photos: number; overtime: number }) => void;
  clockIn: (pid: string) => void;
  clockOut: () => void;
  markProjectAbsent: (pid: string) => void;
  activeSession: Session | undefined;
  toast: (m: string) => void;
}) {
  const [lemburSessions, setLemburSessions] = useState<LemburSession[]>([]);

  const selectedProj          = myProjects.find((p) => p.id === state.selectedProjectId) || myProjects[0];
  const isAbsent              = state.absentProjectIds.includes(selectedProj?.id || "");
  const hasAnySession         = state.sessions.length > 0;
  const allSessionsClosed     = hasAnySession && !activeSession;
  const selectedProjHasSessions = state.sessions.some((s) => s.projectId === selectedProj?.id);
  const lemburActive          = lemburSessions.find((s) => s.out === null);
  const totalLemburMin        = lemburSessions.reduce((s, x) => {
    if (!x.out) return s;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return s + Math.max(0, toMin(x.out) - toMin(x.in));
  }, 0);

  const startLembur = () => { setLemburSessions((ls) => [...ls, { id: Date.now(), in: nowTime(), out: null }]); toast("Sesi lembur dimulai."); };
  const stopLembur  = () => { setLemburSessions((ls) => ls.map((x) => x.out === null ? { ...x, out: nowTime() } : x)); toast("Sesi lembur selesai."); };

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>Selamat pagi,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      <ProjectSelector
        projects={myProjects}
        sessions={state.sessions}
        selectedProjectId={selectedProj?.id || ""}
        activeSession={activeSession}
        absentProjectIds={state.absentProjectIds}
        onSelect={(id) => setState((s) => ({ ...s, selectedProjectId: id }))}
      />

      <ClockSection
        selectedProj={selectedProj}
        activeSession={activeSession}
        isAbsent={isAbsent}
        onClockIn={() => clockIn(selectedProj!.id)}
        onClockOut={clockOut}
      />

      {selectedProj && !selectedProjHasSessions && !isAbsent && (
        <div className="mt-4">
          <Kicker no="—" label="ATAU" />
          <button type="button" onClick={() => markProjectAbsent(selectedProj.id)} className="w-full" style={{ border: "1px solid var(--kas-ink-3)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 8px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Tidak Hadir
          </button>
        </div>
      )}

      {hasAnySession && <SessionTimeline sessions={state.sessions} activeSession={activeSession} totalLemburMin={totalLemburMin} />}

      {allSessionsClosed && (
        <LemburSection
          lemburSessions={lemburSessions}
          lemburActive={lemburActive}
          onStart={startLembur}
          onStop={stopLembur}
        />
      )}

      {allSessionsClosed && !lemburActive && <DailyReport projects={myProjects} toast={toast} />}

      <MaterialRequest projects={myProjects} toast={toast} />

      {(hasAnySession || state.absentProjectIds.length > 0) && (
        <button type="button" onClick={() => { setState(() => ({ sessions: [], absentProjectIds: [], selectedProjectId: myProjects[0]?.id || "", photos: 0, overtime: 0 })); setLemburSessions([]); }} className="mt-4 w-full" style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", padding: "8px 0", textTransform: "uppercase", cursor: "pointer" }}>
          ↺ Reset demo
        </button>
      )}
    </div>
  );
}
