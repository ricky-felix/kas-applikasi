"use client";
import { useState, useRef, useMemo } from "react";
import { ACCOUNTS, WORKERS, PROJECTS } from "@/lib/data";
import { TopBar, SectionHead, Footer } from "./shared";

type ContactType = "semua" | "staf" | "pekerja" | "klien";
type Contact = { key: string; name: string; phone: string; sublabel: string; type: "staf" | "pekerja" | "klien" };

function WAButton({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");
  return (
    <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer"
      className="grid place-items-center flex-shrink-0"
      style={{ width: 32, height: 32, background: "var(--kas-ink)", color: "var(--kas-paper)", textDecoration: "none" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.52 3.48A11.95 11.95 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.18 1.6 6L0 24l6.2-1.6A11.96 11.96 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 21.9a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.68.96.99-3.58-.24-.37A9.87 9.87 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1c2.65 0 5.14 1.03 7.01 2.9A9.86 9.86 0 0121.9 12c0 5.48-4.42 9.9-9.9 9.9zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.47.71.31 1.26.49 1.69.62.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
      </svg>
    </a>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="grid place-items-center flex-shrink-0"
      style={{ width: 36, height: 36, background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)", fontFamily: "var(--font-newsreader), serif", fontSize: 13, fontWeight: 500 }}>
      {name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
    </div>
  );
}

const TYPE_LABEL: Record<Contact["type"], string> = { staf: "Staf", pekerja: "Pekerja", klien: "Klien" };
const TYPE_BG:    Record<Contact["type"], string> = { staf: "var(--kas-cobalt-soft)", pekerja: "var(--kas-paper-2)", klien: "var(--kas-ochre-soft)" };
const TYPE_FG:    Record<Contact["type"], string> = { staf: "var(--kas-cobalt-ink)", pekerja: "var(--kas-ink-3)", klien: "var(--kas-ochre-ink)" };

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ContactType>("semua");
  const letterRefs = useRef<Map<string, HTMLElement>>(new Map());

  const uniqueClients = useMemo(() => {
    const seen = new Set<string>();
    return PROJECTS.flatMap((p) => {
      const digits = p.client.phone.replace(/\D/g, "");
      if (seen.has(digits)) return [];
      seen.add(digits);
      return [{ name: p.client.name, phone: p.client.phone, projectName: p.name }];
    });
  }, []);

  const allContacts: Contact[] = useMemo(() => [
    ...ACCOUNTS.filter((a) => a.role !== "worker").map((a) => ({
      key: a.phone, name: a.name, phone: a.phone, type: "staf" as const,
      sublabel: a.role === "super_admin" ? "Super Admin" : a.role === "owner" ? "Owner" : "Administrasi",
    })),
    ...WORKERS.map((w) => ({
      key: w.id, name: w.name, phone: w.phone, type: "pekerja" as const,
      sublabel: w.role + (w.isKepalaProyek ? " · Kepala Proyek" : ""),
    })),
    ...uniqueClients.map((c) => ({
      key: c.phone, name: c.name, phone: c.phone, type: "klien" as const,
      sublabel: c.projectName,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name, "id")), [uniqueClients]);

  const q = search.toLowerCase();
  const visible = allContacts.filter((c) =>
    (filter === "semua" || c.type === filter) &&
    (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.sublabel.toLowerCase().includes(q))
  );

  const grouped = visible.reduce<Record<string, Contact[]>>((acc, c) => {
    const letter = c.name[0]?.toUpperCase() ?? "#";
    (acc[letter] ??= []).push(c);
    return acc;
  }, {});
  const letters = Object.keys(grouped).sort();
  const activeLetters = new Set(letters);

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Direktori Kontak" />
      <div className="flex justify-between items-end mb-5">
        <SectionHead no="—" kicker={`${visible.length} KONTAK`}>Direktori, <em>semua pihak.</em></SectionHead>
      </div>

      {/* Search */}
      <div className="relative mb-4" style={{ maxWidth: 480 }}>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, nomor HP, atau jabatan..."
          className="w-full px-3.5 py-3 pr-9"
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink)", outline: "none" }}
        />
        {search ? (
          <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2"
            style={{ transform: "translateY(-50%)", border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}>✕</button>
        ) : (
          <span className="absolute right-3 top-1/2 pointer-events-none"
            style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-ink-4)" }}>⌕</span>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-6">
        {(["semua", "staf", "pekerja", "klien"] as ContactType[]).map((t) => (
          <button key={t} type="button" onClick={() => setFilter(t)}
            style={{ border: "1px solid var(--kas-ink)", background: filter === t ? "var(--kas-ink)" : "var(--kas-paper)", color: filter === t ? "var(--kas-paper)" : "var(--kas-ink-3)", padding: "5px 14px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}>
            {t === "semua" ? "Semua" : TYPE_LABEL[t as Contact["type"]]}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Contact list */}
        <div style={{ flex: 1, borderTop: "1px solid var(--kas-ink)" }}>
          {letters.length === 0 ? (
            <div className="py-8" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-4)", letterSpacing: "0.12em" }}>
              Tidak ada kontak ditemukan.
            </div>
          ) : (
            letters.map((letter) => (
              <div key={letter} ref={(el) => { if (el) letterRefs.current.set(letter, el); }}>
                <div className="py-1.5 sticky top-0" style={{ background: "var(--kas-paper)", borderBottom: "1px solid var(--kas-line-2)", fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontStyle: "italic", color: "var(--kas-ink-3)" }}>
                  {letter}
                </div>
                {grouped[letter].map((c) => (
                  <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, paddingBottom: 14, borderBottom: "1px solid var(--kas-line)" }}>
                    <Avatar name={c.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                        <span className="px-1.5 py-0.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", background: TYPE_BG[c.type], color: TYPE_FG[c.type], border: "1px solid var(--kas-line)", flexShrink: 0 }}>
                          {TYPE_LABEL[c.type]}
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.sublabel}
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "var(--kas-ink-2)", flexShrink: 0 }}>{c.phone}</span>
                    <WAButton phone={c.phone} />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Alphabet scrubber */}
        <div className="flex flex-col gap-0 sticky self-start" style={{ top: 0, paddingTop: 4 }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
            <button key={l} type="button" onClick={() => letterRefs.current.get(l)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              disabled={!activeLetters.has(l)}
              style={{ border: "none", background: "transparent", padding: "2px 5px", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.06em", color: activeLetters.has(l) ? "var(--kas-ink)" : "var(--kas-line)", cursor: activeLetters.has(l) ? "pointer" : "default", fontWeight: activeLetters.has(l) ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
