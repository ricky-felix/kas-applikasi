"use client";
import { useState } from "react";
import { fmtIDR } from "@/lib/data";
import { useChangeOrders } from "@/lib/stores";
import { MonoLabel } from "@/components/primitives";
import { SectionHead } from "../shared";

export function ChangeOrdersTab({ projectId }: { projectId: string }) {
	const CHANGE_ORDERS = useChangeOrders();
	const orders = CHANGE_ORDERS.filter((c) => c.projectId === projectId);
	const [coStatuses, setCoStatuses] = useState<Record<string, string>>(() =>
		Object.fromEntries(CHANGE_ORDERS.map((c) => [c.id, c.status])),
	);
	const approved = orders
		.filter((c) => coStatuses[c.id] === "Disetujui")
		.reduce((s, c) => s + c.costImpact, 0);
	const pending = orders
		.filter((c) => coStatuses[c.id] === "Menunggu")
		.reduce((s, c) => s + c.costImpact, 0);

	return (
		<div>
			<div
				className="grid mb-7"
				style={{
					gridTemplateColumns: "1fr 1fr 1fr",
					borderTop: "1px solid var(--kas-ink)",
					borderBottom: "1px solid var(--kas-ink)",
				}}
			>
				{[
					{
						l: "Total Ubah Order",
						v: String(orders.length).padStart(2, "0"),
						accent: false,
					},
					{ l: "Nilai Disetujui", v: fmtIDR(approved), accent: false },
					{
						l: "Menunggu Persetujuan",
						v: fmtIDR(pending),
						accent: pending > 0,
					},
				].map((s, i) => (
					<div
						key={i}
						className="py-5 px-5"
						style={{
							borderRight: i < 2 ? "1px solid var(--kas-line)" : "none",
						}}
					>
						<MonoLabel size={10}>{s.l}</MonoLabel>
						<div
							style={{
								fontFamily: "var(--font-newsreader), serif",
								fontSize: 28,
								marginTop: 8,
								color: s.accent ? "var(--kas-ochre)" : "var(--kas-ink)",
							}}
						>
							{s.v}
						</div>
					</div>
				))}
			</div>
			<SectionHead no="01" kicker={`${orders.length} PERUBAHAN`}>
				Ubah Order, <em>tercatat.</em>
			</SectionHead>
			<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
				{orders.map((co, i) => {
					const status = coStatuses[co.id];
					return (
						<div
							key={co.id}
							className="grid gap-5 items-start py-5"
							style={{
								gridTemplateColumns: "40px 1fr auto auto auto",
								borderBottom: "1px solid var(--kas-line)",
							}}
						>
							<span
								style={{
									fontFamily: "var(--font-newsreader), serif",
									fontStyle: "italic",
									fontSize: 24,
									color: "var(--kas-ink-3)",
								}}
							>
								{["I", "II", "III"][i]}
							</span>
							<div>
								<div
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 18,
										lineHeight: 1.3,
										marginBottom: 4,
									}}
								>
									{co.description}
								</div>
								<div
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 10,
										color: "var(--kas-ink-3)",
										letterSpacing: "0.1em",
									}}
								>
									{co.date} · {co.requestedBy}
								</div>
							</div>
							<div
								style={{
									textAlign: "right",
									fontFamily: "var(--font-jetbrains), monospace",
									fontSize: 14,
									color:
										status === "Ditolak"
											? "var(--kas-ink-3)"
											: co.costImpact > 0
												? "var(--kas-rust)"
												: "var(--kas-ink)",
									textDecoration:
										status === "Ditolak" ? "line-through" : "none",
								}}
							>
								+{fmtIDR(co.costImpact)}
							</div>
							<span
								style={{
									padding: "4px 10px",
									fontFamily: "var(--font-jetbrains), monospace",
									fontSize: 9,
									letterSpacing: "0.16em",
									textTransform: "uppercase",
									background:
										status === "Disetujui"
											? "var(--kas-moss-soft)"
											: status === "Menunggu"
												? "var(--kas-ochre-soft)"
												: "var(--kas-paper-2)",
									color:
										status === "Disetujui"
											? "var(--kas-moss-ink)"
											: status === "Menunggu"
												? "var(--kas-ochre-ink)"
												: "var(--kas-ink-3)",
									whiteSpace: "nowrap",
								}}
							>
								{status}
							</span>
							<div className="flex gap-1.5">
								{status === "Menunggu" && (
									<>
										<button
											type="button"
											onClick={() =>
												setCoStatuses((p) => ({ ...p, [co.id]: "Disetujui" }))
											}
											style={{
												background: "var(--kas-ink)",
												color: "var(--kas-paper)",
												border: "none",
												padding: "6px 10px",
												fontFamily: "var(--font-jetbrains), monospace",
												fontSize: 9,
												letterSpacing: "0.14em",
												textTransform: "uppercase",
												cursor: "pointer",
											}}
										>
											Setujui
										</button>
										<button
											type="button"
											onClick={() =>
												setCoStatuses((p) => ({ ...p, [co.id]: "Ditolak" }))
											}
											style={{
												background: "transparent",
												border: "1px solid var(--kas-line)",
												padding: "6px 10px",
												fontFamily: "var(--font-jetbrains), monospace",
												fontSize: 9,
												letterSpacing: "0.14em",
												textTransform: "uppercase",
												cursor: "pointer",
												color: "var(--kas-ink-3)",
											}}
										>
											Tolak
										</button>
									</>
								)}
							</div>
						</div>
					);
				})}
				{orders.length === 0 && (
					<div
						className="py-8 text-center"
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 10,
							color: "var(--kas-ink-3)",
							letterSpacing: "0.14em",
							textTransform: "uppercase",
						}}
					>
						Tidak ada Ubah Order.
					</div>
				)}
			</div>
		</div>
	);
}
