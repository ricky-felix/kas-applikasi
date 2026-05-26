"use client";
import { WORKERS, TODAY_SHORT, fmtIDR } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "../ui";

export default function ProfileTab({
  me,
  onLogout,
}: {
  me: typeof WORKERS[0];
  onLogout: () => void;
}) {
  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="01" label="AKUN ANDA" />
      <DisplayHeading size={28}>
        Profil,<br /><em>{me.name.split(" ").slice(-1)[0]}.</em>
      </DisplayHeading>

      <div className="mt-4 flex items-center gap-3.5 px-4 py-4" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
        <div
          className="grid place-items-center"
          style={{ width: 52, height: 52, background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500 }}
        >
          {me.short}
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 1.1 }}>{me.name}</div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{me.role}</div>
        </div>
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-line)" }}>
        {[
          { l: "Nomor HP",    v: me.phone },
          { l: "Tarif Harian", v: fmtIDR(me.rate) },
          { l: "Peran",        v: "Pekerja Lapangan" },
        ].map((r, i) => (
          <div key={i} className="grid gap-3 py-3" style={{ gridTemplateColumns: "110px 1fr", borderBottom: "1px solid var(--kas-line-2)" }}>
            <MonoLabel size={10}>{r.l}</MonoLabel>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onLogout}
          className="w-full py-3.5"
          style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Keluar
        </button>
      </div>

      <div className="mt-5 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Tauke v0.1 · {TODAY_SHORT}
      </div>
    </div>
  );
}
