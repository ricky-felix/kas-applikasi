"use client";
import { useRef, useState } from "react";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return parts.map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--kas-ink)",
  background: "var(--kas-paper)",
  fontFamily: "var(--font-newsreader), serif",
  fontSize: 16,
  color: "var(--kas-ink)",
  outline: "none",
  padding: "12px 14px",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains), monospace",
  fontSize: 9,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--kas-ink-3)",
  marginBottom: 6,
  display: "block",
};

/**
 * Shared "Edit Profil" overlay used by every role (pekerja, kepala proyek,
 * admin, owner, super admin). Self-contained centered modal; the parent owns
 * the displayed profile state and persists the result via onSave.
 */
export function EditProfileOverlay({
  name,
  phone,
  role,
  allowPhoto = false,
  photo: initialPhoto = null,
  onCancel,
  onSave,
}: {
  name: string;
  phone: string;
  role?: string;
  allowPhoto?: boolean;
  photo?: string | null;
  onCancel: () => void;
  onSave: (next: { name: string; phone: string; photo: string | null }) => void;
}) {
  const [n, setN]       = useState(name);
  const [p, setP]       = useState(phone);
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin]   = useState("");
  const [pin2, setPin2] = useState("");
  const [err, setErr]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!n.trim()) { setErr("Nama tidak boleh kosong."); return; }
    if (!p.trim()) { setErr("Nomor HP tidak boleh kosong."); return; }
    if (showPin && (pin || pin2)) {
      if (pin.length < 6) { setErr("Kode akses minimal 6 karakter."); return; }
      if (pin !== pin2)   { setErr("Konfirmasi kode akses tidak cocok."); return; }
    }
    onSave({ name: n.trim(), phone: p.trim(), photo });
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-5"
      style={{ background: "rgba(22,28,44,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md"
        style={{ background: "var(--kas-paper)", border: "2px solid var(--kas-ink)", maxHeight: "92%", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3" style={{ borderBottom: "1px solid var(--kas-line)" }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
            Edit Profil
          </span>
          <button
            type="button"
            onClick={onCancel}
            style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, lineHeight: 1, color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
          >
            ×
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">
          {allowPhoto ? (
            /* Uploadable photo avatar */
            <div className="flex flex-col items-center mb-5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid place-items-center"
                style={{ width: 92, height: 92, borderRadius: "50%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", cursor: "pointer", overflow: "hidden", padding: 0 }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 30, fontWeight: 500, color: "var(--kas-ink)" }}>{initials(n)}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ border: "none", background: "transparent", marginTop: 10, fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer" }}
              >
                {photo ? "Ketuk untuk ganti foto" : "Ketuk untuk unggah foto"}
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  style={{ border: "none", background: "transparent", marginTop: 2, fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-rust)", cursor: "pointer" }}
                >
                  Hapus foto
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }}
              />
              {role && (
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 8, letterSpacing: "0.1em" }}>{role}</div>
              )}
            </div>
          ) : (
            /* Initials-only preview */
            <div className="flex items-center gap-3.5 mb-5">
              <div className="grid place-items-center" style={{ width: 52, height: 52, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}>
                {initials(n)}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.1 }}>{n.trim() || "—"}</div>
                {role && (
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{role}</div>
                )}
              </div>
            </div>
          )}

          {/* Nama */}
          <div className="mb-4">
            <label style={labelStyle}>Nama Lengkap</label>
            <input
              type="text"
              value={n}
              onChange={(e) => { setN(e.target.value); setErr(null); }}
              placeholder="Nama lengkap"
              style={inputStyle}
            />
          </div>

          {/* Nomor HP */}
          <div className="mb-4">
            <label style={labelStyle}>Nomor HP</label>
            <input
              type="tel"
              inputMode="tel"
              value={p}
              onChange={(e) => { setP(e.target.value); setErr(null); }}
              placeholder="08xxxxxxxxxx"
              style={inputStyle}
            />
          </div>

          {/* Ubah PIN (opsional) */}
          {!showPin ? (
            <button
              type="button"
              onClick={() => setShowPin(true)}
              className="w-full flex items-center justify-between py-3"
              style={{ border: "1px dashed var(--kas-ink-3)", background: "transparent", cursor: "pointer", padding: "12px 14px" }}
            >
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--kas-ink-2)" }}>+ Buat Kode Akses</span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)" }}>OPSIONAL</span>
            </button>
          ) : (
            <div style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper-2)", padding: "14px" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>Buat Kode Akses</span>
                <button
                  type="button"
                  onClick={() => { setShowPin(false); setPin(""); setPin2(""); setErr(null); }}
                  style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
                >
                  Batal
                </button>
              </div>
              <div className="mb-2.5">
                <label style={labelStyle}>Kode Akses Baru</label>
                <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setErr(null); }} placeholder="Min. 6 karakter" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Konfirmasi Kode Akses</label>
                <input type="password" value={pin2} onChange={(e) => { setPin2(e.target.value); setErr(null); }} placeholder="Ulangi kode akses" style={inputStyle} />
              </div>
            </div>
          )}

          {err && (
            <div className="mt-4 px-3 py-2.5" style={{ background: "var(--kas-rust-soft, rgba(180,60,40,0.08))", border: "1px solid var(--kas-rust)" }}>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-rust)", letterSpacing: "0.06em" }}>{err}</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid gap-2 mt-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submit}
              style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "14px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
