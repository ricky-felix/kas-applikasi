"use client";
import { useState } from "react";
import { PROJECTS, WORKERS, MATERIALS, CASHFLOW_MAY, MATERIAL_REQUESTS, CHANGE_ORDERS, TODAY_SHORT, fmtIDRshort, type Account } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel, MobileTopBar } from "@/components/primitives";
import OwnerFinanceSheet from "@/components/owner/finance-sheet";
import { MetricCard } from "@/components/owner/metric-card";
import { ProyekSheet } from "@/components/owner/sheets/proyek-sheet";
import { BayarSheet } from "@/components/owner/sheets/bayar-sheet";
import { PekerjaSheet } from "@/components/owner/sheets/pekerja-sheet";
import { MaterialSheet } from "@/components/owner/sheets/material-sheet";
import { PermintaanSheet } from "@/components/owner/sheets/permintaan-sheet";

type Sheet = "proyek" | "bayar" | "pekerja" | "material" | "finance" | "permintaan" | null;

export default function OwnerDashboard({ session, onLogout }: { session: Account | null; onLogout: () => void }) {
  const [sheet, setSheet] = useState<Sheet>(null);

  const activeProjects   = PROJECTS.filter((p) => p.status === "Active");
  const outstandingTotal = PROJECTS.reduce((s, p) => s + (p.contractValue - p.paid), 0);
  const workersToday     = WORKERS.filter((w) => activeProjects.some((p) => p.assigned.includes(w.id)));
  const lowStockCount    = MATERIALS.filter((m) => m.stock <= m.minStock).length;
  const pendingMR        = MATERIAL_REQUESTS.filter((r) => r.status === "Pending").length;
  const pendingCO        = CHANGE_ORDERS.filter((c) => c.status === "Menunggu").length;
  const totalPending     = pendingMR + pendingCO;

  const cards = [
    { key: "proyek",     no: "01", label: "Proyek aktif hari ini", value: String(activeProjects.length).padStart(2, "0"), sub: `dari ${PROJECTS.length} total`,                                  accent: false             },
    { key: "bayar",      no: "02", label: "Belum dibayar",          value: fmtIDRshort(outstandingTotal),                 sub: "2 termin pending",                                               accent: true              },
    { key: "pekerja",    no: "03", label: "Pekerja hadir",          value: String(workersToday.length).padStart(2, "0"),  sub: `dari ${WORKERS.length} pekerja`,                                 accent: false             },
    { key: "material",   no: "04", label: "Material gudang",        value: String(MATERIALS.length).padStart(2, "0"),     sub: lowStockCount > 0 ? `${lowStockCount} stok tipis` : "semua aman", accent: lowStockCount > 0 },
    { key: "finance",    no: "05", label: "Arus kas bulan ini",     value: fmtIDRshort(CASHFLOW_MAY.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0)), sub: `${CASHFLOW_MAY.filter((e) => e.type === "out").length} pengeluaran tercatat`, accent: false },
    { key: "permintaan", no: "06", label: "Permintaan pending",     value: String(totalPending).padStart(2, "0"),         sub: `${pendingMR} material · ${pendingCO} change order`,              accent: totalPending > 0  },
  ] as const;

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: "var(--kas-paper)", color: "var(--kas-ink)" }}>
      <MobileTopBar tabLabel={`${session?.name ?? "Owner"} · OWNER`}>
        <button onClick={onLogout} style={{ border: "1px solid var(--kas-line)", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: "4px 8px" }}>
          Keluar
        </button>
      </MobileTopBar>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-1">
          <Kicker no="00" label={TODAY_SHORT} />
          <DisplayHeading size={30}>Tiga angka,<br /><em>satu pagi.</em></DisplayHeading>
        </div>

        <div className="px-5 pt-4 pb-2 flex flex-col">
          {cards.map((c, i) => (
            <MetricCard key={c.key} card={c} index={i} total={cards.length} onClick={() => setSheet(c.key)} />
          ))}
        </div>

        <div className="px-5 py-5 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--kas-ink-3)", textTransform: "uppercase" }}>
          Tap angka untuk lihat detail.
        </div>
      </div>

      {sheet && (
        <>
          <div onClick={() => setSheet(null)} className="absolute inset-0" style={{ background: "rgba(22,28,44,0.4)", zIndex: 10 }} />
          <div className="absolute left-0 right-0 bottom-0 flex flex-col animate-slide-up" style={{ background: "var(--kas-paper)", borderTop: "1px solid var(--kas-ink)", maxHeight: "80%", zIndex: 20 }}>
            <div className="flex justify-between items-center px-5 py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <MonoLabel size={10}>{`${cards.find((c) => c.key === sheet)?.no} · ${sheet.toUpperCase()}`}</MonoLabel>
              <button onClick={() => setSheet(null)} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto">
              <DisplayHeading size={26}>
                {sheet === "proyek"     && <>Proyek aktif,<br /><em>hari ini.</em></>}
                {sheet === "bayar"      && <>Tagihan,<br /><em>belum lunas.</em></>}
                {sheet === "pekerja"    && <>Pekerja,<br /><em>di lapangan.</em></>}
                {sheet === "material"   && <>Material,<br /><em>stok gudang.</em></>}
                {sheet === "finance"    && <>Arus kas,<br /><em>bulan ini.</em></>}
                {sheet === "permintaan" && <>Permintaan,<br /><em>menunggu.</em></>}
              </DisplayHeading>

              {sheet === "proyek"     && <ProyekSheet projects={activeProjects} />}
              {sheet === "bayar"      && <BayarSheet projects={PROJECTS} />}
              {sheet === "pekerja"    && <PekerjaSheet workers={workersToday} activeProjects={activeProjects} />}
              {sheet === "material"   && <MaterialSheet materials={MATERIALS} />}
              {sheet === "permintaan" && <PermintaanSheet materialRequests={MATERIAL_REQUESTS} changeOrders={CHANGE_ORDERS} projects={PROJECTS} pendingMR={pendingMR} pendingCO={pendingCO} />}
              {sheet === "finance"    && <OwnerFinanceSheet />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
