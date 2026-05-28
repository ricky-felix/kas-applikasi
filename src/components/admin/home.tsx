"use client";
import {
	PROJECTS,
	WORKERS,
	MATERIAL_REQUESTS,
	CHANGE_ORDERS,
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

	// Workers grouped by active project
	const projectAttendance = active.map((p) => ({
		project: p,
		workers: WORKERS.filter((w) => p.assigned.includes(w.id)),
	}));

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

			{/* ── Attendance by project ────────────────────────────────────────── */}
			<div className="mt-6">
				<Kicker no="C" label="ABSENSI HARI INI" />
				<div style={{ borderTop: "1px solid var(--kas-ink)" }}>
					{projectAttendance.map(({ project, workers }) => (
						<div
							key={project.id}
							className="py-3"
							style={{ borderBottom: "1px solid var(--kas-line-2)" }}
						>
							<div
								style={{
									fontFamily: "var(--font-jetbrains), monospace",
									fontSize: 9,
									color: "var(--kas-ink-3)",
									letterSpacing: "0.12em",
									textTransform: "uppercase",
									marginBottom: 7,
								}}
							>
								{project.address}
							</div>
							<div className="flex flex-wrap gap-1.5">
								{workers.map((w) => (
									<div
										key={w.id}
										className="flex items-center gap-2 px-2.5 py-2"
										style={{
											border: "1px solid var(--kas-line)",
											background: "var(--kas-paper-2)",
										}}
									>
										<span
											className="inline-block flex-shrink-0"
											style={{ width: 5, height: 5, background: "var(--kas-cobalt)" }}
										/>
										<div>
											<div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
												{w.name}
											</div>
											<div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>
												{w.isKepalaProyek ? `${w.role} · Kepala Proyek` : w.role}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

		</div>
	);
}
