import { ACCOUNTS } from "@/lib/data";

export function StepChoose({
  onLogin,
  onRegister,
  onQuickLogin,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onQuickLogin: (phone: string) => void;
}) {
  return (
    <div className="flex flex-col flex-1 px-5 pt-6 pb-10">
      <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
        Selamat<br /><em>datang.</em>
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 10 }}>
        Pilih opsi untuk melanjutkan
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={onLogin}
          className="w-full py-5 flex flex-col items-start px-5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5 }}>01</span>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 400, marginTop: 2 }}>Masuk <em>→</em></span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginTop: 4 }}>Pakai kode akses</span>
        </button>

        <button
          onClick={onRegister}
          className="w-full py-5 flex flex-col items-start px-5"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", color: "var(--kas-ink)", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>02</span>
          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 26, fontWeight: 400, marginTop: 2 }}>Daftar <em>→</em></span>
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginTop: 4 }}>Akun baru · verifikasi HP</span>
        </button>

        <div className="mt-2">
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6 }}>
            Demo · pilih cepat
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { phone: ACCOUNTS[0].phone, label: "Super",   pin: ACCOUNTS[0].pin },
              { phone: ACCOUNTS[1].phone, label: "Bapak",   pin: ACCOUNTS[1].pin },
              { phone: ACCOUNTS[2].phone, label: "Admin",   pin: ACCOUNTS[2].pin },
              { phone: ACCOUNTS[3].phone, label: "Pekerja", pin: ACCOUNTS[3].pin },
            ].map((item) => (
              <button
                key={item.phone}
                onClick={() => onQuickLogin(item.phone)}
                style={{ border: "1px solid var(--kas-line)", background: "var(--kas-paper)", padding: "6px 10px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-2)", cursor: "pointer", textTransform: "uppercase" }}
              >
                {item.label} · {item.pin}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
