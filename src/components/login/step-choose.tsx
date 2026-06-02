"use client";
import { useEffect, useState } from "react";
import { ACCOUNTS } from "@/lib/data";

export function StepPhone({
  onSubmit,
  onSavedLogin,
  onQuickLogin,
  onRegister,
}: {
  onSubmit: (phone: string) => void;
  onSavedLogin: (phone: string, pin: string) => void;
  onQuickLogin: (phone: string, pin: string) => void;
  onRegister?: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState<{ phone: string; pin: string } | null>(null);

  useEffect(() => {
    try {
      const p   = localStorage.getItem("kas-saved-phone");
      const pin = localStorage.getItem("kas-saved-pin");
      if (p && pin) setSaved({ phone: p, pin });
    } catch {}
  }, []);

  const handleForget = () => {
    try { localStorage.removeItem("kas-saved-phone"); localStorage.removeItem("kas-saved-pin"); } catch {}
    setSaved(null);
  };

  const canSubmit = phone.length >= 10;

  return (
    <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
      <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
        Selamat<br /><em>datang.</em>
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 10 }}>
        Masukkan nomor HP Anda
      </div>

      <div className="mt-8">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 14))}
          onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) onSubmit(phone); }}
          placeholder="08xxxxxxxxxx"
          autoFocus
          className="w-full px-4 py-4"
          style={{
            border: "1px solid var(--kas-ink)",
            background: "var(--kas-paper)",
            fontFamily: "var(--font-newsreader), serif",
            fontSize: 26,
            letterSpacing: "0.04em",
            color: "var(--kas-ink)",
            outline: "none",
          }}
        />
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {saved && (
          <div style={{ border: "1px solid var(--kas-cobalt)", background: "var(--kas-paper-2)", padding: "14px 16px", marginBottom: 4 }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-cobalt)", marginBottom: 6 }}>
              Akses cepat tersimpan
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-2)", marginBottom: 10, letterSpacing: "0.06em" }}>
              {saved.phone}
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSavedLogin(saved.phone, saved.pin)}
                style={{ flex: 1, border: "none", background: "var(--kas-cobalt)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 0", cursor: "pointer" }}
              >
                Masuk Kembali →
              </button>
              <button
                type="button"
                onClick={handleForget}
                style={{ border: "1px solid var(--kas-line)", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 10px", cursor: "pointer" }}
              >
                Lupakan
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => { if (canSubmit) onSubmit(phone); }}
          disabled={!canSubmit}
          className="w-full py-5 flex flex-col items-start px-5"
          style={{ border: "none", background: canSubmit ? "var(--kas-ink)" : "var(--kas-line)", color: canSubmit ? "var(--kas-paper)" : "var(--kas-ink-3)", cursor: canSubmit ? "pointer" : "default" }}
        >
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 400 }}>
            Lanjut <em>→</em>
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginTop: 4 }}>
            Akan masuk ke halaman kode akses
          </span>
        </button>

        {onRegister && (
          <div className="flex justify-center" style={{ marginTop: 2, marginBottom: 2 }}>
            <button
              type="button"
              onClick={onRegister}
              style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Belum punya akun? Daftar →
            </button>
          </div>
        )}

        <div className="mt-2">
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6 }}>
            Demo · untuk melihat tampilan posisi klik dibawah ini
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACCOUNTS.map((a) => (
              <button
                key={a.phone}
                type="button"
                onClick={() => onQuickLogin(a.phone, a.pin)}
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-2)", cursor: "pointer", textTransform: "uppercase" }}
              >
                {a.role.replace("_", " ")} · {a.pin}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
