import { fmtIDRshort } from "@/lib/data";
import type {
	AnalyticsData,
	Recommendation,
	RecType,
	PendingItem,
} from "./types";
import { SecLabel, SecTitle } from "./primitives";

function buildRecs(d: AnalyticsData): Recommendation[] {
	const recs: Recommendation[] = [];

	d.lowStockMaterials.forEach((m) => {
		recs.push({
			type: "danger",
			label: "Stok Material",
			nav: "Material",
			text: `${m.name} di bawah minimum — ${m.stock} ${m.unit} tersisa (min. ${m.minStock} ${m.unit}). Hubungi ${m.supplier}.`,
		});
	});

	const pendingMR = d.pendingItems.filter(
		(p): p is Extract<PendingItem, { kind: "material" }> =>
			p.kind === "material",
	);
	const pendingCO = d.pendingItems.filter(
		(p): p is Extract<PendingItem, { kind: "change_order" }> =>
			p.kind === "change_order",
	);

	if (pendingMR.length > 0) {
		recs.push({
			type: "warning",
			label: "Permintaan Material",
			nav: "Material",
			text: `${pendingMR.length} permintaan menunggu persetujuan dari ${[...new Set(pendingMR.map((r) => r.workerName.split(" ").pop()))].join(", ")}.`,
		});
	}
	if (pendingCO.length > 0) {
		const totalImpact = pendingCO.reduce((s, co) => s + co.costImpact, 0);
		recs.push({
			type: "warning",
			label: "Ubah Order",
			nav: "Proyek",
			text: `${pendingCO.length} Ubah Order menunggu keputusan — potensi tambahan biaya ${fmtIDRshort(totalImpact)}.`,
		});
	}

	const cur = d.website.monthly[d.website.monthly.length - 1];
	const inquiryConvPct =
		d.website.funnel.visitors > 0
			? (d.website.funnel.inquiries / d.website.funnel.visitors) * 100
			: 0;
	if (inquiryConvPct < 5)
		recs.push({
			type: "info",
			label: "Situs Web",
			text: `Konversi pengunjung ke inquiry hanya ${inquiryConvPct.toFixed(1)}% — tambahkan tombol CTA di halaman Portofolio dan Beranda.`,
		});
	if (cur.bounceRate > 50)
		recs.push({
			type: "info",
			label: "Situs Web",
			text: `Bounce rate ${cur.bounceRate}% — halaman Kontak paling cepat ditinggalkan. Sederhanakan formulir kontak.`,
		});

	const lowUtilWorkers = d.employees.filter((w) => w.utilPct < 55);
	if (lowUtilWorkers.length > 0) {
		recs.push({
			type: "info",
			label: "Tim",
			nav: "Pekerja Lapangan",
			text: `${lowUtilWorkers.map((w) => w.name.split(" ").pop()).join(", ")} utilisasi di bawah 55% bulan ini — verifikasi absensi atau distribusikan ke proyek lain.`,
		});
	}

	return recs;
}

const REC_COLORS: Record<RecType, { bg: string; dot: string }> = {
	danger: { bg: "hsl(14 70% 98%)", dot: "var(--kas-rust)" },
	warning: { bg: "hsl(38 80% 98%)", dot: "var(--kas-ochre)" },
	info: { bg: "hsl(218 70% 98%)", dot: "var(--kas-cobalt)" },
};

export function RecommendationsSection({ d }: { d: AnalyticsData }) {
	const recs = buildRecs(d);

	return (
		<section>
			<SecLabel no="06" kicker="Rekomendasi Peningkatan" source="computed" />
			<SecTitle>
				Tindakan yang <em>perlu diambil.</em>
			</SecTitle>

			<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
				{recs.length === 0 ? (
					<div
						className="py-6"
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 11,
							color: "var(--kas-moss)",
							letterSpacing: "0.12em",
						}}
					>
						Semua indikator dalam kondisi baik. Tidak ada tindakan mendesak.
					</div>
				) : (
					recs.map((r, i) => {
						const c = REC_COLORS[r.type];
						return (
							<div
								key={i}
								className="grid gap-4 items-start py-4"
								style={{
									gridTemplateColumns: "8px 100px 1fr auto",
									borderBottom: "1px solid var(--kas-line)",
									background: c.bg,
								}}
							>
								<div
									style={{
										width: 8,
										height: 8,
										background: c.dot,
										marginTop: 4,
										flexShrink: 0,
									}}
								/>
								<span
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 9,
										letterSpacing: "0.14em",
										color: c.dot,
										textTransform: "uppercase",
										fontWeight: 700,
										paddingTop: 3,
									}}
								>
									{r.label}
								</span>
								<span
									style={{
										fontFamily: "var(--font-manrope), sans-serif",
										fontSize: 13,
										lineHeight: 1.5,
									}}
								>
									{r.text}
								</span>
								{r.nav && (
									<span
										style={{
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 9,
											letterSpacing: "0.12em",
											color: "var(--kas-ink-3)",
											textTransform: "uppercase",
											whiteSpace: "nowrap",
											paddingTop: 3,
										}}
									>
										→ {r.nav}
									</span>
								)}
							</div>
						);
					})
				)}
			</div>
		</section>
	);
}
