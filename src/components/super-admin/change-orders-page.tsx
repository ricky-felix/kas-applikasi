"use client";
import { useState } from "react";
import { CHANGE_ORDERS, PROJECTS, fmtIDRshort } from "@/lib/data";
import { TopBar, SectionHead, Footer } from "./shared";

type CoStatus = "Menunggu" | "Disetujui" | "Ditolak";

export default function ChangeOrdersPage() {
	const [coStatuses, setCoStatuses] = useState<Record<string, CoStatus>>(() =>
		Object.fromEntries(CHANGE_ORDERS.map((c) => [c.id, c.status as CoStatus])),
	);

	const pendingCount = CHANGE_ORDERS.filter(
		(c) => coStatuses[c.id] === "Menunggu",
	).length;

	const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
		Menunggu: { bg: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)" },
		Disetujui: { bg: "var(--kas-moss-soft)", color: "var(--kas-moss-ink)" },
		Ditolak: { bg: "var(--kas-paper-2)", color: "var(--kas-ink-3)" },
	};

	return (
		<div className="px-9 py-7 pb-14">
			<TopBar title="Ubah Order" />
			<SectionHead no="11b" kicker={`${pendingCount} MENUNGGU KEPUTUSAN`}>
				Ubah Order, <em>perlu ditindak.</em>
			</SectionHead>

			<div
				style={{
					borderTop: "1px solid var(--kas-ink)",
					paddingTop: 14,
					marginBottom: 4,
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-jetbrains), monospace",
						fontSize: 9,
						letterSpacing: "0.14em",
						textTransform: "uppercase",
						color: "var(--kas-ink-3)",
					}}
				>
					{CHANGE_ORDERS.length} Ubah Order
				</div>
			</div>

			<div style={{ borderTop: "1px solid var(--kas-line)" }}>
				{CHANGE_ORDERS.map((co) => {
					const status = coStatuses[co.id];
					const st = STATUS_STYLE[status] ?? STATUS_STYLE.Ditolak;
					const proj = PROJECTS.find((p) => p.id === co.projectId);
					return (
						<div
							key={co.id}
							className="grid gap-5 items-center py-4"
							style={{
								gridTemplateColumns: "1fr auto auto",
								borderBottom: "1px solid var(--kas-line)",
							}}
						>
							<div>
								<div
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 17,
										lineHeight: 1.3,
									}}
								>
									{co.description}
								</div>
								<div
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 10,
										color: "var(--kas-ink-3)",
										marginTop: 4,
										letterSpacing: "0.1em",
									}}
								>
									{co.date} · {co.requestedBy} · {proj?.code}
								</div>
								<span
									className="inline-block mt-2"
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 9,
										letterSpacing: "0.12em",
										textTransform: "uppercase",
										background: st.bg,
										color: st.color,
										padding: "2px 7px",
										border: "1px solid var(--kas-line)",
									}}
								>
									{status}
								</span>
							</div>
							<div
								style={{
									fontFamily: "var(--font-newsreader), serif",
									fontSize: 20,
										color: status === "Ditolak" ? "var(--kas-ink-3)" : "var(--kas-rust)",
									textDecoration: status === "Ditolak" ? "line-through" : "none",
								}}
							>
								+{fmtIDRshort(co.costImpact)}
							</div>
							{status === "Menunggu" ? (
								<div className="flex gap-1.5">
									<button
										onClick={() =>
											setCoStatuses((p) => ({ ...p, [co.id]: "Disetujui" }))
										}
										style={{
											background: "var(--kas-ink)",
											color: "var(--kas-paper)",
											border: "none",
											padding: "8px 16px",
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 10,
											letterSpacing: "0.14em",
											textTransform: "uppercase",
											cursor: "pointer",
										}}
									>
										Setujui
									</button>
									<button
										onClick={() =>
											setCoStatuses((p) => ({ ...p, [co.id]: "Ditolak" }))
										}
										style={{
											background: "transparent",
											border: "1px solid var(--kas-line)",
											padding: "8px 14px",
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 10,
											letterSpacing: "0.14em",
											textTransform: "uppercase",
											cursor: "pointer",
											color: "var(--kas-ink-3)",
										}}
									>
										Tolak
									</button>
								</div>
							) : (
								<div />
							)}
						</div>
					);
				})}
			</div>

			<Footer />
		</div>
	);
}
