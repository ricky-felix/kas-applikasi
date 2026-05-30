"use client";
import { useRef, useState } from "react";
import { type Gender, type Jabatan, JABATAN_OPTIONS } from "./types";
import { BackButton, ErrorHint, RegStepper } from "./shared";

function AvatarUpload({
  photo,
  name,
  onChange,
}: {
  photo: string | null;
  name: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") onChange(ev.target.result);
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center" style={{ marginBottom: 20 }}>
      <div
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "relative",
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "2px solid var(--kas-ink)",
          background: photo ? "transparent" : "var(--kas-paper-2)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Foto profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, color: "var(--kas-ink-3)", userSelect: "none" }}>
            {initials || "?"}
          </span>
        )}
        {/* camera overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hover ? 1 : 0,
          transition: "opacity 0.15s",
        }}>
          <span style={{ fontSize: 20, color: "#fff" }}>&#128247;</span>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginTop: 6 }}>
        Ketuk untuk unggah foto
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

export function StepRegProfile({
  photo,
  name,
  gender,
  jabatan,
  jabatanLainnya,
  errorMsg,
  isPending,
  onPhotoChange,
  onNameChange,
  onGenderChange,
  onJabatanChange,
  onJabatanLainnyaChange,
  onSubmit,
  onBack,
}: {
  photo: string | null;
  name: string;
  gender: Gender | null;
  jabatan: Jabatan | null;
  jabatanLainnya: string;
  errorMsg: string | null;
  isPending: boolean;
  onPhotoChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onGenderChange: (v: Gender) => void;
  onJabatanChange: (v: Jabatan) => void;
  onJabatanLainnyaChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const ready =
    name.trim().length > 0 &&
    gender !== null &&
    jabatan !== null &&
    (jabatan !== "Lainnya" || jabatanLainnya.trim().length > 0);

  const btnBase: React.CSSProperties = {
    border: "1px solid var(--kas-ink)",
    fontFamily: "var(--font-jetbrains), monospace",
    fontSize: 9,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    padding: "8px 10px",
  };

  const btnSelected: React.CSSProperties = {
    ...btnBase,
    background: "var(--kas-ink)",
    color: "var(--kas-paper)",
  };

  const btnUnselected: React.CSSProperties = {
    ...btnBase,
    background: "var(--kas-paper-2)",
    color: "var(--kas-ink)",
  };

  return (
    <>
      <RegStepper current={3} />
      <div className="px-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Profil<br /><em>Anda.</em>
        </div>
      </div>

      <div className="px-5 pt-5 pb-3 flex flex-col gap-5" style={{ flex: 1, overflowY: "auto" }}>
        {/* Avatar */}
        <AvatarUpload photo={photo} name={name} onChange={onPhotoChange} />

        {/* Nama */}
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
            Nama lengkap
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nama Anda"
            autoFocus
            className="w-full px-3.5 py-3.5"
            style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 16, color: "var(--kas-ink)", outline: "none" }}
          />
        </div>

        {/* Gender */}
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
            Jenis kelamin
          </div>
          <div className="flex gap-2">
            {(["L", "P"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGenderChange(g)}
                style={{ flex: 1, ...(gender === g ? btnSelected : btnUnselected), padding: "10px 0", fontSize: 10 }}
              >
                {g === "L" ? "Laki-laki" : "Perempuan"}
              </button>
            ))}
          </div>
        </div>

        {/* Jabatan */}
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
            Jabatan
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {JABATAN_OPTIONS.map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => onJabatanChange(j)}
                style={jabatan === j ? btnSelected : btnUnselected}
              >
                {j}
              </button>
            ))}
          </div>
          {jabatan === "Lainnya" && (
            <input
              type="text"
              value={jabatanLainnya}
              onChange={(e) => onJabatanLainnyaChange(e.target.value)}
              placeholder="Jabatan Anda"
              autoFocus
              className="w-full px-3.5 py-3 mt-3"
              style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 14, color: "var(--kas-ink)", outline: "none" }}
            />
          )}
        </div>

        <ErrorHint message={errorMsg} />
      </div>

      <div className="px-5 pb-6 flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={!ready || isPending}
          className="w-full py-4"
          style={{ border: "none", background: ready ? "var(--kas-ink)" : "var(--kas-line)", color: ready ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: ready ? "pointer" : "default" }}
        >
          {isPending ? "Mengirim…" : "Kirim untuk Diverifikasi →"}
        </button>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}
