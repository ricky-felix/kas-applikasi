"use client";
import { useState } from "react";
import {
	PROJECTS,
	WORKERS,
	WORK_REPORTS,
	CHANGE_ORDERS,
	fmtIDRshort,
} from "@/lib/data";
import { MonoLabel } from "@/components/primitives";
import { TopBar, SectionHead, Footer } from "./shared";

// ── Date helpers ────────────────────────────────────────────────────────────
const BULAN: Record<string, number> = {
	Jan: 1, Januari: 1,
	Feb: 2, Februari: 2,
	Mar: 3, Maret: 3,
	Apr: 4, April: 4,
	Mei: 5,
	Jun: 6, Juni: 6,
	Jul: 7, Juli: 7,
	Agu: 8, Agustus: 8,
	Sep: 9, September: 9,
	Okt: 10, Oktober: 10,
	Nov: 11, November: 11,
	Des: 12, Desember: 12,
};

function parseDate(str: string): Date | null {
	if (!str || str === "—") return null;
	const parts = str.split(" ");
	if (parts.length < 3) return null;
	const [day, month, year] = parts;
	const m = BULAN[month];
	return m ? new Date(parseInt(year), m - 1, parseInt(day)) : null;
}

function daysBetween(a: Date, b: Date) {
	return Math.round((b.getTime() - a.getTime()) / 86400000);
}

// ── Timeline bounds: 1 Mar 2026 → 31 Jul 2026 ──────────────────────────────
const T_START = new Date(2026, 2, 1); // 1 Mar
const T_END = new Date(2026, 6, 31); // 31 Jul
const T_DAYS = daysBetween(T_START, T_END); // 153

const TODAY = new Date();
const todayPct = (daysBetween(T_START, TODAY) / T_DAYS) * 100;

const MONTHS = ["Mar", "Apr", "Mei", "Jun", "Jul"];

function toPct(date: Date | null) {
	if (!date) return null;
	return (daysBetween(T_START, date) / T_DAYS) * 100;
}

// ── Status helpers ──────────────────────────────────────────────────────────
const BAR_COLOR: Record<string, string> = {
	Active: "var(--kas-cobalt)",
	"On Hold": "var(--kas-ochre)",
	Completed: "var(--kas-moss)",
	Draft: "var(--kas-ink-3)",
	Overdue: "var(--kas-rust)",
};

function getProjectState(p: (typeof PROJECTS)[0]) {
	const end = parseDate(p.endEst);
	if (p.status === "Completed") return "Completed";
	if (end && end < TODAY && p.progress < 100) return "Overdue";
	if (end && daysBetween(TODAY, end) <= 7 && p.progress < 90) return "AtRisk";
	return p.status;
}

const ALL_STATUSES = [
	"Active",
	"On Hold",
	"Completed",
	"Draft",
	"Overdue",
] as const;
type BarStatus = (typeof ALL_STATUSES)[number];

export default function TimelinePage() {
	const [coStatuses, setCoStatuses] = useState<Record<string, string>>(() =>
		Object.fromEntries(CHANGE_ORDERS.map((c) => [c.id, c.status])),
	);
	const [visibleStatuses, setVisibleStatuses] = useState<Set<BarStatus>>(
		new Set(ALL_STATUSES),
	);

	const toggleStatus = (s: BarStatus) =>
		setVisibleStatuses((prev) => {
			const next = new Set(prev);
			next.has(s) ? next.delete(s) : next.add(s);
			return next;
		});

	const pendingOrders = CHANGE_ORDERS.filter(
		(c) => coStatuses[c.id] === "Menunggu",
	);

	// Build bar data from real project dates
	const bars = PROJECTS.map((p) => {
		const start = parseDate(p.start);
		const end = parseDate(p.endEst);
		const left = start ? Math.max(0, toPct(start)!) : null;
		const right = end ? Math.min(100, toPct(end)!) : null;
		const width =
			left !== null && right !== null ? Math.max(right - left, 1) : null;
		const state = getProjectState(p);

		// Workers on this project
		const assigned = WORKERS.filter((w) => p.assigned.includes(w.id));

		// Latest work report
		const reports = WORK_REPORTS.filter((r) => r.projectId === p.id);
		const latest = reports.sort((a, b) => b.id.localeCompare(a.id))[0];

		return { ...p, left, width, state, assigned, latest };
	}).filter((b) => b.left !== null && b.width !== null);

	return (
		<div className="px-9 py-7 pb-14">
			<TopBar title="Timeline" />
			<SectionHead no="07" kicker={`${PROJECTS.length} PROYEK`}>
				Timeline, <em>visual.</em>
			</SectionHead>

			{/* Legend + filter checkboxes */}
			<div
				className="mb-6 flex gap-3 flex-wrap items-center"
				style={{
					fontFamily: "var(--font-jetbrains), monospace",
					fontSize: 9,
					letterSpacing: "0.14em",
					textTransform: "uppercase",
				}}
			>
				{(
					[
						{ k: "Active", label: "Aktif", color: BAR_COLOR.Active },
						{ k: "On Hold", label: "Ditahan", color: BAR_COLOR["On Hold"] },
						{ k: "Completed", label: "Selesai", color: BAR_COLOR.Completed },
						{ k: "Overdue", label: "Terlambat", color: BAR_COLOR.Overdue },
						{ k: "Draft", label: "Draf", color: BAR_COLOR.Draft },
					] as { k: BarStatus; label: string; color: string }[]
				).map(({ k, label, color }) => {
					const on = visibleStatuses.has(k);
					return (
						<button
							key={k}
							type="button"
							onClick={() => toggleStatus(k)}
							className="flex items-center gap-2 px-2.5 py-1.5"
							style={{
								border: `1px solid ${on ? "var(--kas-line)" : "var(--kas-line-2)"}`,
								background: on ? "var(--kas-paper-2)" : "transparent",
								cursor: "pointer",
								opacity: on ? 1 : 0.4,
							}}
						>
							<span
								className="inline-block"
								style={{
									width: 12,
									height: 4,
									background: on ? color : "var(--kas-line)",
								}}
							/>
							<span
								style={{ color: on ? "var(--kas-ink-2)" : "var(--kas-ink-4)" }}
							>
								{label}
							</span>
							<span
								style={{
									color: on ? "var(--kas-cobalt)" : "var(--kas-ink-4)",
									fontSize: 8,
								}}
							>
								{on ? "✓" : "○"}
							</span>
						</button>
					);
				})}
				<div className="flex items-center gap-2 ml-2">
					<span
						className="inline-block"
						style={{ width: 2, height: 14, background: "var(--kas-rust)" }}
					/>
					<span style={{ color: "var(--kas-rust)", fontWeight: 600 }}>
						Hari ini · {TODAY.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
					</span>
				</div>
			</div>

			{/* Gantt chart */}
			<div
				className="relative"
				style={{
					borderTop: "1px solid var(--kas-ink)",
					borderBottom: "1px solid var(--kas-ink)",
				}}
			>
				{/* Single today line spanning full chart height */}
				<div
					className="absolute top-0 bottom-0"
					style={{
						left: `calc(280px + (100% - 280px) * ${todayPct / 100})`,
						width: 2,
						background: "var(--kas-rust)",
						zIndex: 10,
						pointerEvents: "none",
					}}
				/>

				{/* Month header */}
				<div
					className="flex"
					style={{
						borderBottom: "1px solid var(--kas-line)",
						height: 32,
						marginLeft: 280,
					}}
				>
					{MONTHS.map((m, i) => (
						<div
							key={m}
							className="flex-1 flex items-center px-2"
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 9,
								letterSpacing: "0.18em",
								textTransform: "uppercase",
								color: "var(--kas-ink-3)",
								borderRight:
									i < MONTHS.length - 1
										? "1px solid var(--kas-line-2)"
										: "none",
							}}
						>
							{m}
						</div>
					))}
				</div>

				{/* Project rows */}
				{bars
					.filter((b) => visibleStatuses.has(b.state as BarStatus))
					.map((b, i) => {
						const isOverdue = b.state === "Overdue";
						const isAtRisk = b.state === "AtRisk";
						const barColor = isOverdue
							? BAR_COLOR.Overdue
							: (BAR_COLOR[b.status] ?? "var(--kas-ink-3)");

						return (
							<div
								key={b.id}
								className="grid"
								style={{
									gridTemplateColumns: "280px 1fr",
									borderBottom:
										i < bars.length - 1 ? "1px solid var(--kas-line)" : "none",
									minHeight: 64,
								}}
							>
								{/* Label column */}
								<div
									className="pr-5 py-3"
									style={{ borderRight: "1px solid var(--kas-line)" }}
								>
									<div className="flex items-start gap-2">
										<div
											style={{
												fontFamily: "var(--font-newsreader), serif",
												fontSize: 14,
												lineHeight: 1.2,
												flex: 1,
											}}
										>
											{b.name}
										</div>
										{isOverdue && (
											<span
												style={{
													fontFamily: "var(--font-jetbrains), monospace",
													fontSize: 8,
													letterSpacing: "0.14em",
													textTransform: "uppercase",
													color: "var(--kas-paper)",
													background: "var(--kas-rust)",
													padding: "2px 5px",
													flexShrink: 0,
												}}
											>
												TERLAMBAT
											</span>
										)}
										{isAtRisk && !isOverdue && (
											<span
												style={{
													fontFamily: "var(--font-jetbrains), monospace",
													fontSize: 8,
													letterSpacing: "0.14em",
													textTransform: "uppercase",
													color: "var(--kas-ochre-ink)",
													background: "var(--kas-ochre-soft)",
													border: "1px solid var(--kas-ochre)",
													padding: "2px 5px",
													flexShrink: 0,
												}}
											>
												MEPET
											</span>
										)}
									</div>
									<div
										style={{
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 9,
											color: "var(--kas-ink-3)",
											marginTop: 2,
											letterSpacing: "0.1em",
										}}
									>
										{b.code} · {b.progress}%
									</div>
									{/* Staff */}
									{b.assigned.length > 0 && (
										<div className="flex gap-1 mt-2 flex-wrap">
											{b.assigned.map((w) => (
												<span
													key={w.id}
													style={{
														fontFamily: "var(--font-jetbrains), monospace",
														fontSize: 8,
														letterSpacing: "0.08em",
														background: w.isKepalaProyek
															? "var(--kas-ink)"
															: "var(--kas-paper-2)",
														color: w.isKepalaProyek
															? "var(--kas-paper)"
															: "var(--kas-ink-3)",
														border: "1px solid var(--kas-line)",
														padding: "1px 5px",
													}}
												>
													{w.short}
												</span>
											))}
										</div>
									)}
									{/* Latest report */}
									{b.latest && (
										<div
											style={{
												fontFamily: "var(--font-jetbrains), monospace",
												fontSize: 8,
												color: "var(--kas-cobalt)",
												marginTop: 3,
												letterSpacing: "0.08em",
											}}
										>
											↳ {b.latest.date} ·{" "}
											{b.latest.workerName.split(" ").slice(-1)[0]}
											{b.latest.photos > 0 ? ` · ${b.latest.photos} foto` : ""}
										</div>
									)}
								</div>

								{/* Bar column */}
								<div className="relative" style={{ height: 64 }}>
									{/* Gantt bar */}
									<div
										className="absolute"
										style={{
											left: `${b.left}%`,
											width: `${b.width}%`,
											top: "50%",
											height: 22,
											marginTop: -11,
											background: barColor,
											opacity: b.status === "Completed" ? 0.65 : 1,
											zIndex: 1,
										}}
									/>

									{/* End-date overdue marker */}
									{isOverdue &&
										(() => {
											const endPct = toPct(parseDate(b.endEst));
											return endPct !== null ? (
												<div
													className="absolute top-0 bottom-0"
													style={{
														left: `${endPct}%`,
														width: 2,
														background: "var(--kas-rust)",
														opacity: 0.5,
														zIndex: 3,
													}}
												/>
											) : null;
										})()}
								</div>
							</div>
						);
					})}
			</div>

			{/* Ubah Orders */}
			<div className="mt-6">
				<SectionHead no="02" kicker="Ubah Order MENUNGGU">
					Perubahan scope, <em>perlu keputusan.</em>
				</SectionHead>
				<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
					{pendingOrders.length === 0 && (
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
							Tidak ada Ubah Order pending.
						</div>
					)}
					{pendingOrders.map((co) => (
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
									{co.date} · {co.requestedBy} ·{" "}
									{PROJECTS.find((p) => p.id === co.projectId)?.code}
								</div>
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
							<div className="flex gap-1.5">
								<button
									onClick={() =>
										setCoStatuses((p) => ({ ...p, [co.id]: "Disetujui" }))
									}
									style={{
										background: "var(--kas-ink)",
										color: "var(--kas-paper)",
										border: "none",
										padding: "8px 14px",
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
						</div>
					))}
				</div>
			</div>

			<Footer />
		</div>
	);
}
