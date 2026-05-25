"use client";
import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { ACCOUNTS, fmtPhone } from "@/lib/data";
import { KasBrandMark, MonoLabel } from "./ui";
import { login } from "@/app/actions";

const PIN_LENGTH = 6;

export default function LoginScreen() {
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [acctName, setAcctName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const phoneRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "phone") phoneRef.current?.focus();
    else pinRef.current?.focus();
  }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const submitPhone = useCallback(() => {
    const a = ACCOUNTS.find((x) => x.phone === phone);
    if (!a) { triggerShake(); setTimeout(() => setPhone(""), 400); return; }
    setAcctName(a.name);
    setPin("");
    setStep("pin");
  }, [phone]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    setPhone(digits);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && phone.length >= 10) submitPhone();
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(raw);
    if (raw.length === PIN_LENGTH) {
      startTransition(async () => {
        const result = await login(phone, raw);
        if (result?.error) {
          triggerShake();
          setTimeout(() => setPin(""), 400);
        }
      });
    }
  };

  const quickLogin = (phone: string) => {
    const a = ACCOUNTS.find((x) => x.phone === phone);
    if (!a) return;
    setPhone(a.phone);
    setAcctName(a.name);
    setPin("");
    setStep("pin");
  };

  const firstName = acctName?.split(" ").slice(-1)[0] ?? "";

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: "var(--kas-paper)",
        color: "var(--kas-ink)",
        fontFamily: "var(--font-manrope), sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--kas-ink)" }}
      >
        <div className="flex items-center gap-2.5">
          <KasBrandMark size={24} />
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 18, letterSpacing: "-0.01em" }}>
            Tauke
          </span>
        </div>
        <MonoLabel size={9}>
          {step === "phone" ? "01 · NOMOR HP" : "02 · KODE AKSES"}
        </MonoLabel>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)" }}>—</span>
        <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.18em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
          CV KARYA AGUNG SEJATI
        </span>
      </div>

      {/* Headline */}
      <div className="px-5 pt-5 pb-2">
        {step === "phone" ? (
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
            Masukkan<br /><em>nomor HP.</em>
          </div>
        ) : (
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
            Halo, <em>{firstName}.</em><br />
            <span style={{ color: "var(--kas-ink-3)", fontSize: 24 }}>Kode akses 6 karakter.</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        {step === "phone" ? (
          <div
            className="flex items-center gap-2.5 px-3.5"
            style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}
          >
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 15, color: "var(--kas-ink-3)", flexShrink: 0 }}>+62</span>
            <span style={{ width: 1, height: 20, background: "var(--kas-line)", flexShrink: 0 }} />
            <input
              ref={phoneRef}
              type="tel"
              inputMode="numeric"
              value={fmtPhone(phone)}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              placeholder="0000 0000 0000"
              className="flex-1 py-3.5 bg-transparent outline-none"
              style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 17, letterSpacing: "0.06em", color: "var(--kas-ink)", border: "none", minWidth: 0 }}
            />
            {phone && (
              <button
                onClick={() => { setPhone(""); phoneRef.current?.focus(); }}
                style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, cursor: "pointer", letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0 }}
              >
                Hapus
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
              {[0,1,2,3,4,5].map((i) => (
                <div
                  key={i}
                  onClick={() => pinRef.current?.focus()}
                  className="grid place-items-center cursor-text"
                  style={{
                    height: 52,
                    border: `1px solid ${i === pin.length ? "var(--kas-orange)" : "var(--kas-ink)"}`,
                    background: pin.length > i ? "var(--kas-ink)" : "var(--kas-paper-2)",
                    color: "var(--kas-paper)",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 18,
                    fontWeight: 500,
                    transition: "border-color 0.1s",
                  }}
                >
                  {pin.length > i ? pin[i].toUpperCase() : ""}
                </div>
              ))}
            </div>
            <input
              ref={pinRef}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={pin}
              onChange={handlePinChange}
              disabled={isPending}
              maxLength={PIN_LENGTH}
              className="absolute inset-0 opacity-0 cursor-text"
              style={{ fontSize: 0 }}
              aria-label="Kode akses"
            />
          </div>
        )}
      </div>

      {/* Hints */}
      <div className="px-5 pb-4">
        {step === "phone" ? (
          <div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>
              Demo · pilih cepat
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { phone: ACCOUNTS[0].phone, label: "Super", pin: ACCOUNTS[0].pin },
                { phone: ACCOUNTS[1].phone, label: "Bapak", pin: ACCOUNTS[1].pin },
                { phone: ACCOUNTS[2].phone, label: "Administrasi", pin: ACCOUNTS[2].pin },
                { phone: ACCOUNTS[3].phone, label: "Pekerja", pin: ACCOUNTS[3].pin },
              ].map((item) => (
                <button
                  key={item.phone}
                  onClick={() => quickLogin(item.phone)}
                  style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-2)", cursor: "pointer", textTransform: "uppercase" }}
                >
                  {item.label} · {item.pin}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <button
              onClick={() => { setStep("phone"); setPin(""); setAcctName(null); }}
              style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 0" }}
            >
              ← Ganti nomor
            </button>
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)" }}>
              +62 {fmtPhone(phone)}
            </span>
          </div>
        )}
      </div>

      {/* CTA / status */}
      <div className="px-5 mt-auto pb-10">
        {step === "phone" ? (
          <>
            <button
              onClick={submitPhone}
              disabled={phone.length < 10}
              className="w-full py-4"
              style={{
                border: "none",
                background: phone.length >= 10 ? "var(--kas-ink)" : "var(--kas-line)",
                color: phone.length >= 10 ? "var(--kas-paper)" : "var(--kas-ink-3)",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: phone.length >= 10 ? "pointer" : "default",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              Lanjut →
            </button>
            <div className="mt-3 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>
              Atau tekan Enter
            </div>
          </>
        ) : (
          <div className="text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: isPending ? "var(--kas-orange)" : "var(--kas-ink-3)" }}>
            {isPending ? "Masuk…" : "Ketik kode akses 6 karakter — otomatis masuk"}
          </div>
        )}
      </div>
    </div>
  );
}
