import { fmtIDRshort } from "@/lib/data";
import type { AnalyticsData, PendingItem } from "./types";
import { HBar, SecLabel, SecTitle } from "./primitives";

export function FeatureSection({ d }: { d: AnalyticsData }) {
	return (
		<section className="mb-12">
			<SecLabel no="05" kicker="Tauke App · Adopsi Fitur" source="supabase" />
			<SecTitle>
				Penggunaan fitur, <em>bulan ini.</em>
			</SecTitle>

			<div className="grid gap-9" style={{ gridTemplateColumns: "1fr 1fr" }}>
				<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
					{d.features.map((f, i) => (
						<div
							key={i}
							className="py-3.5"
							style={{ borderBottom: "1px solid var(--kas-line)" }}
						>
							<div className="flex justify-between items-baseline mb-2">
								<span
									style={{
										fontFamily: "var(--font-manrope), sans-serif",
										fontSize: 13,
									}}
								>
									{f.label}
								</span>
								<span
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 22,
										fontWeight: 500,
									}}
								>
									{f.value}
								</span>
							</div>
							<HBar
								pct={(f.value / f.cap) * 100}
								h={4}
								color="var(--kas-cobalt)"
							/>
							<div
								style={{
									fontFamily: "var(--font-jetbrains), monospace",
									fontSize: 9,
									color: "var(--kas-ink-3)",
									marginTop: 5,
									letterSpacing: "0.08em",
								}}
							>
								{f.value} dari target {f.cap} bulan ini
							</div>
						</div>
					))}
				</div>

				<div>
					<div
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 9,
							letterSpacing: "0.16em",
							color: "var(--kas-ink-3)",
							textTransform: "uppercase",
							marginBottom: 10,
						}}
					>
						Antrian persetujuan
					</div>
					<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
						{d.pendingItems.length === 0 ? (
							<div
								className="py-5"
								style={{
									fontFamily: "var(--font-jetbrains), monospace",
									fontSize: 10,
									color: "var(--kas-ink-3)",
									letterSpacing: "0.1em",
								}}
							>
								Tidak ada item menunggu.
							</div>
						) : (
							d.pendingItems.map((item: PendingItem, i) =>
								item.kind === "material" ? (
									<div
										key={i}
										className="py-3"
										style={{ borderBottom: "1px solid var(--kas-line)" }}
									>
										<div className="flex justify-between items-baseline">
											<span
												style={{
													fontFamily: "var(--font-manrope), sans-serif",
													fontSize: 13,
												}}
											>
												{item.materialName}
											</span>
											<span
												style={{
													fontFamily: "var(--font-jetbrains), monospace",
													fontSize: 9,
													color: "var(--kas-ochre)",
													border: "1px solid var(--kas-ochre)",
													padding: "1px 5px",
													letterSpacing: "0.1em",
													textTransform: "uppercase",
												}}
											>
												Material
											</span>
										</div>
										<div
											style={{
												fontFamily: "var(--font-jetbrains), monospace",
												fontSize: 9,
												color: "var(--kas-ink-3)",
												marginTop: 3,
												letterSpacing: "0.08em",
											}}
										>
											{item.workerName} · {item.qty} {item.unit} · {item.date}
										</div>
									</div>
								) : (
									<div
										key={i}
										className="py-3"
										style={{ borderBottom: "1px solid var(--kas-line)" }}
									>
										<div className="flex justify-between items-baseline">
											<span
												style={{
													fontFamily: "var(--font-manrope), sans-serif",
													fontSize: 13,
													flex: 1,
													marginRight: 8,
												}}
											>
												{item.description.length > 40
													? item.description.slice(0, 40) + "…"
													: item.description}
											</span>
											<span
												style={{
													fontFamily: "var(--font-jetbrains), monospace",
													fontSize: 9,
													color: "var(--kas-cobalt)",
													border: "1px solid var(--kas-cobalt)",
													padding: "1px 5px",
													letterSpacing: "0.1em",
													textTransform: "uppercase",
													flexShrink: 0,
												}}
											>
												Ubah Order
											</span>
										</div>
										<div
											style={{
												fontFamily: "var(--font-jetbrains), monospace",
												fontSize: 9,
												color: "var(--kas-ink-3)",
												marginTop: 3,
												letterSpacing: "0.08em",
											}}
										>
											{fmtIDRshort(item.costImpact)} · {item.requestedBy} ·{" "}
											{item.date}
										</div>
									</div>
								),
							)
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
