"use client";
import { useState, useTransition } from "react";
import { login } from "@/app/actions";
import { type Step, CODE_LEN } from "@/components/login/types";
import { AuthShell } from "@/components/login/auth-shell";
import { StepPhone } from "@/components/login/step-choose";
import { StepLoginPin } from "@/components/login/step-login-pin";

export default function LoginScreen() {
  const [step, setStep]         = useState<Step>("phone");
  const [phone, setPhone]       = useState("");
  const [pin, setPin]           = useState("");
  const [shake, setShake]       = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPending, startTransition] = useTransition();

  const triggerShake = (msg?: string) => {
    setShake(true);
    setErrorMsg(msg ?? null);
    setTimeout(() => setShake(false), 400);
  };

  const doLogin = (p: string, pin: string, remember: boolean) => {
    startTransition(async () => {
      const res = await login(p, pin);
      if (res?.error) {
        triggerShake("Nomor HP atau kode akses salah.");
        setTimeout(() => setPin(""), 400);
      } else if (remember) {
        try {
          localStorage.setItem("kas-saved-phone", p);
          localStorage.setItem("kas-saved-pin", pin);
        } catch {}
      }
    });
  };

  const handlePhoneSubmit = (p: string) => {
    setPhone(p);
    setPin("");
    setErrorMsg(null);
    setStep("pin");
  };

  const handlePinChange = (v: string) => {
    setPin(v);
    setErrorMsg(null);
    if (v.length === CODE_LEN) {
      doLogin(phone, v, rememberMe);
    }
  };

  const handleSavedLogin = (savedPhone: string, savedPin: string) => {
    setPhone(savedPhone);
    setPin(savedPin);
    setStep("pin");
    startTransition(async () => {
      const res = await login(savedPhone, savedPin);
      if (res?.error) {
        try { localStorage.removeItem("kas-saved-phone"); localStorage.removeItem("kas-saved-pin"); } catch {}
        triggerShake("Sesi kadaluarsa. Masuk kembali.");
        setStep("phone");
      }
    });
  };

  const handleQuickLogin = (p: string, quickPin: string) => {
    setPhone(p);
    setPin(quickPin);
    setStep("pin");
    startTransition(async () => {
      const res = await login(p, quickPin);
      if (res?.error) triggerShake("Nomor HP atau kode akses salah.");
    });
  };

  return (
    <AuthShell step={step}>
      {step === "phone" && (
        <StepPhone
          onSubmit={handlePhoneSubmit}
          onSavedLogin={handleSavedLogin}
          onQuickLogin={handleQuickLogin}
        />
      )}
      {step === "pin" && (
        <StepLoginPin
          phone={phone}
          pin={pin}
          shake={shake}
          errorMsg={errorMsg}
          isPending={isPending}
          rememberMe={rememberMe}
          onRememberMe={setRememberMe}
          onChange={handlePinChange}
          onBack={() => { setStep("phone"); setPin(""); setErrorMsg(null); }}
        />
      )}
    </AuthShell>
  );
}
