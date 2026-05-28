"use client";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { fmtIDR, fmtIDRshort } from "@/lib/data";

const STAGE_LABELS = ["DP (30%)", "Termin 1 (30%)", "Termin 2 (20%)", "Pelunasan (20%)"];
const STAGE_PCTS   = [0.3, 0.3, 0.2, 0.2];

function deriveStages(contractValue: number, paid: number) {
  const amounts = STAGE_PCTS.map((pct, i) =>
    i < 3
      ? Math.round(contractValue * pct)
      : contractValue - Math.round(contractValue * 0.3) * 2 - Math.round(contractValue * 0.2)
  );
  let cumulative = 0;
  return amounts.map((amount, i) => {
    cumulative += amount;
    return { idx: i, label: STAGE_LABELS[i], amount, paid: paid >= cumulative };
  });
}

function WAIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4zm-4.5 16a11.7 11.7 0 01-6-1.6l-.4-.3-3.7 1 1-3.6-.3-.4A11.6 11.6 0 1115.5 20z" />
    </svg>
  );
}

export function BayarSheet({ projects }: { projects: Project[] }) {
  const outstanding = projects.filter((p) => p.contractValue - p.paid > 0);

  // per-project, per-stage override: key = `${projectId}-${stageIdx}`
  const [approvals, setApprovals] = useState<Record<string, "pending" | "lunas">>({});

  const getStatus = (pid: string, idx: number, defaultPaid: boolean) =>
    approvals[`${pid}-${idx}`] ?? (defaultPaid ? "lunas" : "pending");

  const setStatus = (pid: string, idx: number, val: "pending" | "lunas") =>
    setApprovals((prev) => ({ ...prev, [`${pid}-${idx}`]: val }));

  return (
    <div className="mt-4">
      {outstanding.map((p) => {
        const stages = deriveStages(p.contractValue, p.paid);
        const sisa   = p.contractValue - p.paid;
        const waMsg  = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan proyek *${p.name}* senilai *${fmtIDRshort(sisa)}* belum dilunasi.\n\nMohon konfirmasi pembayaran (tunai).\n\n— CV Karya Agung Sejati`);
        const waUrl  = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;

        return (
          <div key={p.id} className="py-4" style={{ borderTop: "1px solid var(--kas-line-2)" }}>
            {/* Project header */}
            <div className="flex justify-between items-baseline mb-1">
              <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{p.client.name}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(sisa)}</div>
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginBottom: 10, letterSpacing: "0.1em" }}>
              {p.code} · {p.name}
            </div>

            {/* Per-stage rows */}
            <div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
              {stages.map((s) => {
                const status = getStatus(p.id, s.idx, s.paid);
                const isLunas = status === "lunas";
                return (
                  <div
                    key={s.idx}
                    className="flex justify-between items-center py-2.5"
                    style={{ borderBottom: "1px solid var(--kas-line-2)" }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.08em", color: isLunas ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                        {s.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600, marginTop: 1, color: isLunas ? "var(--kas-ink-3)" : "var(--kas-ink)" }}>
                        {fmtIDR(s.amount)}
                      </div>
                    </div>

                    <select
                      value={status}
                      onChange={(e) => setStatus(p.id, s.idx, e.target.value as "pending" | "lunas")}
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "5px 8px",
                        border: `1px solid ${isLunas ? "var(--kas-line)" : "var(--kas-ink)"}`,
                        background: isLunas ? "var(--kas-moss-soft)" : "var(--kas-paper)",
                        color: isLunas ? "var(--kas-moss-ink)" : "var(--kas-ink)",
                        cursor: "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                        paddingRight: 24,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='square'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 7px center",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="lunas">Lunas</option>
                    </select>
                  </div>
                );
              })}
            </div>

            {/* WA reminder */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 px-3.5 py-2"
              style={{ border: "1px solid var(--kas-line)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", textDecoration: "none", color: "var(--kas-ink-3)", display: "inline-flex" }}
            >
              <WAIcon /> Ingatkan via WhatsApp
            </a>
          </div>
        );
      })}
    </div>
  );
}
