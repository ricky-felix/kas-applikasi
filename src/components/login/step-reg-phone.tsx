import { useRef, useEffect } from "react";
import { fmtPhone } from "@/lib/data";
import { BackButton, ErrorHint, RegStepper } from "./shared";

export function StepRegPhone({
  phone,
  shake,
  errorMsg,
  isPending,
  onChange,
  onSubmit,
  onBack,
}: {
  phone: string;
  shake: boolean;
  errorMsg: string | null;
  isPending: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const ready = phone.length >= 10;

  return (
    <>
      <RegStepper current={1} />
      <div className="px-5 pb-2">
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          Nomor<br /><em>HP Anda.</em>
        </div>
      </div>

      <div className={`px-5 pt-4 pb-3 ${shake ? "animate-kas-shake" : ""}`}>
        <div className="flex items-center gap-2.5 px-3.5" style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 15, color: "var(--kas-ink-3)", flexShrink: 0 }}>+62</span>
          <span style={{ width: 1, height: 20, background: "var(--kas-line)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={fmtPhone(phone)}
            onChange={onChange}
            onKeyDown={(e) => { if (e.key === "Enter" && ready) onSubmit(); }}
            placeholder="0000 0000 0000"
            className="flex-1 py-3.5 bg-transparent outline-none"
            style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 17, letterSpacing: "0.06em", color: "var(--kas-ink)", border: "none", minWidth: 0 }}
          />
          {phone && (
            <button
              onClick={() => { onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>); inputRef.current?.focus(); }}
              style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, cursor: "pointer", letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0 }}
            >
              Hapus
            </button>
          )}
        </div>
        <ErrorHint message={errorMsg} />
      </div>

      <div className="px-5 mt-auto pb-10 flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={!ready || isPending}
          className="w-full py-4"
          style={{ border: "none", background: ready ? "var(--kas-ink)" : "var(--kas-line)", color: ready ? "var(--kas-paper)" : "var(--kas-ink-3)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: ready ? "pointer" : "default" }}
        >
          {isPending ? "Mengirim OTP…" : "Kirim Kode Verifikasi →"}
        </button>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}
