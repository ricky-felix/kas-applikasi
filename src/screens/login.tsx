"use client";
import { useState, useTransition } from "react";
import { login } from "@/app/actions";
import { type Step, type Gender, type Jabatan, CODE_LEN } from "@/components/login/types";
import { AuthShell } from "@/components/login/auth-shell";
import { StepPhone } from "@/components/login/step-choose";
import { StepLoginPin } from "@/components/login/step-login-pin";
import { StepRegPhone } from "@/components/login/step-reg-phone";
import { StepRegPin } from "@/components/login/step-reg-pin";
import { StepRegProfile } from "@/components/login/step-reg-profile";
import { StepRegPending } from "@/components/login/step-reg-pending";

export default function LoginScreen() {
  // ── login flow ────────────────────────────────────────────────────────────
  const [step, setStep]             = useState<Step>("phone");
  const [phone, setPhone]           = useState("");
  const [pin, setPin]               = useState("");
  const [shake, setShake]           = useState(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── registration flow state ───────────────────────────────────────────────
  const [regPhone, setRegPhone]               = useState("");
  const [regPin, setRegPin]                   = useState("");
  const [regRemember, setRegRemember]         = useState(false);
  const [regName, setRegName]                 = useState("");
  const [regGender, setRegGender]             = useState<Gender | null>(null);
  const [regJabatan, setRegJabatan]           = useState<Jabatan | null>(null);
  const [regPhoto, setRegPhoto]               = useState<string | null>(null);
  const [regShake, setRegShake]               = useState(false);
  const [regError, setRegError]               = useState<string | null>(null);
  const [regPending, startRegTransition]      = useTransition();

  // ── helpers ───────────────────────────────────────────────────────────────
  const triggerShake = (msg?: string) => {
    setShake(true);
    setErrorMsg(msg ?? null);
    setTimeout(() => setShake(false), 400);
  };

  const triggerRegShake = (msg?: string) => {
    setRegShake(true);
    setRegError(msg ?? null);
    setTimeout(() => setRegShake(false), 400);
  };

  const resetAll = () => {
    setStep("phone");
    setPhone(""); setPin(""); setShake(false); setErrorMsg(null); setRememberMe(false);
    setRegPhone(""); setRegPin(""); setRegRemember(false);
    setRegName(""); setRegGender(null); setRegJabatan(null);
    setRegPhoto(null); setRegShake(false); setRegError(null);
  };

  // ── login handlers ────────────────────────────────────────────────────────
  const doLogin = (p: string, pinVal: string, remember: boolean) => {
    startTransition(async () => {
      const res = await login(p, pinVal);
      if (res?.error) {
        triggerShake("Nomor HP atau kode akses salah.");
        setTimeout(() => setPin(""), 400);
      } else if (remember) {
        try {
          localStorage.setItem("kas-saved-phone", p);
          localStorage.setItem("kas-saved-pin", pinVal);
        } catch {}
      }
    });
  };

  const handlePhoneSubmit = (p: string) => {
    setPhone(p); setPin(""); setErrorMsg(null); setStep("pin");
  };

  const handlePinChange = (v: string) => {
    setPin(v); setErrorMsg(null);
    if (v.length === CODE_LEN) doLogin(phone, v, rememberMe);
  };

  const handleSavedLogin = (savedPhone: string, savedPin: string) => {
    setPhone(savedPhone); setPin(savedPin); setStep("pin");
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
    setPhone(p); setPin(quickPin); setStep("pin");
    startTransition(async () => {
      const res = await login(p, quickPin);
      if (res?.error) triggerShake("Nomor HP atau kode akses salah.");
    });
  };

  // ── registration handlers ─────────────────────────────────────────────────
  const handleRegPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 14));
    setRegError(null);
  };

  const handleRegPhoneSubmit = () => {
    if (regPhone.length < 10) { triggerRegShake("Nomor HP minimal 10 digit."); return; }
    setRegError(null); setStep("reg-pin");
  };

  const handleRegPinSubmit = () => {
    if (regPin.length !== CODE_LEN) { triggerRegShake("Kode akses harus 6 karakter."); return; }
    setRegError(null); setStep("reg-profile");
  };

  const handleRegProfileSubmit = () => {
    if (!regName.trim()) { setRegError("Nama tidak boleh kosong."); return; }
    if (!regGender) { setRegError("Pilih jenis kelamin."); return; }
    if (!regJabatan) { setRegError("Pilih jabatan."); return; }
    setRegError(null);
    startRegTransition(async () => {
      await new Promise((r) => setTimeout(r, 800));
      setStep("reg-pending");
    });
  };

  return (
    <AuthShell step={step}>
      {step === "phone" && (
        <StepPhone
          onSubmit={handlePhoneSubmit}
          onSavedLogin={handleSavedLogin}
          onQuickLogin={handleQuickLogin}
          onRegister={() => { setRegPhone(""); setRegError(null); setStep("reg-phone"); }}
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

      {step === "reg-phone" && (
        <StepRegPhone
          phone={regPhone}
          shake={regShake}
          errorMsg={regError}
          isPending={regPending}
          onChange={handleRegPhoneChange}
          onSubmit={handleRegPhoneSubmit}
          onBack={() => setStep("phone")}
        />
      )}

      {step === "reg-pin" && (
        <StepRegPin
          pin={regPin}
          remember={regRemember}
          shake={regShake}
          errorMsg={regError}
          isPending={regPending}
          onPinChange={(v) => { setRegPin(v); setRegError(null); }}
          onRememberChange={setRegRemember}
          onSubmit={handleRegPinSubmit}
          onBack={() => { setRegPin(""); setStep("reg-phone"); }}
        />
      )}

      {step === "reg-profile" && (
        <StepRegProfile
          photo={regPhoto}
          name={regName}
          gender={regGender}
          jabatan={regJabatan}
          errorMsg={regError}
          isPending={regPending}
          onPhotoChange={setRegPhoto}
          onNameChange={(v) => { setRegName(v); setRegError(null); }}
          onGenderChange={(v) => { setRegGender(v); setRegError(null); }}
          onJabatanChange={(v) => { setRegJabatan(v); setRegError(null); }}
          onSubmit={handleRegProfileSubmit}
          onBack={() => setStep("reg-pin")}
        />
      )}

      {step === "reg-pending" && (
        <StepRegPending
          phone={regPhone}
          name={regName}
          onReset={resetAll}
        />
      )}
    </AuthShell>
  );
}
