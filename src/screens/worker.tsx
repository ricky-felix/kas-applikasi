"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, WORKER_TODAY } from "@/lib/data";
import { Account } from "@/lib/data";
import { Toast, MobileTopBar } from "@/components/primitives";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import HomeTab         from "@/components/worker/home/home-tab";
import MaterialTab     from "@/components/worker/material-tab";
import ProfileTab      from "@/components/worker/profile-tab";
import { SelfieCapture } from "@/components/worker/home/clock-section";
import AMAttend        from "@/components/admin/attend";
import { LaporanStepper } from "@/components/worker/home/laporan-stepper";

type Session = { id: number; projectId: string; in: string; out: string | null; lemburJam?: number; lemburEndsAt?: number };
type Tab = "home" | "material" | "tim" | "profile";

function nowStr() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// Regular worker: 3 tabs — Riwayat lives inside Profil
const WORKER_TABS = [
  { k: "home",     n: "01", l: "Hadir",    icon: "✓" },
  { k: "material", n: "02", l: "Material", icon: "□" },
  { k: "profile",  n: "03", l: "Profil",   icon: "○" },
] as const;

// Kepala proyek: 4 tabs — Riwayat lives inside Profil
const KEPALA_TABS = [
  { k: "home",     n: "01", l: "Hadir",    icon: "✓" },
  { k: "material", n: "02", l: "Material", icon: "□" },
  { k: "tim",      n: "03", l: "Tim",      icon: "◈" },
  { k: "profile",  n: "04", l: "Profil",   icon: "○" },
] as const;

const TAB_LABELS: Record<Tab, string> = {
  home:     "01 · HARI INI",
  material: "02 · MATERIAL",
  tim:      "03 · TIM · ABSENSI",
  profile:  "04 · PROFIL",
};

export default function WorkerScreen({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const me              = WORKERS.find((w) => w.id === (session?.workerId || WORKER_TODAY.workerId)) || WORKERS[0];
  const isKepalaProyek  = !!me.isKepalaProyek;
  const myProjects      = PROJECTS.filter((p) => isKepalaProyek
    ? p.assigned.includes(me.id)
    : WORKER_TODAY.projectIds.includes(p.id)
  );

  const [tab, setTab] = useState<Tab>("home");
  const [state, setState] = useState({
    sessions: [] as Session[],
    absentProjects: [] as { id: string; reason: string }[],
    selectedProjectId: myProjects[0]?.id || "",
    photos: 0,
    overtime: 0,
  });
  const [snack, setSnack] = useState<string | null>(null);
  const [showLaporanStepper, setShowLaporanStepper] = useState(false);
  const [showLemburDialog, setShowLemburDialog] = useState(false);
  const [lemburStep, setLemburStep] = useState<"ask-lembur" | "ask-boss" | "pick-hours">("ask-lembur");
  const [pendingLemburJam, setPendingLemburJam]   = useState<number | null>(null);

  const toast = (msg: string) => {
    setSnack(msg);
    setTimeout(() => setSnack(null), 2400);
  };

  const { showWarning, dismissWarning } = useInactivityLogout(onLogout);

  const activeSession = state.sessions.find((s) => s.out === null);

  const doClockOut = () => {
    if (!activeSession) return;
    const proj    = PROJECTS.find((p) => p.id === activeSession.projectId);
    const isLembur = !!activeSession.lemburEndsAt;
    setState((s) => ({ ...s, sessions: s.sessions.map((x) => x.id === activeSession.id ? { ...x, out: nowStr() } : x) }));
    toast(isLembur ? "Lembur selesai." : `Pulang · ${proj?.address || proj?.name}`);
  };

  const doClockOutAndStartLembur = (jam: number) => {
    if (!activeSession) return;
    const pid = activeSession.projectId;
    setState((s) => ({
      ...s,
      sessions: [
        ...s.sessions.map((x) => x.id === activeSession.id ? { ...x, out: nowStr() } : x),
        { id: Date.now(), projectId: pid, in: nowStr(), out: null, lemburJam: jam, lemburEndsAt: Date.now() + jam * 3600 * 1000 },
      ],
    }));
    toast(`Lembur ${jam}j dimulai.`);
  };

  const clockIn = (pid: string, lemburJam?: number) => {
    if (activeSession) { toast("Pulang dulu dari proyek aktif."); return; }
    const proj = PROJECTS.find((p) => p.id === pid);
    setState((s) => ({ ...s, sessions: [...s.sessions, { id: Date.now(), projectId: pid, in: nowStr(), out: null, ...(lemburJam ? { lemburJam, lemburEndsAt: Date.now() + lemburJam * 3600 * 1000 } : {}) }] }));
    toast(lemburJam ? `Lembur ${lemburJam}j dimulai.` : `Masuk · ${proj?.address || proj?.name}`);
  };

  const clockOut = () => {
    if (!activeSession) return;
    if (isKepalaProyek) {
      setShowLaporanStepper(true);
      return;
    }
    // Lembur session — just close it, no further questions
    if (activeSession.lemburEndsAt) {
      doClockOut();
      return;
    }
    setLemburStep("ask-lembur");
    setShowLemburDialog(true);
  };

  const handleLaporanSubmit = (lemburJam: number) => {
    setShowLaporanStepper(false);
    if (lemburJam > 0) {
      doClockOutAndStartLembur(lemburJam);
      toast(`Laporan terkirim. Lembur ${lemburJam}j dimulai.`);
    } else {
      doClockOut();
      toast("Laporan terkirim. Selamat pulang!");
    }
  };

  const markProjectAbsent = (pid: string, reason: string) => {
    setState((s) => ({ ...s, absentProjects: [...s.absentProjects, { id: pid, reason }] }));
    toast(`Tidak hadir · ${reason}`);
  };

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <MobileTopBar tabLabel={TAB_LABELS[tab]} />

      <div className="flex-1 overflow-y-auto">
        {tab === "home" && (
          <HomeTab
            myProjects={myProjects}
            me={me}
            state={state}
            setState={setState}
            clockIn={clockIn}
            clockOut={clockOut}
            markProjectAbsent={markProjectAbsent}
            activeSession={activeSession}
            toast={toast}
          />
        )}
        {tab === "material" && (
          <MaterialTab myProjects={myProjects} isKepalaProyek={isKepalaProyek} toast={toast} />
        )}
        {tab === "tim" && <AMAttend toast={toast} />}
        {tab === "profile" && <ProfileTab me={me} onLogout={onLogout} />}
      </div>

      {(() => {
        const tabs = isKepalaProyek ? KEPALA_TABS : WORKER_TABS;
        return (
          <nav className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)`, borderTop: "1px solid var(--kas-ink)", background: "var(--kas-paper)" }}>
            {tabs.map((t, i) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k as Tab)}
                className="flex flex-col items-center gap-0.5 py-2.5 pb-3 cursor-pointer"
                style={{
                  border: "none",
                  borderRight: i < tabs.length - 1 ? "1px solid var(--kas-line)" : "none",
                  background: tab === t.k ? "var(--kas-ink)" : "transparent",
                  color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)",
                }}
              >
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.l}</span>
              </button>
            ))}
          </nav>
        );
      })()}

      {showLemburDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-5" style={{ background: "rgba(22,28,44,0.5)" }}>
          <div className="w-full max-w-sm" style={{ background: "var(--kas-paper)", border: "2px solid var(--kas-ink)" }}>

            {lemburStep === "ask-lembur" && (
              <>
                <div className="px-6 pt-6 pb-4">
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                    Apakah ada lembur hari ini?
                  </div>
                </div>
                <div className="grid px-6 pb-6 gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button
                    type="button"
                    onClick={() => setLemburStep("ask-boss")}
                    style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Iya
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowLemburDialog(false); doClockOut(); }}
                    style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Tidak
                  </button>
                </div>
              </>
            )}

            {lemburStep === "ask-boss" && (
              <>
                <div className="px-6 pt-6 pb-4">
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                    Apakah bos sudah menyetujui lembur?
                  </div>
                </div>
                <div className="grid px-6 pb-6 gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button
                    type="button"
                    onClick={() => setLemburStep("pick-hours")}
                    style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Iya
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowLemburDialog(false); doClockOut(); }}
                    style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink-3)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Tidak
                  </button>
                </div>
                <div className="px-6 pb-5">
                  <button
                    type="button"
                    onClick={() => setLemburStep("ask-lembur")}
                    style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}
                  >
                    ← Kembali
                  </button>
                </div>
              </>
            )}

            {lemburStep === "pick-hours" && (
              <>
                <div className="px-6 pt-6 pb-4">
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                    Berapa jam lembur?
                  </div>
                </div>
                <div className="grid px-6 pb-4 gap-2" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {[1, 2, 3, 4, 5].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => { setShowLemburDialog(false); setPendingLemburJam(h); }}
                      style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", padding: "16px 0", fontFamily: "var(--font-newsreader), serif", fontSize: 24, fontWeight: 500, cursor: "pointer", textAlign: "center" }}
                    >
                      {h}<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10 }}>j</span>
                    </button>
                  ))}
                </div>
                <div className="px-6 pb-5">
                  <button
                    type="button"
                    onClick={() => setLemburStep("ask-boss")}
                    style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}
                  >
                    ← Kembali
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {pendingLemburJam !== null && (
        <SelfieCapture
          workerName={me.name}
          onCapture={() => { const jam = pendingLemburJam; setPendingLemburJam(null); doClockOutAndStartLembur(jam); }}
          onCancel={() => setPendingLemburJam(null)}
        />
      )}

      {snack && <Toast message={snack} />}

      {showLaporanStepper && (
        <LaporanStepper
          project={myProjects.find((p) => p.id === activeSession?.projectId)}
          workerName={me.name}
          onSubmit={handleLaporanSubmit}
          onCancel={() => setShowLaporanStepper(false)}
        />
      )}

      {showWarning && (
        <div className="absolute inset-x-0 bottom-16 mx-4 z-50 p-4 flex items-center justify-between gap-3"
          style={{ background: "var(--kas-ink)", color: "var(--kas-paper)", border: "1px solid var(--kas-rust)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-rust)", marginBottom: 2 }}>
              Sesi hampir berakhir
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14 }}>
              Anda akan keluar otomatis dalam 1 menit.
            </div>
          </div>
          <button type="button" onClick={dismissWarning} style={{ border: "1px solid var(--kas-paper)", background: "transparent", color: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "6px 10px", cursor: "pointer", flexShrink: 0 }}>
            Tetap
          </button>
        </div>
      )}
    </div>
  );
}
