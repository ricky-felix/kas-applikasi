"use client";
import { useState } from "react";
import {
	fmtIDRshort,
} from "@/lib/data";
import { useProjects } from "@/lib/projects-store";
import { useMaterialRequests, useChangeOrders } from "@/lib/stores";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

type MatStatus = "Pending" | "Disetujui" | "Ditolak";
type CoStatus = "Menunggu" | "Disetujui" | "Ditolak";

export default function PermintaanPage() {
	const MATERIAL_REQUESTS = useMaterialRequests();
	const CHANGE_ORDERS = useChangeOrders();
	const PROJECTS = useProjects();
	const [matFilter, setMatFilter] = useState<MatStatus | "all">("all");
	const [matStatuses, setMatStatuses] = useState<Record<string, MatStatus>>(
		() => Object.fromEntries(MATERIAL_REQUESTS.map((r) => [r.id, r.status])),
	);
	const [coStatuses, setCoStatuses] = useState<Record<string, CoStatus>>(() =>
		Object.fromEntries(CHANGE_ORDERS.map((c) => [c.id, c.status as CoStatus])),
	);

	const visibleMat = MATERIAL_REQUESTS.filter(
		(r) => matFilter === "all" || matStatuses[r.id] === matFilter,
	);
	const pendingCount = MATERIAL_REQUESTS.filter(
		(r) => matStatuses[r.id] === "Pending",
	).length;
	const coPendingCount = CHANGE_ORDERS.filter(
		(c) => coStatuses[c.id] === "Menunggu",
	).length;

	const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
		Pending: { bg: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)" },
		Disetujui: { bg: "var(--kas-moss-soft)", color: "var(--kas-moss-ink)" },
		Ditolak: { bg: "var(--kas-paper-2)", color: "var(--kas-ink-3)" },
		Menunggu: { bg: "var(--kas-ochre-soft)", color: "var(--kas-ochre-ink)" },
	};

	return (
		<div className="px-9 py-7 pb-14">
			<TopBar title="Permintaan" />
			<SectionHead
				no="11"
				kicker={`${pendingCount + coPendingCount} MENUNGGU KEPUTUSAN`}
			>
				Permintaan, <em>perlu ditindak.</em>
			</SectionHead>

			{/* Material Requests */}
			<div className="mb-10">
				<div
					className="flex items-center justify-between mb-4"
					style={{ borderTop: "1px solid var(--kas-ink)", paddingTop: 14 }}
				>
					<MonoLabel size={10}>
						Material{pendingCount > 0 ? ` · ${pendingCount} pending` : ""}
					</MonoLabel>
					<div className="flex gap-1.5">
						{(["all", "Pending", "Disetujui", "Ditolak"] as const).map((s) => {
							const active = matFilter === s;
							const count =
								s === "all"
									? MATERIAL_REQUESTS.length
									: MATERIAL_REQUESTS.filter((r) => matStatuses[r.id] === s)
											.length;
							return (
								<button
									key={s}
									type="button"
									onClick={() => setMatFilter(s)}
									style={{
										border: `1px solid ${active ? "var(--kas-ink)" : "var(--kas-line)"}`,
										background: active ? "var(--kas-ink)" : "var(--kas-paper)",
										color: active ? "var(--kas-paper)" : "var(--kas-ink-3)",
										padding: "5px 14px",
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 9,
										letterSpacing: "0.12em",
										textTransform: "uppercase",
										cursor: "pointer",
									}}
								>
									{s === "all" ? "Semua" : s} · {count}
								</button>
							);
						})}
					</div>
				</div>

				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						borderTop: "1px solid var(--kas-line)",
					}}
				>
					<thead>
						<tr
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 9,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: "var(--kas-ink-3)",
								borderBottom: "1px solid var(--kas-line)",
							}}
						>
							<th style={{ textAlign: "left", padding: "10px 14px 10px 0" }}>
								Material
							</th>
							<th style={{ textAlign: "left", padding: "10px 14px" }}>
								Pekerja
							</th>
							<th style={{ textAlign: "left", padding: "10px 14px" }}>
								Proyek
							</th>
							<th style={{ textAlign: "right", padding: "10px 14px" }}>
								Jumlah
							</th>
							<th style={{ textAlign: "center", padding: "10px 14px" }}>
								Status
							</th>
							<th style={{ textAlign: "right", padding: "10px 14px" }}>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{visibleMat.map((r) => {
							const status = matStatuses[r.id];
							const st = STATUS_STYLE[status] ?? STATUS_STYLE.Ditolak;
							const proj = PROJECTS.find((p) => p.id === r.projectId);
							return (
								<tr
									key={r.id}
									style={{ borderBottom: "1px solid var(--kas-line-2)" }}
								>
									<td style={{ padding: "14px 14px 14px 0" }}>
										<div
											style={{
												fontFamily: "var(--font-newsreader), serif",
												fontSize: 15,
											}}
										>
											{r.materialName}
										</div>
										{r.note && (
											<div
												style={{
													fontFamily: "var(--font-jetbrains), monospace",
													fontSize: 9,
													color: "var(--kas-ink-3)",
													marginTop: 2,
													letterSpacing: "0.08em",
												}}
											>
												{r.note}
											</div>
										)}
									</td>
									<td
										style={{
											padding: "14px",
											fontFamily: "var(--font-manrope), sans-serif",
											fontSize: 13,
										}}
									>
										{r.workerName}
									</td>
									<td
										style={{
											padding: "14px",
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 10,
											color: "var(--kas-ink-3)",
											letterSpacing: "0.08em",
										}}
									>
										{proj?.code}
										<br />
										<span style={{ fontSize: 9 }}>{r.date}</span>
									</td>
									<td
										style={{
											padding: "14px",
											textAlign: "right",
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 13,
											fontWeight: 600,
										}}
									>
										{r.qty}{" "}
										<span style={{ fontSize: 9, color: "var(--kas-ink-3)" }}>
											{r.unit}
										</span>
									</td>
									<td style={{ padding: "14px", textAlign: "center" }}>
										<span
											style={{
												fontFamily: "var(--font-jetbrains), monospace",
												fontSize: 9,
												letterSpacing: "0.12em",
												textTransform: "uppercase",
												background: st.bg,
												color: st.color,
												padding: "3px 8px",
												border: "1px solid var(--kas-line)",
											}}
										>
											{status}
										</span>
									</td>
									<td style={{ padding: "14px", textAlign: "right" }}>
										{status === "Pending" && (
											<div className="flex gap-1.5 justify-end">
												<button
													onClick={() =>
														setMatStatuses((p) => ({
															...p,
															[r.id]: "Disetujui",
														}))
													}
													style={{
														background: "var(--kas-ink)",
														color: "var(--kas-paper)",
														border: "none",
														padding: "5px 12px",
														fontFamily: "var(--font-jetbrains), monospace",
														fontSize: 9,
														letterSpacing: "0.12em",
														textTransform: "uppercase",
														cursor: "pointer",
													}}
												>
													Setujui
												</button>
												<button
													onClick={() =>
														setMatStatuses((p) => ({ ...p, [r.id]: "Ditolak" }))
													}
													style={{
														background: "transparent",
														border: "1px solid var(--kas-line)",
														padding: "5px 12px",
														fontFamily: "var(--font-jetbrains), monospace",
														fontSize: 9,
														letterSpacing: "0.12em",
														textTransform: "uppercase",
														cursor: "pointer",
														color: "var(--kas-ink-3)",
													}}
												>
													Tolak
												</button>
											</div>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Ubah Orders */}
			<div>
				<div
					style={{
						borderTop: "1px solid var(--kas-ink)",
						paddingTop: 14,
						marginBottom: 14,
					}}
				>
					<MonoLabel size={10}>
						Ubah Order
						{coPendingCount > 0 ? ` · ${coPendingCount} menunggu` : ""}
					</MonoLabel>
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
										color: "var(--kas-rust)",
									}}
								>
									+{fmtIDRshort(co.costImpact)}
								</div>
								{status === "Menunggu" && (
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
								)}
								{status !== "Menunggu" && <div />}
							</div>
						);
					})}
				</div>
			</div>

			<Footer />
		</div>
	);
}
