"use client";
import {
	PROJECTS,
	WORKERS,
	MATERIAL_REQUESTS,
	CHANGE_ORDERS,
	WORK_REPORTS,
	PENDING_REGISTRATIONS,
	TODAY,
	fmtIDRshort,
} from "@/lib/data";
import { Kicker, MonoLabel } from "@/components/primitives";


export default function AMHome() {
	const active = PROJECTS.filter((p) => p.status === "Active");
	const outstanding = PROJECTS.reduce(
		(s, p) => s + (p.contractValue - p.paid),
		0,
	);
	const assigned = WORKERS.filter((w) =>
		active.some((p) => p.assigned.includes(w.id)),
	);
	const pendingMat = MATERIAL_REQUESTS.filter((r) => r.status === "Pending");
	const pendingCO = CHANGE_ORDERS.filter((c) => c.status === "Menunggu");
	const totalPending = pendingMat.length + pendingCO.length;

	// Build unified activity feed
	type FeedItem = { type: "hadir" | "laporan" | "material" | "daftar"; who: string; action: string; t: string; meta?: string; };
	const feed: FeedItem[] = [
		// Clock-ins from project activity logs
		...PROJECTS.flatMap((p) =>
			p.activity.map((a) => ({
				type: "hadir" as const,
				who: a.who,
				action: a.action,
				t: a.t,
				meta: p.code,
			}))
		),
		// Daily work reports
		...WORK_REPORTS.map((r) => ({
			type: "laporan" as const,
			who: r.workerName,
			action: `Kirim laporan${r.photos > 0 ? ` · ${r.photos} foto` : ""}`,
			t: r.date,
			meta: PROJECTS.find((p) => p.id === r.projectId)?.code,
		})),
		// Material requests (all, showing status)
		...MATERIAL_REQUESTS.map((r) => ({
			type: "material" as const,
			who: r.workerName,
			action: `Minta ${r.materialName} ${r.qty} ${r.unit} · ${r.status}`,
			t: r.date,
			meta: PROJECTS.find((p) => p.id === r.projectId)?.code,
		})),
		// New registrations
		...PENDING_REGISTRATIONS.map((r) => ({
			type: "daftar" as const,
			who: r.name,
			action: `Mendaftar sebagai ${r.jabatan}`,
			t: r.submittedAt,
		})),
	];

	const TYPE_DOT: Record<FeedItem["type"], string> = {
		hadir:   "var(--kas-cobalt)",
		laporan: "var(--kas-ink)",
		material:"var(--kas-ochre)",
		daftar:  "var(--kas-moss)",
	};
	const TYPE_LABEL: Record<FeedItem["type"], string> = {
		hadir:   "Absensi",
		laporan: "Laporan",
		material:"Material",
		daftar:  "Pendaftaran",
	};

	return (
		<div className="px-5 pt-4 pb-8">
			{/* ── Header ──────────────────────────────────────────────────────── */}
			<div
				style={{
					fontFamily: "var(--font-jetbrains), monospace",
					fontSize: 9,
					color: "var(--kas-ink-3)",
					letterSpacing: "0.18em",
					textTransform: "uppercase",
					marginBottom: 4,
				}}
			>
				{TODAY}
			</div>
			<div
				style={{
					fontFamily: "var(--font-newsreader), serif",
					fontSize: 30,
					lineHeight: 1.05,
					letterSpacing: "-0.01em",
				}}
			>
				Selamat pagi,
				<br />
				<em>tim admin.</em>
			</div>

			{/* ── Stat grid ───────────────────────────────────────────────────── */}
			<div
				className="grid mt-5"
				style={{
					gridTemplateColumns: "1fr 1fr",
					border: "1px solid var(--kas-ink)",
					gap: 0,
				}}
			>
				{[
					{
						label: "Proyek Aktif",
						value: String(active.length).padStart(2, "0"),
						accent: false,
						sub: `dari ${PROJECTS.length} total`,
					},
					{
						label: "Tagihan Terbuka",
						value: fmtIDRshort(outstanding),
						accent: true,
						sub: "belum dibayar klien",
					},
					{
						label: "Pekerja Aktif",
						value: String(assigned.length).padStart(2, "0"),
						accent: false,
						sub: `dari ${WORKERS.length} terdaftar`,
					},
					{
						label: "Perlu Ditindak",
						value: String(totalPending).padStart(2, "0"),
						accent: totalPending > 0,
						sub: `${pendingMat.length} material · ${pendingCO.length} CO`,
					},
				].map((s, i) => (
					<div
						key={i}
						className="px-4 py-4"
						style={{
							borderRight: i % 2 === 0 ? "1px solid var(--kas-line)" : "none",
							borderBottom: i < 2 ? "1px solid var(--kas-line)" : "none",
						}}
					>
						<div
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 8,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: "var(--kas-ink-3)",
								marginBottom: 6,
							}}
						>
							{s.label}
						</div>
						<div
							style={{
								fontFamily: "var(--font-newsreader), serif",
								fontSize: 26,
								fontWeight: 500,
								lineHeight: 1,
								color: s.accent ? "var(--kas-rust)" : "var(--kas-ink)",
							}}
						>
							{s.value}
						</div>
						<div
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 8,
								color: "var(--kas-ink-4)",
								letterSpacing: "0.1em",
								marginTop: 4,
							}}
						>
							{s.sub}
						</div>
					</div>
				))}
			</div>

			{/* ── Active projects ─────────────────────────────────────────────── */}
			<div className="mt-6">
				<Kicker no="A" label={`${active.length} PROYEK BERJALAN`} />
				<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
					{active.map((p) => {
						const sisa = p.contractValue - p.paid;
						return (
							<div
								key={p.id}
								className="py-3.5"
								style={{ borderBottom: "1px solid var(--kas-line)" }}
							>
								<div className="flex items-baseline justify-between mb-1.5">
									<div
										style={{
											fontFamily: "var(--font-newsreader), serif",
											fontSize: 16,
											lineHeight: 1.2,
										}}
									>
										{p.name}
									</div>
									<span
										style={{
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 10,
											color: sisa > 0 ? "var(--kas-rust)" : "var(--kas-moss)",
											letterSpacing: "0.06em",
											flexShrink: 0,
											marginLeft: 8,
										}}
									>
										{sisa > 0 ? fmtIDRshort(sisa) : "Lunas"}
									</span>
								</div>
								<div
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 9,
										color: "var(--kas-ink-3)",
										letterSpacing: "0.1em",
										marginBottom: 8,
									}}
								>
									{p.code} · {p.address}
								</div>
								<div className="flex items-center gap-2.5">
									<div
										className="flex-1 relative"
										style={{ height: 5, background: "var(--kas-line-2)" }}
									>
										<div
											className="absolute inset-y-0 left-0"
											style={{
												width: `${p.progress}%`,
												background: "var(--kas-ink)",
											}}
										/>
									</div>
									<MonoLabel size={9}>{p.progress}%</MonoLabel>
									<span
										style={{
											fontFamily: "var(--font-jetbrains), monospace",
											fontSize: 8,
											color: "var(--kas-ink-4)",
											letterSpacing: "0.1em",
										}}
									>
										{p.assigned.length} pekerja
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* ── Pending items ───────────────────────────────────────────────── */}
			{totalPending > 0 && (
				<div className="mt-6">
					<Kicker no="B" label={`${totalPending} PERLU DITINDAK`} />
					<div style={{ borderTop: "1px solid var(--kas-rust)" }}>
						{pendingMat.length > 0 && (
							<div
								className="flex items-center justify-between py-3"
								style={{ borderBottom: "1px solid var(--kas-line)" }}
							>
								<div>
									<div
										style={{
											fontFamily: "var(--font-newsreader), serif",
											fontSize: 15,
										}}
									>
										Permintaan Material
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
										{pendingMat
											.map((r) => r.materialName)
											.slice(0, 2)
											.join(", ")}
										{pendingMat.length > 2
											? ` +${pendingMat.length - 2} lagi`
											: ""}
									</div>
								</div>
								<span
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 22,
										fontWeight: 500,
										color: "var(--kas-rust)",
										flexShrink: 0,
										marginLeft: 12,
									}}
								>
									{pendingMat.length}
								</span>
							</div>
						)}
						{pendingCO.length > 0 && (
							<div
								className="flex items-center justify-between py-3"
								style={{ borderBottom: "1px solid var(--kas-line)" }}
							>
								<div>
									<div
										style={{
											fontFamily: "var(--font-newsreader), serif",
											fontSize: 15,
										}}
									>
										Ubah Order
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
										{pendingCO.map((c) => c.projectId).join(", ")}
									</div>
								</div>
								<span
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 22,
										fontWeight: 500,
										color: "var(--kas-rust)",
										flexShrink: 0,
										marginLeft: 12,
									}}
								>
									{pendingCO.length}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* ── Activity feed ───────────────────────────────────────────────── */}
			<div className="mt-6">
				<Kicker no="C" label={`${feed.length} AKTIVITAS HARI INI`} />
				<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
					{feed.map((item, i) => (
						<div
							key={i}
							className="flex items-start gap-3 py-3"
							style={{ borderBottom: "1px solid var(--kas-line-2)" }}
						>
							{/* Type dot */}
							<div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0" style={{ width: 20 }}>
								<span style={{ display: "inline-block", width: 7, height: 7, background: TYPE_DOT[item.type] }} />
							</div>

							{/* Content */}
							<div style={{ flex: 1, minWidth: 0 }}>
								<div className="flex items-baseline justify-between gap-2">
									<span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
										{item.who}
									</span>
									<span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", letterSpacing: "0.1em", flexShrink: 0 }}>
										{item.t}
									</span>
								</div>
								<div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.06em" }}>
									{item.action}
								</div>
								{item.meta && (
									<div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-4)", marginTop: 2, letterSpacing: "0.1em" }}>
										{TYPE_LABEL[item.type]} · {item.meta}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

		</div>
	);
}
