"use client";
import { useState } from "react";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

type SessionEntry  = { in: string; out: string; isLembur?: boolean; lemburHours?: number };
type SelfieStamp   = { time: string; kind: "masuk" | "lembur" };
type LaporanLog    = { note: string; photos: number };
type DayEntry      = {
  day: number;
  dayName: string;
  project: string;
  projCode: string;
  status: "Hadir" | "Setengah Hari" | "Tidak Hadir";
  sessions: SessionEntry[];
  selfies?: SelfieStamp[];
  laporan?: LaporanLog;
};
type MonthData     = { monthKey: string; label: string; year: number; month: number; days: DayEntry[] };

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const ALL_DATA: MonthData[] = [
  {
    monthKey: "2026-04", label: "April 2026", year: 2026, month: 4,
    days: [
      { day: 28, dayName: "Selasa",  project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "07:55", out: "17:05" }],
        selfies: [{ time: "07:55", kind: "masuk" }] },
      { day: 27, dayName: "Senin",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "08:00", out: "17:00" }, { in: "18:00", out: "20:00", isLembur: true, lemburHours: 2 }],
        selfies: [{ time: "08:00", kind: "masuk" }, { time: "18:00", kind: "lembur" }] },
      { day: 26, dayName: "Minggu",  project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Tidak Hadir",   sessions: [] },
      { day: 25, dayName: "Sabtu",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "08:10", out: "16:45" }],
        selfies: [{ time: "08:10", kind: "masuk" }] },
      { day: 24, dayName: "Jumat",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "07:48", out: "17:10" }],
        selfies: [{ time: "07:48", kind: "masuk" }] },
      { day: 23, dayName: "Kamis",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Setengah Hari", sessions: [{ in: "08:05", out: "12:00" }],
        selfies: [{ time: "08:05", kind: "masuk" }] },
      { day: 22, dayName: "Rabu",    project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "07:50", out: "17:00" }],
        selfies: [{ time: "07:50", kind: "masuk" }] },
      { day: 21, dayName: "Selasa",  project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "07:55", out: "17:05" }],
        selfies: [{ time: "07:55", kind: "masuk" }] },
      { day: 19, dayName: "Minggu",  project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Tidak Hadir",   sessions: [] },
      { day: 18, dayName: "Sabtu",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "08:00", out: "16:55" }],
        selfies: [{ time: "08:00", kind: "masuk" }] },
      { day: 17, dayName: "Jumat",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "07:45", out: "17:10" }],
        selfies: [{ time: "07:45", kind: "masuk" }] },
      { day: 16, dayName: "Kamis",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",         sessions: [{ in: "08:00", out: "17:00" }, { in: "18:00", out: "19:00", isLembur: true, lemburHours: 1 }],
        selfies: [{ time: "08:00", kind: "masuk" }, { time: "18:00", kind: "lembur" }] },
    ],
  },
  {
    monthKey: "2026-05", label: "Mei 2026", year: 2026, month: 5,
    days: [
      { day: 24, dayName: "Senin",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",
        sessions: [{ in: "07:52", out: "17:10" }],
        selfies: [{ time: "07:52", kind: "masuk" }],
        laporan: { note: "Pemasangan bekisting kolom lantai 2 selesai pada sisi barat. Pengecoran dijadwalkan besok pagi.", photos: 3 } },
      { day: 23, dayName: "Sabtu",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",
        sessions: [{ in: "08:01", out: "16:55" }, { in: "18:00", out: "20:00", isLembur: true, lemburHours: 2 }],
        selfies: [{ time: "08:01", kind: "masuk" }, { time: "18:00", kind: "lembur" }] },
      { day: 22, dayName: "Jumat",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",
        sessions: [{ in: "07:48", out: "17:05" }],
        selfies: [{ time: "07:48", kind: "masuk" }],
        laporan: { note: "Pemasangan besi tulangan sloof sudah 80% di area blok C5. Material sisa sudah dipindahkan ke gudang.", photos: 2 } },
      { day: 21, dayName: "Kamis",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Setengah Hari",
        sessions: [{ in: "08:10", out: "12:30" }],
        selfies: [{ time: "08:10", kind: "masuk" }] },
      { day: 20, dayName: "Rabu",    project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",
        sessions: [{ in: "07:55", out: "17:00" }, { in: "18:30", out: "21:30", isLembur: true, lemburHours: 3 }],
        selfies: [{ time: "07:55", kind: "masuk" }, { time: "18:30", kind: "lembur" }],
        laporan: { note: "Pengecoran pondasi titik D7–D9 berjalan lancar. Cuaca cerah, kondisi campuran beton sesuai spesifikasi.", photos: 3 } },
      { day: 19, dayName: "Selasa",  project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Tidak Hadir",   sessions: [] },
      { day: 18, dayName: "Senin",   project: "Cemara Asri Blok C5", projCode: "KAS-2026-014", status: "Hadir",
        sessions: [{ in: "07:50", out: "17:10" }, { in: "18:00", out: "19:00", isLembur: true, lemburHours: 1 }],
        selfies: [{ time: "07:50", kind: "masuk" }, { time: "18:00", kind: "lembur" }],
        laporan: { note: "Perapian galian tanah di sekitar pondasi selesai. Tim akan mulai pemasangan bekisting esok hari.", photos: 1 } },
      { day: 16, dayName: "Sabtu",   project: "Jl. S. Parman",       projCode: "KAS-2026-013", status: "Hadir",
        sessions: [{ in: "08:05", out: "17:00" }],
        selfies: [{ time: "08:05", kind: "masuk" }] },
      { day: 15, dayName: "Jumat",   project: "Jl. S. Parman",       projCode: "KAS-2026-013", status: "Hadir",
        sessions: [{ in: "07:45", out: "16:50" }],
        selfies: [{ time: "07:45", kind: "masuk" }],
        laporan: { note: "Pemasangan rangka atap baja ringan di bagian tengah gedung sudah mencapai 60% progres.", photos: 2 } },
      { day: 14, dayName: "Kamis",   project: "Jl. S. Parman",       projCode: "KAS-2026-013", status: "Hadir",
        sessions: [{ in: "08:00", out: "17:20" }, { in: "18:00", out: "20:00", isLembur: true, lemburHours: 2 }],
        selfies: [{ time: "08:00", kind: "masuk" }, { time: "18:00", kind: "lembur" }] },
      { day: 12, dayName: "Selasa",  project: "Jl. S. Parman",       projCode: "KAS-2026-013", status: "Hadir",
        sessions: [{ in: "07:55", out: "17:00" }],
        selfies: [{ time: "07:55", kind: "masuk" }],
        laporan: { note: "Pengecekan elevasi lantai kerja di zona A dan B telah dilakukan. Hasil sesuai gambar kerja.", photos: 1 } },
      { day: 11, dayName: "Senin",   project: "Jl. S. Parman",       projCode: "KAS-2026-013", status: "Tidak Hadir",   sessions: [] },
    ],
  },
];

const STATUS_STYLE: Record<DayEntry["status"], { bg: string; color: string }> = {
  "Hadir":        { bg: "var(--kas-cobalt-soft)",  color: "var(--kas-cobalt-ink)" },
  "Setengah Hari":{ bg: "var(--kas-ochre-soft)",   color: "var(--kas-ochre-ink)"  },
  "Tidak Hadir":  { bg: "var(--kas-paper-2)",      color: "var(--kas-ink-3)"      },
};

function weekOf(day: number) { return Math.ceil(day / 7); }

function weekLabel(w: number, month: MonthData) {
  const start = (w - 1) * 7 + 1;
  const end   = Math.min(w * 7, new Date(month.year, month.month, 0).getDate());
  return `Minggu ${w}  ·  ${start}–${end} ${BULAN[month.month - 1]}`;
}

export default function HistoryTab() {
  const [monthKey, setMonthKey]             = useState(ALL_DATA[ALL_DATA.length - 1].monthKey);
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());
  const [collapsedDays, setCollapsedDays]   = useState<Set<string>>(new Set());

  const toggleWeek = (w: number) =>
    setCollapsedWeeks((p) => { const s = new Set(p); s.has(w) ? s.delete(w) : s.add(w); return s; });
  const toggleDay = (k: string) =>
    setCollapsedDays((p) => { const s = new Set(p); s.has(k) ? s.delete(k) : s.add(k); return s; });

  const month = ALL_DATA.find((m) => m.monthKey === monthKey) ?? ALL_DATA[ALL_DATA.length - 1];

  const hadirCount   = month.days.filter((d) => d.status !== "Tidak Hadir").length;
  const lemburHours  = month.days.flatMap((d) => d.sessions).filter((s) => s.isLembur).reduce((s, x) => s + (x.lemburHours ?? 0), 0);

  // Group days into weeks, sorted descending within each week
  const weeks = [1, 2, 3, 4, 5].map((w) => ({
    week:  w,
    label: weekLabel(w, month),
    days:  month.days.filter((d) => weekOf(d.day) === w).sort((a, b) => b.day - a.day),
  })).filter((w) => w.days.length > 0);

  return (
    <div className="px-5 pt-4 pb-6">
      <Kicker no="03" label="RIWAYAT KEHADIRAN" />
      <DisplayHeading size={28}>Riwayat,<br /><em>kehadiran.</em></DisplayHeading>

      {/* ── Month dropdown ───────────────────────────────────────────────── */}
      <div className="relative mt-4">
        <select
          value={monthKey}
          onChange={(e) => { setMonthKey(e.target.value); setCollapsedWeeks(new Set()); setCollapsedDays(new Set()); }}
          className="w-full appearance-none px-3.5 py-3 pr-8"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-newsreader), serif", fontSize: 18, color: "var(--kas-ink)", cursor: "pointer", outline: "none" }}
        >
          {ALL_DATA.map((m) => (
            <option key={m.monthKey} value={m.monthKey}>{m.label}</option>
          ))}
        </select>
        <span className="absolute right-3.5 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}>▾</span>
      </div>

      {/* ── Monthly summary ──────────────────────────────────────────────── */}
      <div className="grid mt-3" style={{ gridTemplateColumns: "1fr 1fr", border: "1px solid var(--kas-ink)" }}>
        <div className="px-3.5 py-3" style={{ borderRight: "1px solid var(--kas-line)" }}>
          <MonoLabel size={8}>Hari Hadir</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, marginTop: 3, lineHeight: 1 }}>{hadirCount}</div>
        </div>
        <div className="px-3.5 py-3">
          <MonoLabel size={8}>Total Lembur</MonoLabel>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, marginTop: 3, lineHeight: 1, color: lemburHours > 0 ? "var(--kas-ochre)" : "var(--kas-ink-4)" }}>
            {lemburHours}
            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginLeft: 4 }}>JAM</span>
          </div>
        </div>
      </div>

      {/* ── Week sections ────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-col gap-3">
        {weeks.length === 0 ? (
          <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Tidak ada data untuk bulan ini
          </div>
        ) : weeks.map(({ week, label, days }) => {
          const isOpen      = !collapsedWeeks.has(week);
          const weekHadir   = days.filter((d) => d.status !== "Tidak Hadir").length;
          const weekLembur  = days.flatMap((d) => d.sessions).filter((s) => s.isLembur).reduce((s, x) => s + (x.lemburHours ?? 0), 0);

          return (
            <div key={week} style={{ border: "1px solid var(--kas-line)" }}>
              {/* Week header */}
              <button
                type="button"
                onClick={() => toggleWeek(week)}
                className="w-full flex items-center justify-between px-4 py-3"
                style={{ border: "none", background: isOpen ? "var(--kas-ink)" : "var(--kas-paper-2)", color: isOpen ? "var(--kas-paper)" : "var(--kas-ink)", cursor: "pointer", textAlign: "left" }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", opacity: isOpen ? 0.7 : 1, color: isOpen ? "inherit" : "var(--kas-ink-3)", marginBottom: 3 }}>
                    {label}
                  </div>
                  <div className="flex items-center gap-3" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", opacity: isOpen ? 0.65 : 1, color: isOpen ? "inherit" : "var(--kas-ink-3)" }}>
                    <span>{weekHadir} hari hadir</span>
                    {weekLembur > 0 && <span style={{ color: isOpen ? "rgba(255,255,255,0.75)" : "var(--kas-ochre)" }}>{weekLembur}j lembur</span>}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, opacity: 0.6 }}>
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>

              {/* Days */}
              {isOpen && (
                <div>
                  {days.map((day) => {
                    const st      = STATUS_STYLE[day.status];
                    const dayKey  = `${monthKey}-${week}-${day.day}`;
                    const dayOpen = !collapsedDays.has(dayKey);

                    return (
                      <div key={day.day} style={{ borderTop: "1px solid var(--kas-line-2)" }}>
                        {/* Day row */}
                        <button
                          type="button"
                          onClick={() => day.sessions.length > 0 && toggleDay(dayKey)}
                          className="w-full flex items-center justify-between px-4 py-2.5 gap-3"
                          style={{ border: "none", background: "transparent", cursor: day.sessions.length > 0 ? "pointer" : "default", textAlign: "left" }}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.08em", flexShrink: 0 }}>
                              {day.dayName.slice(0, 3).toUpperCase()} {String(day.day).padStart(2, "0")}
                            </span>
                            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {day.project}
                            </span>
                            {day.sessions.length > 0 && (
                              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, color: "var(--kas-ink-4)", flexShrink: 0 }}>
                                {dayOpen ? "▾" : "▸"}
                              </span>
                            )}
                          </div>
                          <span
                            className="px-1.5 py-0.5 flex-shrink-0"
                            style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", background: st.bg, color: st.color, border: "1px solid var(--kas-line)" }}
                          >
                            {day.status}
                          </span>
                        </button>

                        {/* Expanded day content */}
                        {dayOpen && day.sessions.length > 0 && (
                          <div>
                            {/* Sessions */}
                            <div className="pb-3 flex flex-col gap-1.5 pl-4 pr-4">
                              {day.sessions.map((s, si) => (
                                <div key={si} className="flex items-center gap-3">
                                  <div className="flex-shrink-0" style={{ width: 3, alignSelf: "stretch", minHeight: 20, background: s.isLembur ? "var(--kas-ochre)" : "var(--kas-cobalt)" }} />
                                  <div className="flex items-center gap-2 flex-1">
                                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, letterSpacing: "0.04em", color: "var(--kas-ink-2)", fontWeight: 500 }}>{s.in}</span>
                                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)" }}>→</span>
                                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, letterSpacing: "0.04em", color: "var(--kas-ink-2)", fontWeight: 500 }}>{s.out}</span>
                                    {s.isLembur && (
                                      <span className="px-1.5 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", background: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)", border: "1px solid var(--kas-ochre)" }}>
                                        Lembur {s.lemburHours}j
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Selfie thumbnails */}
                            {day.selfies && day.selfies.length > 0 && (
                              <div style={{ display: "flex", paddingLeft: 16, paddingRight: 16, paddingBottom: 10, gap: 8 }}>
                                {day.selfies.map((selfie, idx) => (
                                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <div
                                      style={{
                                        width: 52,
                                        height: 52,
                                        background: "var(--kas-ink)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "#ffffff", letterSpacing: "0.04em" }}>
                                        {selfie.time}
                                      </span>
                                    </div>
                                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 7, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                      {selfie.kind === "masuk" ? "MASUK" : "LEMBUR"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Laporan harian */}
                            {day.laporan && (
                              <div style={{ margin: "0 16px 10px", padding: "10px 12px", background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                  <MonoLabel size={8}>LAPORAN HARIAN</MonoLabel>
                                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", letterSpacing: "0.08em" }}>
                                    {day.laporan.photos} foto
                                  </span>
                                </div>
                                <p style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 13, color: "var(--kas-ink-2)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                                  {day.laporan.note}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
