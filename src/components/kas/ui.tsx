"use client";
import { ReactNode } from "react";

export function KasBrandMark({ size = 24 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center"
      style={{
        width: size,
        height: size,
        background: "var(--kas-ink)",
        color: "var(--kas-paper)",
        fontFamily: "var(--font-newsreader), serif",
        fontWeight: 600,
        fontSize: size * 0.5,
      }}
    >
      K
      <span
        className="absolute"
        style={{
          right: -2,
          bottom: -2,
          width: size * 0.21,
          height: size * 0.21,
          background: "var(--kas-orange)",
        }}
      />
    </div>
  );
}

export function KasLogo({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <KasBrandMark size={size} />
      <div
        style={{
          fontFamily: "var(--font-newsreader), serif",
          fontWeight: 500,
          fontSize: size * 0.75,
          letterSpacing: "-0.01em",
          color: "var(--kas-ink)",
        }}
      >
        Tauke
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
    Active:    { bg: "var(--kas-paper-2)", color: "var(--kas-ink)",   dot: "var(--kas-orange)" },
    "On Hold": { bg: "var(--kas-amber-soft)", color: "var(--kas-amber)", dot: "var(--kas-amber)" },
    Completed: { bg: "var(--kas-green-soft)", color: "var(--kas-green)", dot: "var(--kas-green)" },
    Draft:     { bg: "var(--kas-paper-2)", color: "var(--kas-ink-3)", dot: "var(--kas-ink-3)" },
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
        style={{ width: 8, height: 8, background: "var(--kas-orange)" }}
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
