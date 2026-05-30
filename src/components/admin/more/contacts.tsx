"use client";
import { WORKERS, PROJECTS } from "@/lib/data";
import { Kicker, DisplayHeading } from "@/components/primitives";

function WAButton({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      className="grid place-items-center flex-shrink-0"
      style={{ width: 32, height: 32, background: "var(--kas-ink)", color: "var(--kas-paper)", textDecoration: "none" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.52 3.48A11.95 11.95 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.18 1.6 6L0 24l6.2-1.6A11.96 11.96 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 21.9a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.68.96.99-3.58-.24-.37A9.87 9.87 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1c2.65 0 5.14 1.03 7.01 2.9A9.86 9.86 0 0121.9 12c0 5.48-4.42 9.9-9.9 9.9zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.47.71.31 1.26.49 1.69.62.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ContactRow({ name, sub, phone }: { name: string; sub: string; phone: string }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ paddingTop: 14, paddingBottom: 14, borderBottom: "1px solid var(--kas-line)" }}
    >
      <div
        className="grid place-items-center flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          background: "var(--kas-paper-2)",
          border: "1px solid var(--kas-line)",
          fontFamily: "var(--font-newsreader), serif",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--kas-ink)",
        }}
      >
        {getInitials(name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{name}</div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub}
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-2)", marginTop: 2 }}>
          {phone}
        </div>
      </div>
      <WAButton phone={phone} />
    </div>
  );
}

export default function AMContacts({ onBack }: { onBack: () => void }) {
  const activeProjects = PROJECTS.filter((p) => p.status === "Active");

  const uniqueClients = (() => {
    const seen = new Set<string>();
    const result: { name: string; phone: string; projectName: string }[] = [];
    for (const p of activeProjects) {
      const digits = p.client.phone.replace(/\D/g, "");
      if (!seen.has(digits)) {
        seen.add(digits);
        result.push({ name: p.client.name, phone: p.client.phone, projectName: p.name });
      }
    }
    return result;
  })();

  return (
    <div className="px-5 pt-4 pb-6">
      <button
        onClick={onBack}
        style={{ border: "none", background: "transparent", color: "var(--kas-ink-3)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", padding: "0 0 12px" }}
      >
        ← Kembali
      </button>

      <Kicker no="C" label="DIREKTORI KONTAK" />
      <DisplayHeading size={26}>Direktori,<br /><em>kontak.</em></DisplayHeading>

      <div className="mt-5 flex flex-col gap-5">
        <div>
          <Kicker no="01" label="PEKERJA LAPANGAN" />
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {WORKERS.map((w) => (
              <ContactRow
                key={w.id}
                name={w.name}
                sub={`${w.role}${w.isKepalaProyek ? " · Kepala Proyek" : ""}`}
                phone={w.phone}
              />
            ))}
          </div>
        </div>

        <div>
          <Kicker no="02" label="KLIEN AKTIF" />
          <div style={{ borderTop: "1px solid var(--kas-ink)" }}>
            {uniqueClients.length === 0 ? (
              <div className="py-4" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Tidak ada klien aktif
              </div>
            ) : (
              uniqueClients.map((c) => (
                <ContactRow
                  key={c.phone}
                  name={c.name}
                  sub={c.projectName}
                  phone={c.phone}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
