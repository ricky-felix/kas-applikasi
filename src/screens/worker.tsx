"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, WORKER_TODAY } from "@/lib/data";
import { Account } from "@/lib/data";
import { Toast, MobileTopBar } from "@/components/primitives";
import HomeTab from "@/components/worker/home";
import PhotoTab from "@/components/worker/photo-tab";
import HistoryTab from "@/components/worker/history-tab";
import ProfileTab from "@/components/worker/profile-tab";

type Session = { id: number; projectId: string; in: string; out: string | null };

function nowStr() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function WorkerScreen({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const me = WORKERS.find((w) => w.id === (session?.workerId || WORKER_TODAY.workerId)) || WORKERS[0];
  const myProjects = PROJECTS.filter((p) => WORKER_TODAY.projectIds.includes(p.id));

  const [tab, setTab] = useState<"home" | "photo" | "history" | "profile">("home");
  const [state, setState] = useState({
    sessions: [] as Session[],
    absentProjectIds: [] as string[],
    selectedProjectId: myProjects[0]?.id || "",
    photos: 0,
    overtime: 0,
  });
  const [snack, setSnack] = useState<string | null>(null);

  const toast = (msg: string) => {
    setSnack(msg);
    setTimeout(() => setSnack(null), 2400);
  };

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
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => x.id === activeSession.id ? { ...x, out: nowStr() } : x),
    }));
    toast(`Pulang · ${proj?.address || proj?.name}`);
  };

  const markProjectAbsent = (pid: string) => {
    setState((s) => ({ ...s, absentProjectIds: [...s.absentProjectIds, pid] }));
    toast("Tidak hadir tercatat.");
  };

  const TABS = [
    { k: "home",    n: "01", l: "Hadir", icon: "✓" },
    { k: "photo",   n: "02", l: "Foto",  icon: "▣" },
    { k: "history", n: "03", l: "Riwayat", icon: "≡" },
    { k: "profile", n: "04", l: "Profil", icon: "○" },
  ] as const;

  const tabLabel =
    tab === "home" ? "01 · HARI INI" :
    tab === "photo" ? "02 · FOTO" :
    tab === "history" ? "03 · RIWAYAT" : "04 · PROFIL";

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ background: "var(--kas-paper)", color: "var(--kas-ink)", fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <MobileTopBar tabLabel={tabLabel} />

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
        {tab === "photo" && (
          <PhotoTab
            proj={myProjects[0]}
            state={state}
            setState={setState}
            toast={toast}
          />
        )}
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
