"use client";
import { useState } from "react";
import { WORKERS } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";
import AMWorkerManagement from "./worker-management";

type SubView = "workers";

function MenuItem({ n, label, sub, onClick }: { n: string; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5"
      style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", cursor: "pointer" }}
    >
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>{n}</span>
        <div className="text-left">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16 }}>{label}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{sub}</div>
        </div>
      </div>
      <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, color: "var(--kas-ink-3)" }}>→</span>
    </button>
  );
}

export default function AMMore({ session, toast, onLogout }: { session: { name: string; short: string }; toast: (m: string) => void; onLogout: () => void }) {
  const [subView, setSubView] = useState<SubView | null>(null);
  const back = () => setSubView(null);

  if (subView === "workers") return <AMWorkerManagement onBack={back} toast={toast} />;

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="05" label="AKUN & PENGATURAN" />
      <DisplayHeading size={28}>Lainnya,<br /><em>{session.name.split(" ").slice(-1)[0]}.</em></DisplayHeading>

      {/* ── Profile card ──────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div className="grid place-items-center" style={{ width: 48, height: 48, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 500 }}>
          {session.short}
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 19, lineHeight: 1.1 }}>{session.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            ADMINISTRASI · STAF KANTOR
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {/* A · Tim */}
        <div>
          <Kicker no="A" label="MANAJEMEN TIM" />
          <MenuItem n="01" label="Manajemen Pekerja" sub={`${WORKERS.length} pekerja terdaftar`} onClick={() => setSubView("workers")} />
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────────────────────────── */}
      <div className="mt-6">
        <button
          onClick={onLogout}
          className="w-full py-3.5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
