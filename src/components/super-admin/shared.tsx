"use client";
import { TODAY } from "@/lib/data";
import { MonoLabel } from "@/components/primitives";

export function TopBar({ title, crumb }: { title?: string; crumb?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center gap-3.5">
        {crumb || <MonoLabel size={10}>{title}</MonoLabel>}
      </div>
      <div className="flex items-center gap-3.5" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
        <span>{TODAY}</span>
        <span className="inline-block" style={{ width: 6, height: 6, background: "var(--kas-cobalt)" }} />
        <span>Live</span>
      </div>
    </div>
  );
}

export function SectionHead({ no, kicker, children }: { no: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.14em" }}>{no}</span>
        <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.2em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>{kicker}</span>
      </div>
      <h2 style={{ fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.01em", margin: 0 }}>{children}</h2>
    </div>
  );
}

export function Footer() {
  return (
    <div className="mt-14 pt-5 flex justify-between" style={{ borderTop: "1px solid var(--kas-ink)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
      <span>Tauke © 2026 · CV Karya Agung Sejati</span>
      <span>Medan, Sumatera Utara</span>
    </div>
  );
}

export function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}

export function Bar({ pct, color = "var(--kas-ink)", h = 4, bg = "var(--kas-line-2)" }: {
  pct: number; color?: string; h?: number; bg?: string;
}) {
  return (
    <div style={{ position: "relative", height: h, background: bg, flex: 1, minWidth: 0 }}>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color }} />
    </div>
  );
}
