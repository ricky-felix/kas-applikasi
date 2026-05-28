import type { MaterialRequest, ChangeOrder, Project } from "@/lib/data";

export function PermintaanSheet({
	materialRequests,
	changeOrders,
	projects,
	pendingMR,
	pendingCO,
}: {
	materialRequests: MaterialRequest[];
	changeOrders: ChangeOrder[];
	projects: Project[];
	pendingMR: number;
	pendingCO: number;
}) {
	return (
		<div className="mt-4">
			<div
				style={{
					fontFamily: "var(--font-jetbrains), monospace",
					fontSize: 9,
					letterSpacing: "0.18em",
					textTransform: "uppercase",
					color: "var(--kas-ink-3)",
					marginBottom: 8,
				}}
			>
				Material · {pendingMR} pending
			</div>
			<div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
				{materialRequests.filter((r) => r.status === "Pending").length === 0 ? (
					<div
						className="py-3"
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 10,
							color: "var(--kas-ink-4)",
						}}
					>
						Tidak ada.
					</div>
				) : (
					materialRequests
						.filter((r) => r.status === "Pending")
						.map((req) => (
							<div
								key={req.id}
								className="flex justify-between items-start py-3"
								style={{ borderBottom: "1px solid var(--kas-line-2)" }}
							>
								<div>
									<div
										style={{
											fontFamily: "var(--font-newsreader), serif",
											fontSize: 15,
										}}
									>
										{req.materialName}
									</div>
									<div
										style={{
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 9,
											color: "var(--kas-ink-3)",
											marginTop: 2,
											letterSpacing: "0.08em",
										}}
									>
										{req.workerName} ·{" "}
										{projects.find((p) => p.id === req.projectId)?.code} ·{" "}
										{req.date}
									</div>
									{req.note && (
										<div
											style={{
												fontFamily: "var(--font-newsreader), serif",
												fontSize: 13,
												color: "var(--kas-ink-2)",
												fontStyle: "italic",
												marginTop: 2,
											}}
										>
											{req.note}
										</div>
									)}
								</div>
								<span
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 12,
										fontWeight: 600,
										flexShrink: 0,
										marginLeft: 12,
									}}
								>
									{req.qty} {req.unit}
								</span>
							</div>
						))
				)}
			</div>

			<div
				style={{
					fontFamily: "var(--font-jetbrains), monospace",
					fontSize: 9,
					letterSpacing: "0.18em",
					textTransform: "uppercase",
					color: "var(--kas-ink-3)",
					marginTop: 20,
					marginBottom: 8,
				}}
			>
				Ubah Order · {pendingCO} pending
			</div>
			<div style={{ borderTop: "1px solid var(--kas-line-2)" }}>
				{changeOrders.filter((c) => c.status === "Menunggu").length === 0 ? (
					<div
						className="py-3"
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 10,
							color: "var(--kas-ink-4)",
						}}
					>
						Tidak ada.
					</div>
				) : (
					changeOrders
						.filter((c) => c.status === "Menunggu")
						.map((co) => (
							<div
								key={co.id}
								className="py-3"
								style={{ borderBottom: "1px solid var(--kas-line-2)" }}
							>
								<div
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 15,
										lineHeight: 1.3,
									}}
								>
									{co.description}
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
									{projects.find((p) => p.id === co.projectId)?.code} ·{" "}
									{co.date} · oleh {co.requestedBy}
								</div>
								<div
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 12,
										fontWeight: 700,
										color: "var(--kas-rust)",
										marginTop: 4,
									}}
								>
									+Rp {co.costImpact.toLocaleString("id-ID")}
								</div>
							</div>
						))
				)}
			</div>
		</div>
	);
}
