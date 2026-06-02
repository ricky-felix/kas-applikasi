import { Footer } from "./shared";
import { getMockData } from "./analytics/mock-data";
import { WebsiteSection } from "./analytics/website-section";
import { FunnelSection } from "./analytics/funnel-section";
import { AppUsageSection } from "./analytics/app-usage-section";
import { EmployeeSection } from "./analytics/employee-section";
import { FeatureSection } from "./analytics/feature-section";

export default function AnalyticsPage() {
	const d = getMockData();

	return (
		<div
			style={{
				fontFamily: "var(--font-manrope), sans-serif",
				color: "var(--kas-ink)",
			}}
		>
			{/* Header */}
			<div
				className="px-9 pt-7 pb-6"
				style={{ borderBottom: "1px solid var(--kas-line)" }}
			>
				<div className="flex justify-between items-center mb-6">
					<div
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 10,
							letterSpacing: "0.22em",
							color: "var(--kas-ink-3)",
							textTransform: "uppercase",
						}}
					>
						Analitik Produk
					</div>
					<div className="flex items-center gap-2">
						<span
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 9,
								letterSpacing: "0.14em",
								color: "var(--kas-ink-3)",
								textTransform: "uppercase",
							}}
						>
							Periode
						</span>
						<span
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 9,
								letterSpacing: "0.14em",
								border: "1px solid var(--kas-ink)",
								padding: "2px 8px",
								textTransform: "uppercase",
							}}
						>
							Mei 2026
						</span>
					</div>
				</div>
				<div
					style={{
						fontFamily: "var(--font-newsreader), serif",
						fontWeight: 400,
						fontSize: 40,
						lineHeight: 1.05,
						letterSpacing: "-0.01em",
						marginBottom: 16,
					}}
				>
					Performa digital &amp; tim, <em>satu layar.</em>
				</div>
				<div className="flex items-center gap-3">
					<span
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 9,
							letterSpacing: "0.12em",
							color: "var(--kas-ink-3)",
							textTransform: "uppercase",
						}}
					>
						Sumber data
					</span>
					{[
						{
							label: "PostHog · karyaagungsejati.com",
							color: "var(--kas-cobalt)",
						},
						{ label: "PostHog · Tauke App", color: "var(--kas-cobalt)" },
						{ label: "Supabase", color: "var(--kas-moss)" },
					].map((s, i) => (
						<div
							key={i}
							className="flex items-center gap-1.5"
							style={{
								border: "1px solid var(--kas-line)",
								padding: "4px 10px",
							}}
						>
							<span
								style={{
									display: "inline-block",
									width: 6,
									height: 6,
									background: s.color,
								}}
							/>
							<span
								style={{
									fontFamily: "var(--font-jetbrains), monospace",
									fontSize: 9,
									letterSpacing: "0.1em",
								}}
							>
								{s.label}
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="px-9 pt-9 pb-14">
				<WebsiteSection d={d} />
				<FunnelSection d={d} />
				<AppUsageSection d={d} />
				<EmployeeSection d={d} />
				<FeatureSection d={d} />
				<Footer />
			</div>
		</div>
	);
}
