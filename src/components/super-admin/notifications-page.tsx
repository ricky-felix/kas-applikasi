"use client";
import {
  MATERIALS, MATERIAL_REQUESTS, CHANGE_ORDERS,
  WEBSITE_MONTHLY, WEBSITE_FUNNEL, PAYROLL_MAY, fmtIDRshort,
} from "@/lib/data";
import { TopBar, Footer } from "./shared";
import { MonoLabel } from "@/components/primitives";

const WORKING_DAYS = 24;

type Notif = {
  kind: "danger" | "warning" | "info";
  category: string;
  text: string;
  nav?: string;
};

function buildNotifications(): Notif[] {
  const items: Notif[] = [];

  // Low stock
  MATERIALS.filter((m) => m.stock < m.minStock).forEach((m) => {
    items.push({
      kind: "danger",
      category: "Stok Material",
      text: `${m.name} di bawah minimum — ${m.stock} ${m.unit} tersisa (min. ${m.minStock} ${m.unit}). Hubungi ${m.supplier}.`,
      nav: "Material",
    });
  });

  // Pending material requests
  const pendingMat = MATERIAL_REQUESTS.filter((r) => r.status === "Pending");
  if (pendingMat.length > 0) {
    const names = [...new Set(pendingMat.map((r) => r.workerName.split(" ").pop()))].join(", ");
    items.push({
      kind: "warning",
      category: "Permintaan Material",
      text: `${pendingMat.length} permintaan menunggu persetujuan dari ${names}.`,
      nav: "Permintaan Material",
    });
  }

  // Pending change orders
  const pendingCO = CHANGE_ORDERS.filter((c) => c.status === "Menunggu");
  if (pendingCO.length > 0) {
    const total = pendingCO.reduce((s, c) => s + c.costImpact, 0);
    items.push({
      kind: "warning",
      category: "Ubah Order",
      text: `${pendingCO.length} Ubah Order menunggu keputusan — potensi tambahan biaya ${fmtIDRshort(total)}.`,
      nav: "Ubah Order",
    });
  }

  // Website conversion
  const funnel = WEBSITE_FUNNEL;
  const convPct = funnel.visitors > 0 ? (funnel.inquiries / funnel.visitors) * 100 : 0;
  if (convPct < 5) {
    items.push({
      kind: "info",
      category: "Situs Web",
      text: `Konversi pengunjung ke inquiry hanya ${convPct.toFixed(1)}% — tambahkan tombol CTA di halaman Portofolio dan Beranda.`,
    });
  }

  // Bounce rate
  const latest = WEBSITE_MONTHLY[WEBSITE_MONTHLY.length - 1];
  if (latest && latest.bounceRate > 50) {
    items.push({
      kind: "info",
      category: "Situs Web",
      text: `Bounce rate ${latest.bounceRate}% — halaman Kontak paling cepat ditinggalkan. Sederhanakan formulir kontak.`,
    });
  }

  // Low-utilisation workers
  const lowUtil = PAYROLL_MAY.filter((pw) => {
    const days = pw.projects.reduce((s, p) => s + p.daysPresent + p.daysHalf * 0.5, 0);
    return (days / WORKING_DAYS) * 100 < 55;
  });
  if (lowUtil.length > 0) {
    const names = lowUtil.map((pw) => pw.name.split(" ").pop()).join(", ");
    items.push({
      kind: "info",
      category: "Tim",
      text: `${names} utilisasi di bawah 55% bulan ini — verifikasi absensi atau distribusikan ke proyek lain.`,
      nav: "Pekerja Lapangan",
    });
  }

  return items;
}

const KIND_STYLE: Record<Notif["kind"], { dot: string; label: string; row: string }> = {
  danger:  { dot: "var(--kas-rust)",   label: "var(--kas-rust)",   row: "hsl(14 70% 98%)"  },
  warning: { dot: "var(--kas-ochre)",  label: "var(--kas-ochre)",  row: "hsl(38 80% 98%)"  },
  info:    { dot: "var(--kas-cobalt)", label: "var(--kas-cobalt)", row: "hsl(218 70% 98%)" },
};

const KIND_ORDER: Notif["kind"][] = ["danger", "warning", "info"];
const KIND_LABEL: Record<Notif["kind"], string> = { danger: "Mendesak", warning: "Perhatian", info: "Informasi" };

export default function NotificationsPage() {
  const all = buildNotifications();
  const groups = KIND_ORDER.map((k) => ({ kind: k, items: all.filter((n) => n.kind === k) })).filter((g) => g.items.length > 0);
  const total = all.length;

  return (
    <div className="px-9 py-7 pb-14">
      <TopBar title="Notifikasi" />

      <div className="flex items-baseline justify-between mb-8" style={{ borderBottom: "1px solid var(--kas-ink)", paddingBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 8 }}>
            Tindakan &amp; Perhatian
          </div>
          <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 36, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
            {total === 0 ? <>Semua <em>aman.</em></> : <>{total} item <em>perlu ditinjau.</em></>}
          </div>
        </div>
        {total > 0 && (
          <div className="flex gap-4">
            {groups.map((g) => (
              <div key={g.kind} className="text-right">
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 500, color: KIND_STYLE[g.kind].dot, lineHeight: 1 }}>{g.items.length}</div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginTop: 4 }}>{KIND_LABEL[g.kind]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="py-12" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-moss)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Tidak ada notifikasi aktif. Semua indikator dalam kondisi baik.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <div key={g.kind}>
              <div className="flex items-center gap-3 mb-0" style={{ borderTop: `2px solid ${KIND_STYLE[g.kind].dot}`, paddingTop: 12, paddingBottom: 12 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, background: KIND_STYLE[g.kind].dot, flexShrink: 0 }} />
                <MonoLabel size={10}>{KIND_LABEL[g.kind]}</MonoLabel>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.1em" }}>· {g.items.length} item</span>
              </div>
              <div>
                {g.items.map((n, i) => (
                  <div
                    key={i}
                    className="grid items-start gap-4 py-4"
                    style={{ gridTemplateColumns: "140px 1fr auto", borderBottom: "1px solid var(--kas-line)", background: KIND_STYLE[g.kind].row }}
                  >
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: KIND_STYLE[g.kind].label, paddingTop: 2, lineHeight: 1.5 }}>
                      {n.category}
                    </span>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, lineHeight: 1.6, color: "var(--kas-ink)" }}>
                      {n.text}
                    </span>
                    {n.nav ? (
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--kas-ink-3)", textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 2 }}>
                        → {n.nav}
                      </span>
                    ) : <span />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
