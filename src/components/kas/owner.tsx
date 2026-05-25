"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, TODAY_SHORT, fmtIDRshort } from "@/lib/data";
import { Account } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel, MobileTopBar } from "./ui";

type Sheet = "proyek" | "bayar" | "pekerja" | "create" | null;

export default function OwnerDashboard({ onLogout }: { onLogout: () => void }) {
  const [sheet, setSheet] = useState<Sheet>(null);

  const activeProjects = PROJECTS.filter((p) => p.status === "Active");
  const outstandingTotal = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersToday = WORKERS.filter((w) => activeProjects.some((p) => p.assigned.includes(w.id)));

  const cards = [
    { key: "proyek", no: "01", label: "Proyek aktif hari ini", value: String(activeProjects.length).padStart(2, "0"), sub: `dari ${PROJECTS.length} total`, accent: false },
    { key: "bayar",  no: "02", label: "Belum dibayar", value: fmtIDRshort(outstandingTotal), sub: "2 termin pending", accent: true },
    { key: "pekerja",no: "03", label: "Pekerja hadir", value: String(workersToday.length).padStart(2, "0"), sub: `dari ${WORKERS.length} pekerja`, accent: false },
  ] as const;

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "var(--kas-paper)", color: "var(--kas-ink)" }}>
      <MobileTopBar tabLabel="BAPAK · OWNER">
        <button
          onClick={onLogout}
          style={{ border: "1px solid var(--kas-line)", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 8px" }}
        >
          Keluar
        </button>
      </MobileTopBar>

      <div className="px-5 pt-5 pb-1">
        <Kicker no="00" label={TODAY_SHORT} />
        <DisplayHeading size={30}>
          Tiga angka,<br /><em>satu pagi.</em>
        </DisplayHeading>
      </div>

      <div className="px-5 pt-4 pb-2 flex flex-col">
        {cards.map((c, i) => (
          <button
            key={c.key}
            onClick={() => setSheet(c.key)}
            className="grid items-center gap-3.5 text-left cursor-pointer"
            style={{
              gridTemplateColumns: "auto 1fr auto",
              border: "none",
              background: "transparent",
              borderTop: i === 0 ? "1px solid var(--kas-ink)" : "1px solid var(--kas-line)",
              borderBottom: i === cards.length - 1 ? "1px solid var(--kas-ink)" : "none",
              padding: "18px 0",
            }}
          >
            <MonoLabel size={11}>{c.no}</MonoLabel>
            <div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "var(--kas-ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 500, fontSize: 42, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 4, color: c.accent ? "var(--kas-orange)" : "var(--kas-ink)" }}>{c.value}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 6, letterSpacing: "0.08em" }}>{c.sub}</div>
            </div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, color: "var(--kas-ink)", lineHeight: 1 }}>→</div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-end px-5 pb-4 gap-3">
        <button
          onClick={() => setSheet("create")}
          className="w-full flex items-center justify-between px-3.5 py-3.5"
          style={{ border: "1px dashed var(--kas-ink)", background: "var(--kas-paper)", cursor: "pointer" }}
        >
          <div className="flex items-center gap-2.5">
            <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, lineHeight: 0.5 }}>+</span>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600 }}>Buat akun baru</span>
          </div>
          <MonoLabel size={9}>Administrasi / Pekerja</MonoLabel>
        </button>
        <div className="text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
          Tap angka untuk lihat detail.
        </div>
      </div>

      {sheet && (
        <>
          <div onClick={() => setSheet(null)} className="absolute inset-0" style={{ background: "rgba(14,12,9,0.4)", zIndex: 10 }} />
          <div
            className="absolute left-0 right-0 bottom-0 flex flex-col animate-slide-up"
            style={{ background: "var(--kas-paper)", borderTop: "1px solid var(--kas-ink)", maxHeight: "80%", zIndex: 20 }}
          >
            <div className="flex justify-between items-center px-5 py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>
                {sheet === "create" ? "— · PENDAFTARAN" : `${cards.find((c) => c.key === sheet)?.no} · DETAIL`}
              </MonoLabel>
              <button onClick={() => setSheet(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto no-scrollbar">
              <DisplayHeading size={26}>
                {sheet === "proyek" && <>Proyek aktif,<br /><em>hari ini.</em></>}
                {sheet === "bayar"  && <>Tagihan,<br /><em>belum lunas.</em></>}
                {sheet === "pekerja" && <>Pekerja,<br /><em>di lapangan.</em></>}
                {sheet === "create" && <>Buat akun,<br /><em>baru.</em></>}
              </DisplayHeading>

              {sheet === "proyek" && (
                <div className="mt-4">
                  {activeProjects.map((p, i) => (
                    <div key={p.id} className="grid gap-3 py-3.5" style={{ gridTemplateColumns: "auto 1fr auto", borderTop: "1px solid var(--kas-line-2)" }}>
                      <MonoLabel size={10}>{String(i + 1).padStart(2, "0")}</MonoLabel>
                      <div>
                        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.name}</div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.progress}%</div>
                      </div>
                      <div className="relative self-center" style={{ width: 48, height: 6, background: "var(--kas-line-2)" }}>
                        <div className="absolute inset-y-0 left-0" style={{ width: `${p.progress}%`, background: "var(--kas-ink)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sheet === "bayar" && (
                <div className="mt-4">
                  {PROJECTS.filter((p) => p.contractValue - p.paid > 0).map((p) => (
                    <div key={p.id} className="py-3.5" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
                      <div className="flex justify-between items-baseline">
                        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.client.name}</div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-orange)", fontWeight: 600 }}>{fmtIDRshort(p.contractValue - p.paid)}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.name}</div>
                      <button className="mt-2.5 flex items-center gap-2 px-3.5 py-2" style={{ border: "1px solid var(--kas-ink)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                        <WhatsAppIcon />
                        Tagih via WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {sheet === "pekerja" && (
                <div className="mt-4">
                  {workersToday.map((w) => {
                    const p = activeProjects.find((pr) => pr.assigned.includes(w.id));
                    return (
                      <div key={w.id} className="grid gap-3 items-center py-3.5" style={{ gridTemplateColumns: "32px 1fr auto", borderTop: "1px solid var(--kas-line-2)" }}>
                        <div className="grid place-items-center" style={{ width: 32, height: 32, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500 }}>{w.short}</div>
                        <div>
                          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{w.name}</div>
                          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em" }}>{p?.address}</div>
                        </div>
                        <span className="px-2 py-1" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.18em", color: "var(--kas-ink)", background: "var(--kas-orange-soft)" }}>HADIR</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {sheet === "create" && <OwnerCreateSheet onDone={() => setSheet(null)} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OwnerCreateSheet({ onDone }: { onDone: () => void }) {
  const [role, setRole] = useState<"admin" | "worker" | null>(null);

  if (!role) {
    return (
      <div className="mt-4">
        <MonoLabel size={10}>Pilih peran yang akan dibuat</MonoLabel>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { k: "admin" as const, l: "Administrasi", sub: "Staf kantor, akses penuh operasional", n: "I" },
            { k: "worker" as const, l: "Pekerja", sub: "Tukang lapangan, hanya absensi", n: "II" },
          ].map((opt) => (
            <button
              key={opt.k}
              onClick={() => setRole(opt.k)}
              className="w-full grid gap-3 items-center text-left p-4"
              style={{ gridTemplateColumns: "40px 1fr auto", border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", cursor: "pointer" }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontStyle: "italic", color: "var(--kas-ink-3)" }}>{opt.n}</span>
              <div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{opt.l}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.06em" }}>{opt.sub}</div>
              </div>
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, color: "var(--kas-ink)" }}>→</span>
            </button>
          ))}
        </div>
        <div className="mt-2 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--kas-ink-3)", lineHeight: 1.6, textTransform: "uppercase" }}>
          Bapak dapat membuat Staf Administrasi dan Pekerja. Super Admin yang membuat Owner lain.
        </div>
      </div>
    );
  }

  const label = role === "admin" ? "Administrasi" : "Pekerja";
  const fields = [
    { l: "Nama lengkap", ph: "Contoh: Bu Sari" },
    { l: "Nomor HP", ph: "0812 6011 0000" },
    { l: "Kode akses (6)", ph: "ABC123" },
    ...(role === "worker" ? [{ l: "Tarif harian (Rp)", ph: "200.000" }] : []),
  ];

  return (
    <div className="mt-4">
      <button onClick={() => setRole(null)} style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 10px" }}>← Ganti peran</button>
      <DisplayHeading size={24}>Form <em>{label}.</em></DisplayHeading>
      <div className="mt-3 flex flex-col gap-2.5">
        {fields.map((f, i) => (
          <div key={i}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>{f.l}</div>
            <input
              placeholder={f.ph}
              className="w-full px-3.5 py-3"
              style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14 }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onDone}
        className="w-full mt-4 py-3.5"
        style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
      >
        Buat {label}
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4zm-4.5 16a11.7 11.7 0 01-6-1.6l-.4-.3-3.7 1 1-3.6-.3-.4A11.6 11.6 0 1115.5 20z" />
    </svg>
  );
}
