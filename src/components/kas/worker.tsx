"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, WORKER_TODAY, TODAY_SHORT, fmtIDR } from "@/lib/data";
import { Account } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel, Toast, MobileTopBar } from "./ui";

type Session = { id: number; projectId: string; in: string; out: string | null };
type DayStatus = "working" | "setengah" | "tidak";

function nowStr() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function sessionMinutes(s: Session) {
  if (!s.in || !s.out) return 0;
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  return Math.max(0, toMin(s.out) - toMin(s.in));
}
function fmtDur(mins: number) {
  return { h: Math.floor(mins / 60), m: mins % 60 };
}

export default function WorkerScreen({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const me = WORKERS.find((w) => w.id === (session?.workerId || WORKER_TODAY.workerId)) || WORKERS[0];
  const myProjects = PROJECTS.filter((p) => WORKER_TODAY.projectIds.includes(p.id));

  const [tab, setTab] = useState<"home" | "photo" | "history" | "profile">("home");
  const [state, setState] = useState({
    sessions: [] as Session[],
    dayStatus: "working" as DayStatus,
    selectedProjectId: myProjects[0]?.id || "",
    photos: 0,
    overtime: 0,
  });
  const [snack, setSnack] = useState<string | null>(null);

  const toast = (msg: string) => { setSnack(msg); setTimeout(() => setSnack(null), 2400); };

  const activeSession = state.sessions.find((s) => s.out === null);

  const clockIn = (pid: string) => {
    if (activeSession) { toast("Pulang dulu dari proyek aktif."); return; }
    const proj = PROJECTS.find((p) => p.id === pid);
    setState((s) => ({ ...s, sessions: [...s.sessions, { id: Date.now(), projectId: pid, in: nowStr(), out: null }] }));
    toast(`Masuk · ${proj?.address || proj?.name}`);
  };
  const clockOut = () => {
    if (!activeSession) return;
    const proj = PROJECTS.find((p) => p.id === activeSession.projectId);
    setState((s) => ({ ...s, sessions: s.sessions.map((x) => x.id === activeSession.id ? { ...x, out: nowStr() } : x) }));
    toast(`Pulang · ${proj?.address || proj?.name}`);
  };
  const markDayStatus = (kind: DayStatus) => {
    setState((s) => ({ ...s, dayStatus: kind }));
    toast(kind === "setengah" ? "Setengah hari tercatat." : "Izin/Tidak hadir tercatat.");
  };

  const TABS = [
    { k: "home", n: "01", l: "Hadir", icon: "✓" },
    { k: "photo", n: "02", l: "Foto", icon: "▣" },
    { k: "history", n: "03", l: "Riwayat", icon: "≡" },
    { k: "profile", n: "04", l: "Profil", icon: "○" },
  ] as const;

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <MobileTopBar tabLabel={tab === "home" ? "01 · HARI INI" : tab === "photo" ? "02 · FOTO" : tab === "history" ? "03 · RIWAYAT" : "04 · PROFIL"} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === "home" && <HomeTab myProjects={myProjects} me={me} state={state} setState={setState} clockIn={clockIn} clockOut={clockOut} markDayStatus={markDayStatus} activeSession={activeSession} toast={toast} />}
        {tab === "photo" && <PhotoTab proj={myProjects[0]} state={state} setState={setState} toast={toast} />}
        {tab === "history" && <HistoryTab />}
        {tab === "profile" && <ProfileTab me={me} onLogout={onLogout} />}
      </div>

      <nav className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
        {TABS.map((t, i) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as typeof tab)}
            className="flex flex-col items-center gap-0.5 py-2.5 pb-3 cursor-pointer"
            style={{
              border: "none",
              borderRight: i < 3 ? "1px solid var(--kas-line)" : "none",
              background: tab === t.k ? "var(--kas-ink)" : "transparent",
              color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)",
            }}
          >
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>{t.l}</span>
          </button>
        ))}
      </nav>

      {snack && <Toast message={snack} />}
    </div>
  );
}

function HomeTab({
  myProjects, me, state, setState, clockIn, clockOut, markDayStatus, activeSession, toast,
}: {
  myProjects: typeof PROJECTS;
  me: typeof WORKERS[0];
  state: { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; overtime: number };
  setState: (fn: (s: { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; photos: number; overtime: number }) => void;
  clockIn: (pid: string) => void;
  clockOut: () => void;
  markDayStatus: (k: DayStatus) => void;
  activeSession: Session | undefined;
  toast: (m: string) => void;
}) {
  const selectedProj = myProjects.find((p) => p.id === state.selectedProjectId) || myProjects[0];
  const selectedActive = activeSession && activeSession.projectId === selectedProj?.id;
  const someoneElseActive = activeSession && activeSession.projectId !== selectedProj?.id;
  const totalDayMin = state.sessions.reduce((s, x) => s + sessionMinutes(x), 0);
  const dayDur = fmtDur(totalDayMin);
  const hasAnySession = state.sessions.length > 0;
  const isAbsent = state.dayStatus === "setengah" || state.dayStatus === "tidak";
  const minByProj = (pid: string) => state.sessions.filter((s) => s.projectId === pid).reduce((a, x) => a + sessionMinutes(x), 0);

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="00" label={TODAY_SHORT} />
      <DisplayHeading size={28}>
        Selamat pagi,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em>
      </DisplayHeading>

      {isAbsent && (
        <div className="mt-4 p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-amber)" }} />
            <MonoLabel size={10}>TERCATAT</MonoLabel>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
            {state.dayStatus === "setengah" ? "Setengah hari." : "Tidak hadir."}
          </div>
        </div>
      )}

      {!isAbsent && (
        <div className="mt-4">
          <Kicker no="01" label={`PROYEK ANDA · ${myProjects.length}`} />
          <div className="flex flex-col gap-2">
            {myProjects.map((p) => {
              const isSelected = p.id === selectedProj?.id;
              const isActive = activeSession?.projectId === p.id;
              const mins = minByProj(p.id);
              const closed = state.sessions.filter((s) => s.projectId === p.id && s.out !== null).length;
              const dur = fmtDur(mins);
              return (
                <button
                  key={p.id}
                  onClick={() => setState((s) => ({ ...s, selectedProjectId: p.id }))}
                  className="grid gap-3 items-center text-left cursor-pointer p-3.5"
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    border: `1px solid ${isSelected ? "var(--kas-ink)" : "var(--kas-line)"}`,
                    background: isSelected ? "var(--kas-paper-2)" : "var(--kas-paper)",
                  }}
                >
                  <span
                    className="grid place-items-center"
                    style={{
                      width: 28, height: 28,
                      background: isActive ? "var(--kas-orange)" : "var(--kas-paper)",
                      border: `1px solid ${isActive ? "var(--kas-orange)" : "var(--kas-line)"}`,
                      color: isActive ? "var(--kas-paper)" : "var(--kas-ink-2)",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 11,
                    }}
                  >
                    {isActive ? "●" : closed > 0 ? "✓" : "○"}
                  </span>
                  <div className="min-w-0">
                    <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                      {isActive ? `Sedang bekerja · sejak ${activeSession?.in}` : mins > 0 ? `${dur.h}j ${String(dur.m).padStart(2, "0")}m · ${closed} sesi` : p.address}
                    </div>
                  </div>
                  <MonoLabel size={9}>{isActive ? "AKTIF" : closed > 0 ? "SELESAI" : "MULAI"}</MonoLabel>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isAbsent && selectedProj && (
        <div className="mt-4">
          <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
          {selectedActive ? (
            <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-orange)" }} />
                <MonoLabel size={10}>SEDANG BEKERJA</MonoLabel>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-line)", borderBottom: "1px solid var(--kas-line)" }}>
                <div className="py-3.5 pr-3.5" style={{ borderRight: "1px solid var(--kas-line)" }}>
                  <MonoLabel size={9}>Jam Masuk</MonoLabel>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em" }}>{activeSession?.in}</div>
                </div>
                <div className="py-3.5 pl-3.5">
                  <MonoLabel size={9}>Jam Pulang</MonoLabel>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 30, lineHeight: 1.0, marginTop: 6, letterSpacing: "-0.02em", color: "var(--kas-ink-4)" }}>——:——</div>
                </div>
              </div>
              <button
                onClick={clockOut}
                className="w-full mt-3.5 flex items-center justify-center gap-2.5"
                style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, padding: "20px 14px", cursor: "pointer" }}
              >
                <ClockIcon />
                <span>Clock <em>out.</em></span>
              </button>
            </div>
          ) : someoneElseActive ? (
            <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
              <MonoLabel size={10}>Sedang aktif di proyek lain</MonoLabel>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, margin: "8px 0 12px" }}>
                Pulang dulu dari <em>{PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}</em>, baru mulai di sini.
              </div>
              <button
                onClick={clockOut}
                className="w-full"
                style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 12px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                Clock Out dari {PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}
              </button>
            </div>
          ) : (
            <button
              onClick={() => clockIn(selectedProj.id)}
              className="w-full flex items-center justify-center gap-3 relative"
              style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 28, padding: "26px 14px", cursor: "pointer" }}
            >
              <ClockIcon size={22} />
              <span>Clock <em>in.</em></span>
              <span className="absolute top-2 right-2 inline-block" style={{ width: 8, height: 8, background: "var(--kas-orange)" }} />
            </button>
          )}
        </div>
      )}

      {hasAnySession && !isAbsent && (
        <div className="mt-5">
          <Kicker no="03" label={`SESI HARI INI · ${state.sessions.length}`} />
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {state.sessions.map((s, i) => {
              const proj = PROJECTS.find((p) => p.id === s.projectId);
              const live = s.out === null;
              const dur = fmtDur(sessionMinutes(s));
              return (
                <div key={s.id} className="grid gap-3 items-center py-3" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line)" }}>
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontStyle: "italic", fontSize: 18, color: live ? "var(--kas-orange)" : "var(--kas-ink-3)", minWidth: 24, textAlign: "center" }}>
                    {["I","II","III","IV","V"][i] || i + 1}
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{proj?.address}</div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                      {s.in} — {s.out || "berjalan"}{live && <span style={{ color: "var(--kas-orange)", marginLeft: 6 }}>● LIVE</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: live ? "var(--kas-orange)" : "var(--kas-ink)", fontWeight: 500 }}>
                    {live ? "—" : `${dur.h}j ${String(dur.m).padStart(2, "0")}m`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3.5 px-3.5 py-3.5 flex justify-between items-baseline" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
            <MonoLabel size={10} color="rgba(251,248,241,0.6)">Total Kerja Hari Ini</MonoLabel>
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {dayDur.h}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginLeft: 4, color: "rgba(251,248,241,0.6)" }}>JAM</span>
              {" "}{String(dayDur.m).padStart(2, "0")}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginLeft: 4, color: "rgba(251,248,241,0.6)" }}>MEN</span>
            </span>
          </div>
        </div>
      )}

      {!hasAnySession && !isAbsent && (
        <div className="mt-4">
          <Kicker no="—" label="ATAU" />
          <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button
              onClick={() => markDayStatus("setengah")}
              style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 8px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Setengah Hari
            </button>
            <button
              onClick={() => markDayStatus("tidak")}
              style={{ border: "1px solid var(--kas-ink-3)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 8px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Tidak Hadir
            </button>
          </div>
        </div>
      )}

      {hasAnySession && !activeSession && !isAbsent && (
        <div className="mt-5">
          <Kicker no="04" label="LEMBUR (OPSIONAL)" />
          <div className="p-3.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)" }}>
            <div className="flex justify-between items-baseline">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17 }}>Jam lembur</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 500, color: state.overtime ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>
                {state.overtime > 0 ? state.overtime : "00"}
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-3)", marginLeft: 4, letterSpacing: "0.1em" }}>JAM</span>
              </div>
            </div>
            <div className="grid gap-1.5 mt-3" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
              {[0,1,2,3,4,5].map((h) => (
                <button
                  key={h}
                  onClick={() => setState((s) => ({ ...s, overtime: h }))}
                  style={{
                    border: `1px solid ${state.overtime === h ? "var(--kas-ink)" : "var(--kas-line)"}`,
                    background: state.overtime === h ? "var(--kas-ink)" : "var(--kas-paper)",
                    color: state.overtime === h ? "var(--kas-paper)" : "var(--kas-ink)",
                    padding: "10px 0",
                    cursor: "pointer",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(hasAnySession || isAbsent) && (
        <button
          onClick={() => setState(() => ({ sessions: [], dayStatus: "working", selectedProjectId: myProjects[0]?.id || "", photos: 0, overtime: 0 }))}
          className="mt-4 w-full"
          style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", padding: "8px 0", textTransform: "uppercase", cursor: "pointer" }}
        >
          ↺ Reset demo
        </button>
      )}
    </div>
  );
}

function PhotoTab({
  proj, state, setState, toast,
}: {
  proj: typeof PROJECTS[0];
  state: { photos: number };
  setState: (fn: (s: { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; photos: number; overtime: number }) => { sessions: Session[]; dayStatus: DayStatus; selectedProjectId: string; photos: number; overtime: number }) => void;
  toast: (m: string) => void;
}) {
  const [phase, setPhase] = useState("Sedang");
  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="UPLOAD FOTO PROGRES" />
      <DisplayHeading size={28}>Foto,<br /><em>tiga fase.</em></DisplayHeading>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 12 }}>{proj.code} · {proj.name}</div>

      <div className="mt-4">
        <Kicker no="02" label="PILIH FASE" />
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {["Sebelum", "Sedang", "Sesudah"].map((p, i) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className="flex flex-col items-center gap-1 py-3.5"
              style={{
                border: "1px solid var(--kas-ink)",
                background: phase === p ? "var(--kas-ink)" : "var(--kas-paper)",
                color: phase === p ? "var(--kas-paper)" : "var(--kas-ink)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontStyle: "italic", opacity: 0.7 }}>{["I","II","III"][i]}</span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>{p}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Kicker no="03" label="AMBIL FOTO" />
        <button
          onClick={() => { setState((s) => ({ ...s, photos: s.photos + 1 })); toast(`Foto "${phase}" terkirim.`); }}
          className="w-full flex flex-col items-center gap-3 py-8"
          style={{ border: "1px dashed var(--kas-ink)", background: "var(--kas-paper-2)", cursor: "pointer" }}
        >
          <div className="grid place-items-center" style={{ width: 56, height: 56, border: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="14" /><circle cx="12" cy="13" r="3.5" /><path d="M8 6l1.5-2h5L16 6" />
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20 }}>Buka kamera</div>
          <MonoLabel size={10}>Fase: {phase}</MonoLabel>
        </button>
      </div>

      <div className="mt-4 px-3.5 py-3 flex justify-between items-center" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <MonoLabel size={10}>Hari ini terkirim</MonoLabel>
        <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}>
          {String(state.photos).padStart(2, "0")} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>FOTO</span>
        </span>
      </div>
    </div>
  );
}

const HISTORY_ITEMS = [
  { date: "Sab, 23 Mei", project: "Cemara Asri", status: "Hadir", overtime: 0 },
  { date: "Jum, 22 Mei", project: "Cemara Asri", status: "Hadir", overtime: 2 },
  { date: "Kam, 21 Mei", project: "Cemara Asri", status: "Setengah Hari", overtime: 0 },
  { date: "Rab, 20 Mei", project: "Cemara Asri", status: "Hadir", overtime: 0 },
  { date: "Sel, 19 Mei", project: "Cemara Asri", status: "Tidak Hadir", overtime: 0 },
  { date: "Sen, 18 Mei", project: "Cemara Asri", status: "Hadir", overtime: 1 },
  { date: "Sab, 16 Mei", project: "Setiabudi",   status: "Hadir", overtime: 0 },
  { date: "Jum, 15 Mei", project: "Setiabudi",   status: "Hadir", overtime: 0 },
];

function HistoryTab() {
  const hadirCount = HISTORY_ITEMS.filter((i) => i.status === "Hadir").length;
  const overtimeTotal = HISTORY_ITEMS.reduce((s, i) => s + i.overtime, 0);
  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="14 HARI TERAKHIR" />
      <DisplayHeading size={28}>Riwayat,<br /><em>kehadiran.</em></DisplayHeading>
      <div className="grid mt-4" style={{ gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--kas-ink)", borderBottom: "1px solid var(--kas-ink)" }}>
        <div className="py-3.5 pr-3.5" style={{ borderRight: "1px solid var(--kas-line)" }}>
          <MonoLabel size={9}>Hari Hadir</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 30, fontWeight: 500, marginTop: 4 }}>{hadirCount}</div>
        </div>
        <div className="py-3.5 pl-3.5">
          <MonoLabel size={9}>Total Lembur</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 30, fontWeight: 500, marginTop: 4, color: "var(--kas-orange)" }}>
            {overtimeTotal}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", marginLeft: 4 }}>JAM</span>
          </div>
        </div>
      </div>
      <div className="mt-1">
        {HISTORY_ITEMS.map((it, i) => (
          <div key={i} className="grid gap-3 items-center py-3.5" style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--kas-line-2)" }}>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.08em", minWidth: 72 }}>{it.date}</span>
            <div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>{it.project}</div>
              {it.overtime > 0 && <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-orange)", marginTop: 2, letterSpacing: "0.1em" }}>+ {it.overtime} jam lembur</div>}
            </div>
            <span
              className="px-2 py-1"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                background: it.status === "Hadir" ? "var(--kas-orange-soft)" : it.status === "Setengah Hari" ? "var(--kas-amber-soft)" : "var(--kas-paper-2)",
                color: it.status === "Tidak Hadir" ? "var(--kas-ink-3)" : "var(--kas-ink)",
                border: "1px solid var(--kas-line)",
              }}
            >
              {it.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ me, onLogout }: { me: typeof WORKERS[0]; onLogout: () => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="AKUN ANDA" />
      <DisplayHeading size={28}>Profil,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>
      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div className="grid place-items-center" style={{ width: 52, height: 52, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}>{me.short}</div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.1 }}>{me.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{me.role}</div>
        </div>
      </div>
      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-line)" }}>
        {[
          { l: "Nomor HP", v: me.phone },
          { l: "Tarif Harian", v: fmtIDR(me.rate) },
          { l: "Peran", v: "Pekerja Lapangan" },
        ].map((r, i) => (
          <div key={i} className="grid gap-3 py-3" style={{ gridTemplateColumns: "110px 1fr", borderBottom: "1px solid var(--kas-line-2)" }}>
            <MonoLabel size={10}>{r.l}</MonoLabel>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onLogout}
          className="w-full py-3.5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Keluar
        </button>
      </div>
      <div className="mt-5 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Tauke v0.1 · {TODAY_SHORT}
      </div>
    </div>
  );
}

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="square" />
    </svg>
  );
}
