"use client";
import { useState, useCallback, useTransition } from "react";
import { ACCOUNTS } from "@/lib/data";
import { loginWithPin, registerSendOtp, registerVerifyOtp, registerSetPin } from "@/app/actions";
import { type Step, CODE_LEN } from "@/components/login/types";
import { AuthShell } from "@/components/login/auth-shell";
import { StepChoose } from "@/components/login/step-choose";
import { StepLoginPin } from "@/components/login/step-login-pin";
import { StepRegPhone } from "@/components/login/step-reg-phone";
import { StepRegOtp } from "@/components/login/step-reg-otp";
import { StepRegPin } from "@/components/login/step-reg-pin";

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const triggerShake = (msg?: string) => {
    setShake(true);
    setErrorMsg(msg ?? null);
    setTimeout(() => setShake(false), 400);
  };

  // ── Login ────────────────────────────────────────────────────────────────

  const handlePinChange = (v: string) => {
    setPin(v);
    setErrorMsg(null);
    if (v.length === CODE_LEN) {
      startTransition(async () => {
        const res = await loginWithPin(v);
        if (res?.error) { triggerShake(res.error); setTimeout(() => setPin(""), 400); }
      });
    }
  };

  const quickLogin = (p: string) => {
    const a = ACCOUNTS.find((x) => x.phone === p);
    if (!a) return;
    setStep("login-pin");
    setPin(a.pin);
    startTransition(async () => {
      const res = await loginWithPin(a.pin);
      if (res?.error) triggerShake(res.error);
    });
  };

  // ── Register ─────────────────────────────────────────────────────────────

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 12));
    setErrorMsg(null);
  };

  const submitPhone = useCallback(() => {
    startTransition(async () => {
      await registerSendOtp(phone);
      setOtp("");
      setStep("reg-otp");
    });
  }, [phone]);

  const handleOtpChange = (v: string) => {
    setOtp(v);
    setErrorMsg(null);
    if (v.length === CODE_LEN) {
      startTransition(async () => {
        await registerVerifyOtp(phone, v);
        setPin("");
        setName("");
        setStep("reg-pin");
      });
    }
  };

  const submitRegister = () => {
    if (!name.trim()) { triggerShake("Isi nama dulu."); return; }
    if (pin.length < CODE_LEN) { triggerShake("Kode akses harus 6 karakter."); return; }
    startTransition(async () => {
      const res = await registerSetPin(phone, name, pin);
      if (res?.error) triggerShake(res.error);
    });
  };

  return (
    <AuthShell step={step}>
      {step === "choose" && (
        <StepChoose
          onLogin={() => { setPin(""); setStep("login-pin"); }}
          onRegister={() => { setPhone(""); setStep("reg-phone"); }}
          onQuickLogin={quickLogin}
        />
      )}
      {step === "login-pin" && (
        <StepLoginPin
          pin={pin}
          shake={shake}
          errorMsg={errorMsg}
          isPending={isPending}
          onChange={handlePinChange}
          onBack={() => setStep("choose")}
        />
      )}
      {step === "reg-phone" && (
        <StepRegPhone
          phone={phone}
          shake={shake}
          errorMsg={errorMsg}
          isPending={isPending}
          onChange={handlePhoneChange}
          onSubmit={submitPhone}
          onBack={() => setStep("choose")}
        />
      )}
      {step === "reg-otp" && (
        <StepRegOtp
          phone={phone}
          otp={otp}
          shake={shake}
          errorMsg={errorMsg}
          isPending={isPending}
          onChange={handleOtpChange}
          onBack={() => { setStep("reg-phone"); setOtp(""); }}
        />
      )}
      {step === "reg-pin" && (
        <StepRegPin
          name={name}
          pin={pin}
          shake={shake}
          errorMsg={errorMsg}
          isPending={isPending}
          onNameChange={(v) => { setName(v); setErrorMsg(null); }}
          onPinChange={(v) => { setPin(v); setErrorMsg(null); }}
          onSubmit={submitRegister}
          onBack={() => setStep("choose")}
        />
      )}
    </AuthShell>
  );
}
