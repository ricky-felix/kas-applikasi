"use client";
import { ReactNode } from "react";

export function KasBrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect x="1" y="1" width="30" height="30" stroke="var(--kas-cobalt)" strokeWidth="2" />
      <rect x="5" y="5" width="22" height="22" rx="4" stroke="var(--kas-rust)" strokeWidth="2" />
      <circle cx="16" cy="16" r="4" fill="var(--kas-ink)" />
    </svg>
  );
}

export function KasLogo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <KasBrandMark size={size} />
      <div className="flex flex-col leading-none">
        <span
          className="font-display tracking-tight"
          style={{ fontSize: size * 0.56 }}
        >
          KAS<span className="text-cobalt">.</span>
        </span>
        <span
          className="font-mono-kas text-muted-foreground uppercase"
          style={{ fontSize: 9, letterSpacing: "0.18em", marginTop: 2 }}
        >
          Tauke
        </span>
      </div>
    </div>
  );
}

export function Kicker({ no, label }: { no: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          color: "var(--kas-ink-3)",
        }}
      >
        {no}
      </span>
      <span className="flex-1" style={{ height: 1, background: "var(--kas-line)" }} />
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--kas-ink-3)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function DisplayHeading({
  children,
  size = 28,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-newsreader), serif",
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: "-0.01em",
        color: "var(--kas-ink)",
      }}
    >
      {children}
    </div>
  );
}

export function MonoLabel({
  children,
  size = 10,
  color = "var(--kas-ink-3)",
}: {
  children: ReactNode;
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: size,
        letterSpacing: "0.16em",
        textTransform: "uppercase" as const,
        color,
      }}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    Active:    { bg: "var(--kas-cobalt-soft)",  color: "var(--kas-cobalt-ink)",  dot: "var(--kas-cobalt)" },
    "On Hold": { bg: "var(--kas-ochre-soft)",   color: "var(--kas-ochre-ink)",   dot: "var(--kas-ochre)" },
    Completed: { bg: "var(--kas-moss-soft)",    color: "var(--kas-moss-ink)",    dot: "var(--kas-moss)" },
    Draft:     { bg: "var(--kas-paper-2)",      color: "var(--kas-ink-3)",       dot: "var(--kas-ink-3)" },
  };
  const c = map[status] || map.Draft;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1"
      style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        background: c.bg,
        color: c.color,
        border: "1px solid var(--kas-line)",
      }}
    >
      <span
        className="inline-block"
        style={{ width: 6, height: 6, background: c.dot, flexShrink: 0 }}
      />
      {status}
    </span>
  );
}

export function ProgressBar({ pct, height = 4 }: { pct: number; height?: number }) {
  return (
    <div
      className="relative"
      style={{ height, background: "var(--kas-line-2)" }}
    >
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: `${pct}%`, background: "var(--kas-ink)" }}
      />
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <div
      className="absolute left-3 right-3 bottom-[72px] flex items-center gap-2.5 px-3.5 py-3"
      style={{
        background: "var(--kas-ink)",
        color: "var(--kas-paper)",
        fontSize: 13,
        fontWeight: 500,
        zIndex: 50,
      }}
    >
      <span
        className="inline-block shrink-0"
        style={{ width: 8, height: 8, background: "var(--kas-cobalt)" }}
      />
      {message}
    </div>
  );
}

export function MobileTopBar({
  tabLabel,
  children,
}: {
  tabLabel: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: "1px solid var(--kas-ink)" }}
    >
      <KasLogo size={24} />
      <MonoLabel size={9}>{tabLabel}</MonoLabel>
      {children}
    </div>
  );
}
