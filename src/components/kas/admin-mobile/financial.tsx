"use client";
import { useState } from "react";
import { PROJECTS, CASHFLOW_MAY, MATERIALS, fmtIDR, fmtIDRshort } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "../ui";

export type SubTab = "tagihan" | "riwayat" | "material";

function WAIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A14 14 0 003.5 22l-1.5 6 6.2-1.6A14 14 0 1020 4z" /></svg>;
}

export function FinancialSubTabs({ active, setActive }: { active: SubTab; setActive: (t: SubTab) => void }) {
  const tabs: { k: SubTab; l: string }[] = [
    { k: "tagihan",  l: "Tagihan"  },
    { k: "riwayat",  l: "Riwayat"  },
    { k: "material", l: "Material" },
  ];
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(3, 1fr)",
        borderTop: "1px solid var(--kas-ink)",
        background: "var(--kas-paper)",
      }}
    >
      {tabs.map((t, i) => (
        <button
          key={t.k}
          onClick={() => setActive(t.k)}
          style={{
            border: "none",
            borderRight: i < 2 ? "1px solid var(--kas-line)" : "none",
            borderTop: active === t.k ? "2px solid var(--kas-ink)" : "2px solid transparent",
            background: active === t.k ? "var(--kas-ink)" : "transparent",
            color: active === t.k ? "var(--kas-paper)" : "var(--kas-ink-3)",
            padding: "10px 0",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {t.l}
        </button>
      ))}
    </div>
  );
}

function Tagihan({ toast }: { toast: (m: string) => void }) {
  const outstanding = PROJECTS.filter((p) => p.contractValue > p.paid);
  const total = outstanding.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const [lunasList, setLunasList] = useState<Set<string>>(new Set());

  return (
    <>
      <Kicker no="A" label={`${outstanding.length} BELUM LUNAS`} />
      <DisplayHeading size={26}>Tagihan,<br /><em>aktif.</em></DisplayHeading>

      <div className="mt-4 p-4" style={{ background: "var(--kas-ink)", color: "var(--kas-paper)" }}>
        <MonoLabel size={10} color="rgba(255,255,255,0.6)">Total Outstanding</MonoLabel>
        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 34, fontWeight: 500, marginTop: 6, color: "var(--kas-rust)" }}>
          {fmtIDR(total)}
        </div>
      </div>

      <div className="mt-4">
        {outstanding.map((p) => {
          const sisa = p.contractValue - p.paid;
          const isLunas = lunasList.has(p.id);
          const waMsg = encodeURIComponent(`Halo Bpk/Ibu ${p.client.name.replace(/^Bpk\. |^Ibu /, "")},\n\nTagihan proyek *${p.name}* senilai *${fmtIDRshort(sisa)}* belum dilunasi.\n\nBerikut link tagihan:\nhttps://tauke.example.com/inv/${p.slug}\n\nMohon konfirmasi pembayaran.\n\n— CV Karya Agung Sejati`);
          const waUrl = `https://wa.me/${p.client.phone.replace(/\D/g, "")}?text=${waMsg}`;
          return (
            <div key={p.id} className="py-4" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-baseline">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18 }}>{p.client.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 14, color: "var(--kas-rust)", fontWeight: 600 }}>{fmtIDRshort(sisa)}</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>{p.code} · {p.name}</div>
              {isLunas ? (
                <div className="mt-2.5 px-3.5 py-2.5" style={{ border: "1px solid var(--kas-line)", background: "var(--kas-moss-soft)" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-moss-ink)", fontWeight: 600 }}>✓ LUNAS</span>
                </div>
              ) : (
                <div className="grid gap-1.5 mt-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button
                    onClick={() => setLunasList((s) => { const n = new Set(s); n.add(p.id); return n; })}
                    style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", padding: "10px 0", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}
                  >
                    Tandai Lunas
                  </button>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5"
                    style={{ border: "none", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}
                  >
                    <WAIcon /> Tagih WA
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Riwayat() {
  const cashIn  = CASHFLOW_MAY.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const cashOut = CASHFLOW_MAY.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
  const net     = cashIn - cashOut;

  return (
    <>
      <Kicker no="B" label={`${CASHFLOW_MAY.length} TRANSAKSI · MEI 2026`} />
      <DisplayHeading size={26}>Riwayat,<br /><em>kas masuk & keluar.</em></DisplayHeading>

      <div className="grid mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr", border: "1px solid var(--kas-ink)" }}>
        {[
          { label: "Masuk",  value: fmtIDRshort(cashIn),  color: "var(--kas-moss)"  },
          { label: "Keluar", value: fmtIDRshort(cashOut), color: "var(--kas-rust)"  },
          { label: "Neto",   value: fmtIDRshort(net),     color: net >= 0 ? "var(--kas-moss)" : "var(--kas-rust)" },
        ].map((s, i) => (
          <div key={i} className="px-3 py-3" style={{ borderRight: i < 2 ? "1px solid var(--kas-line)" : "none" }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, fontWeight: 500, marginTop: 4, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {[...CASHFLOW_MAY].reverse().map((e, i) => (
          <div key={i} className="flex justify-between items-start py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{e.description}</div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 3, letterSpacing: "0.08em" }}>
                {e.date} · {e.projectCode}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 600, color: e.type === "in" ? "var(--kas-moss)" : "var(--kas-rust)" }}>
                {e.type === "in" ? "+" : "−"}{fmtIDRshort(e.amount)}
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {e.type === "in" ? "masuk" : "keluar"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Material() {
  const lowCount = MATERIALS.filter((m) => m.stock <= m.minStock).length;
  return (
    <>
      <div className="flex justify-between items-end mb-1">
        <Kicker no="C" label={`${MATERIALS.length} ITEM MATERIAL`} />
        {lowCount > 0 && (
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", padding: "3px 8px", background: "var(--kas-rust-soft)", color: "var(--kas-rust-ink)" }}>
            {lowCount} stok tipis
          </span>
        )}
      </div>
      <DisplayHeading size={26}>Material,<br /><em>stok gudang.</em></DisplayHeading>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {MATERIALS.map((m) => {
          const low = m.stock <= m.minStock;
          const pct = Math.round((m.used / m.budget) * 100);
          return (
            <div key={m.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.supplier}</div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "3px 8px", background: low ? "var(--kas-rust-soft)" : "var(--kas-moss-soft)", color: low ? "var(--kas-rust-ink)" : "var(--kas-moss-ink)" }}>
                  {low ? "Tipis" : "Aman"}
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Stok Gudang</div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, color: low ? "var(--kas-rust)" : "var(--kas-ink)" }}>
                    {m.stock} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{m.unit}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1 }}>Min. {m.minStock} {m.unit}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Terpakai / Budget</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: pct >= 90 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{m.used}</span>
                    <span style={{ color: "var(--kas-ink-3)" }}> / {m.budget} {m.unit}</span>
                  </div>
                  <div className="relative" style={{ height: 3, background: "var(--kas-line-2)" }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--kas-rust)" : "var(--kas-cobalt)" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function AMFinancial({ sub, toast }: { sub: SubTab; toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      {sub === "tagihan"  && <Tagihan toast={toast} />}
      {sub === "riwayat"  && <Riwayat />}
      {sub === "material" && <Material />}
    </div>
  );
}
