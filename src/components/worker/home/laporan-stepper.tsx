"use client";
import { useRef, useState } from "react";
import { type Project } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";

const PHASES = [
  { key: "Sebelum", roman: "I"   },
  { key: "Sedang",  roman: "II"  },
  { key: "Sesudah", roman: "III" },
];

type Photo = { id: number; phase: string; src: string };

function CameraIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="14" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 6l1.5-2h5L16 6" />
    </svg>
  );
}

function UploadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function LaporanStepper({
  project,
  workerName,
  onSubmit,
  onCancel,
}: {
  project: Project | undefined;
  workerName: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [step, setStep]   = useState<1 | 2>(1);
  const [phase, setPhase] = useState("Sedang");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [note, setNote]   = useState("");

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const totalPhotos   = photos.length;
  const wordCount     = note.trim() ? note.trim().split(/\s+/).length : 0;
  const selectedPhase = PHASES.find((p) => p.key === phase)!;

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), phase, src }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: number) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: "var(--kas-paper)", color: "var(--kas-ink)" }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--kas-ink)" }}>
        <div className="flex gap-2 mb-4">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className="flex items-center gap-1.5 px-3 py-1.5"
              style={{
                border: "1px solid var(--kas-ink)",
                background: step === s ? "var(--kas-ink)" : "var(--kas-paper)",
                color:      step === s ? "var(--kas-paper)" : "var(--kas-ink-3)",
              }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 14, fontStyle: "italic", lineHeight: 1 }}>
                {s === 1 ? "I" : "II"}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {s === 1 ? "Foto" : "Catatan"}
              </span>
            </div>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onCancel}
            style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
          >
            ✕ Batal
          </button>
        </div>

        {project && (
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em" }}>
            {project.code} · {project.name}
          </div>
        )}
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
          {step === 1 ? <>Dokumentasi,<br /><em>proyek hari ini.</em></> : <>Laporan,<br /><em>harian.</em></>}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">

        {/* ── STEP 1: Foto ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            {/* Phase tabs */}
            <div className="flex items-center justify-between mb-3">
              <MonoLabel size={9}>FASE DOKUMENTASI</MonoLabel>
              {totalPhotos > 0 && (
                <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500 }}>
                  {String(totalPhotos).padStart(2, "0")}
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginLeft: 4 }}>FOTO</span>
                </span>
              )}
            </div>

            <div className="flex" style={{ marginBottom: 16 }}>
              {PHASES.map(({ key, roman }, i) => {
                const count = photos.filter((p) => p.phase === key).length;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPhase(key)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 relative"
                    style={{
                      border: "1px solid var(--kas-ink)",
                      marginLeft: i > 0 ? -1 : 0,
                      background: phase === key ? "var(--kas-ink)" : "var(--kas-paper)",
                      color:      phase === key ? "var(--kas-paper)" : "var(--kas-ink)",
                      cursor: "pointer",
                      zIndex: phase === key ? 1 : 0,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontStyle: "italic", lineHeight: 1 }}>{roman}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase" }}>{key}</span>
                    {count > 0 && (
                      <span
                        className="absolute top-1.5 right-2"
                        style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: phase === key ? "rgba(255,255,255,0.55)" : "var(--kas-ochre)" }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Photo grid */}
            {totalPhotos > 0 && (
              <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative"
                    style={{ aspectRatio: "1 / 1", overflow: "hidden", background: "var(--kas-paper-2)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* Phase badge */}
                    <span
                      className="absolute bottom-0 left-0 px-1.5 py-0.5"
                      style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(22,28,44,0.72)", color: "#fff" }}
                    >
                      {PHASES.find((p) => p.key === photo.phase)?.roman} · {photo.phase}
                    </span>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 grid place-items-center"
                      style={{ width: 22, height: 22, background: "rgba(22,28,44,0.72)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {totalPhotos === 0 && (
              <div
                className="flex flex-col items-center justify-center mb-4"
                style={{ height: 96, border: "1px dashed var(--kas-ink-3)", background: "var(--kas-paper-2)" }}
              >
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Belum ada foto
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center gap-2 py-4"
                style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-ink)", color: "var(--kas-paper)", cursor: "pointer" }}
              >
                <CameraIcon size={22} />
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Kamera
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", opacity: 0.5, textTransform: "uppercase" }}>
                  Fase {selectedPhase.roman}
                </span>
              </button>

              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="flex flex-col items-center gap-2 py-4"
                style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", cursor: "pointer" }}
              >
                <UploadIcon size={22} />
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Unggah
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", opacity: 0.5, textTransform: "uppercase" }}>
                  Dari galeri
                </span>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { readFiles(e.target.files); e.target.value = ""; }}
            />
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { readFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
        )}

        {/* ── STEP 2: Catatan ───────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <MonoLabel size={9}>CATATAN HARIAN</MonoLabel>
              {wordCount > 0 && (
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>
                  {wordCount} kata
                </span>
              )}
            </div>

            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Progres hari ini, kendala yang ditemukan, dan rencana untuk besok..."
              rows={7}
              className="w-full px-4 py-3.5 resize-none"
              style={{
                border: "1px solid var(--kas-ink)",
                background: "var(--kas-paper)",
                fontFamily: "var(--font-newsreader), serif",
                fontSize: 16, lineHeight: 1.65,
                color: "var(--kas-ink)",
                outline: "none",
                display: "block",
              }}
            />

            {/* Photo summary strip */}
            {totalPhotos > 0 && (
              <div className="mt-3 flex gap-px">
                {PHASES.map(({ key, roman }) => {
                  const count = photos.filter((p) => p.phase === key).length;
                  return (
                    <div key={key} className="flex-1 px-3 py-2" style={{ background: count > 0 ? "var(--kas-paper-2)" : "transparent", border: "1px solid var(--kas-line)" }}>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{roman} · {key}</div>
                      <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, fontWeight: 500, lineHeight: 1, marginTop: 2, color: count > 0 ? "var(--kas-ink)" : "var(--kas-ink-4)" }}>
                        {count > 0 ? String(count).padStart(2, "0") : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 4 }}>
                Ringkasan laporan
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.06em" }}>
                {totalPhotos > 0 ? `${totalPhotos} foto dilampirkan` : "Tidak ada foto"} · {workerName}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer actions ────────────────────────────────────────────────── */}
      <div className="px-5 pb-6 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--kas-line)" }}>
        {step === 1 ? (
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-4"
            style={{
              border: "none",
              background: "var(--kas-ink)",
              color: "var(--kas-paper)",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {totalPhotos > 0 ? `Lanjut dengan ${totalPhotos} foto →` : "Lanjut tanpa foto →"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { if (note.trim()) onSubmit(); }}
              className="w-full py-4"
              style={{
                border: "none",
                background: note.trim() ? "var(--kas-ink)" : "var(--kas-line)",
                color: note.trim() ? "var(--kas-paper)" : "var(--kas-ink-3)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: note.trim() ? "pointer" : "default",
              }}
            >
              Kirim Laporan &amp; Pulang →
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2"
              style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              ← Kembali ke Foto
            </button>
          </>
        )}
      </div>
    </div>
  );
}
