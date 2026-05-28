"use client";
import { useState, useEffect } from "react";
import { PROJECTS } from "@/lib/data";
import { Kicker, MonoLabel } from "@/components/primitives";
import { ConfirmDialog } from "./confirm-dialog";

type Session = { id: number; projectId: string; in: string; out: string | null; lemburJam?: number; lemburEndsAt?: number };
type Step = "idle" | "location-confirm" | "lembur-check" | "lembur-approval" | "lembur-duration";

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="square" />
    </svg>
  );
}

function isAfterSixPM() {
  return new Date().getHours() >= 18;
}

const LEMBUR_HOURS = [1, 2, 3, 4, 5];

function useCountdown(endsAt: number | undefined) {
  const [msLeft, setMsLeft] = useState(() => endsAt ? Math.max(0, endsAt - Date.now()) : 0);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setMsLeft(Math.max(0, endsAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return msLeft;
}

function fmtCountdown(ms: number) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return { hh, mm, ss };
}

export function ClockSection({
  selectedProj,
  activeSession,
  isAbsent,
  absentReason,
  onClockIn,
  onClockOut,
  onClockInLembur,
}: {
  selectedProj: typeof PROJECTS[0] | undefined;
  activeSession: Session | undefined;
  isAbsent: boolean;
  absentReason?: string;
  onClockIn: () => void;
  onClockOut: () => void;
  onClockInLembur: (hours: number) => void;
}) {
  const [step, setStep] = useState<Step>("idle");
  const msLeft = useCountdown(activeSession?.lemburEndsAt);

  if (!selectedProj) return null;

  const selectedActive    = activeSession && activeSession.projectId === selectedProj.id;
  const someoneElseActive = activeSession && activeSession.projectId !== selectedProj.id;
  const isLemburActive    = !!(selectedActive && activeSession.lemburEndsAt);
  const lemburDone        = isLemburActive && msLeft === 0;
  const countdown         = fmtCountdown(msLeft);

  const handleMasukClick = () => {
    if (isAfterSixPM()) {
      setStep("lembur-check");
    } else {
      setStep("location-confirm");
    }
  };

  const reset = () => setStep("idle");

  if (isAbsent) {
    return (
      <div className="mt-4">
        <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
        <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-ochre)" }} />
            <MonoLabel size={10}>TERCATAT</MonoLabel>
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
            Tidak hadir.
          </div>
          {absentReason && (
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 6 }}>
              {absentReason}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4">
        <Kicker no="02" label={`JAM KERJA · ${selectedProj.address.toUpperCase()}`} />
        {selectedActive && isLemburActive ? (
          <div style={{ border: `2px solid ${lemburDone ? "var(--kas-rust)" : "var(--kas-ochre)"}` }}>
            <div className="px-4 pt-4 pb-3" style={{ background: lemburDone ? "var(--kas-rust)" : "var(--kas-ochre)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-ink)", opacity: 0.5 }} />
                <MonoLabel size={9}>{lemburDone ? "WAKTU LEMBUR HABIS" : `LEMBUR · ${activeSession.lemburJam}J DISETUJUI`}</MonoLabel>
              </div>
              <div className="flex items-end gap-1" style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                <span style={{ fontSize: 56 }}>{countdown.hh}</span>
                <span style={{ fontSize: 36, marginBottom: 4, opacity: 0.5 }}>:</span>
                <span style={{ fontSize: 56 }}>{countdown.mm}</span>
                <span style={{ fontSize: 36, marginBottom: 4, opacity: 0.5 }}>:</span>
                <span style={{ fontSize: 56 }}>{countdown.ss}</span>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 6, opacity: 0.6 }}>
                {lemburDone ? "Segera selesaikan pekerjaan" : "Sisa waktu lembur"}
              </div>
            </div>
            <button
              type="button"
              onClick={onClockOut}
              className="w-full flex items-center justify-center gap-2.5"
              style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, padding: "20px 14px", cursor: "pointer" }}
            >
              <ClockIcon />
              <span>Selesai <em>lembur.</em></span>
            </button>
          </div>
        ) : selectedActive ? (
          <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="inline-block" style={{ width: 8, height: 8, background: "var(--kas-cobalt)" }} />
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
            <button type="button" onClick={onClockOut} className="w-full mt-3.5 flex items-center justify-center gap-2.5" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 24, padding: "20px 14px", cursor: "pointer" }}>
              <ClockIcon />
              <span>Pulang <em>kerja.</em></span>
            </button>
          </div>
        ) : someoneElseActive ? (
          <div className="p-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-ink)" }}>
            <MonoLabel size={10}>Sedang aktif di proyek lain</MonoLabel>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, margin: "8px 0 12px" }}>
              Pulang dulu dari <em>{PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}</em>, baru mulai di sini.
            </div>
            <button type="button" onClick={onClockOut} className="w-full" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "14px 12px", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Pulang dari {PROJECTS.find((p) => p.id === activeSession?.projectId)?.address}
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleMasukClick} className="w-full flex items-center justify-center gap-3 relative" style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 28, padding: "26px 14px", cursor: "pointer" }}>
            <ClockIcon size={22} />
            <span>Masuk <em>kerja.</em></span>
            <span className="absolute top-2 right-2 inline-block" style={{ width: 8, height: 8, background: "var(--kas-rust)" }} />
          </button>
        )}
      </div>

      {step === "location-confirm" && (
        <ConfirmDialog
          message="Apakah Anda sudah di lokasi proyek?"
          sub={selectedProj.address.toUpperCase()}
          confirmLabel="Ya, sudah di sini"
          cancelLabel="Belum"
          onConfirm={() => { reset(); onClockIn(); }}
          onCancel={reset}
        />
      )}

      {step === "lembur-check" && (
        <ConfirmDialog
          message="Apakah ini jam lembur?"
          sub="Jam kerja normal sudah lewat pukul 18:00. Apakah Anda masuk untuk lembur?"
          confirmLabel="Ya, ini lembur"
          cancelLabel="Tidak, kerja biasa"
          onConfirm={() => setStep("lembur-approval")}
          onCancel={() => setStep("location-confirm")}
        />
      )}

      {step === "lembur-approval" && (
        <ConfirmDialog
          message="Apakah lembur sudah di-approve bos?"
          sub="Lembur hanya boleh dicatat jika sudah mendapat konfirmasi dari mandor atau pemilik proyek."
          confirmLabel="Ya, sudah di-approve"
          cancelLabel="Belum"
          onConfirm={() => setStep("lembur-duration")}
          onCancel={reset}
        />
      )}

      {step === "lembur-duration" && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-5"
          style={{ background: "rgba(22,28,44,0.5)" }}
          onClick={reset}
        >
          <div
            className="w-full max-w-md"
            style={{ background: "var(--kas-paper)", border: "2px solid var(--kas-ink)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Berapa jam lembur?
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.1em", marginTop: 8, lineHeight: 1.5 }}>
                DURASI YANG DISETUJUI BOS
              </div>
            </div>
            <div className="grid px-6 pt-4 gap-2" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
              {LEMBUR_HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { reset(); onClockInLembur(h); }}
                  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", color: "var(--kas-ink)", padding: "16px 0", fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, cursor: "pointer", textAlign: "center" }}
                >
                  {h}<span style={{ fontSize: 12 }}>j</span>
                </button>
              ))}
            </div>
            <div className="px-6 pb-6 pt-4">
              <button
                type="button"
                onClick={reset}
                style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
              >
                ← Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
