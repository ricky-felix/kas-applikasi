"use client";
import { useState } from "react";
import { Account } from "@/lib/data";
import { useWorkers } from "@/lib/stores";
import { useProjects } from "@/lib/projects-store";
import { Toast, MobileTopBar } from "@/components/primitives";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import HomeTab from "@/components/worker/home/home-tab";
import MaterialTab from "@/components/worker/material-tab";
import ProfileTab from "@/components/worker/profile-tab";
import AMAttend from "@/components/admin/attend";
import { LaporanStepper } from "@/components/worker/home/laporan-stepper";

export type LemburType = "malam" | "pagi";
type Session = {
	id: number;
	projectId: string;
	in: string;
	out: string | null;
	lemburType?: LemburType;
};
type Tab = "home" | "material" | "tim" | "profile";

function nowStr() {
	return new Date().toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Regular worker: 3 tabs — Riwayat lives inside Profil
const WORKER_TABS = [
	{ k: "home", n: "01", l: "Hadir", icon: "✓" },
	{ k: "material", n: "02", l: "Material", icon: "□" },
	{ k: "profile", n: "03", l: "Profil", icon: "○" },
] as const;

// Kepala proyek: 4 tabs — Riwayat lives inside Profil
const KEPALA_TABS = [
	{ k: "home", n: "01", l: "Hadir", icon: "✓" },
	{ k: "material", n: "02", l: "Material", icon: "□" },
	{ k: "tim", n: "03", l: "Tim", icon: "◈" },
	{ k: "profile", n: "04", l: "Profil", icon: "○" },
] as const;

const TAB_LABELS: Record<Tab, string> = {
	home: "01 · HARI INI",
	material: "02 · MATERIAL",
	tim: "03 · TIM · ABSENSI",
	profile: "04 · PROFIL",
};

export default function WorkerScreen({
	session,
	onLogout,
}: {
	session: Account | null;
	onLogout: () => void;
}) {
	const WORKERS = useWorkers();
	const PROJECTS = useProjects();
	const me =
		WORKERS.find((w) => w.id === session?.workerId) || WORKERS[0];
	const isKepalaProyek = !me?.isKepalaProyek;
	// Projects this worker is assigned to (assigned ids come from the backend
	// project-assignments, populated in api.getProjects).
	const myProjects = PROJECTS.filter((p) =>
		me?.id ? p.assigned.includes(me.id) : false,
	);

	const [tab, setTab] = useState<Tab>("home");
	const [state, setState] = useState({
		sessions: [] as Session[],
		absentProjects: [] as { id: string; reason: string }[],
		selectedProjectId: myProjects[0]?.id || "",
		photos: 0,
		overtime: 0,
	});
	const [snack, setSnack] = useState<string | null>(null);
	const [showLaporanStepper, setShowLaporanStepper] = useState(false);

	const toast = (msg: string) => {
		setSnack(msg);
		setTimeout(() => setSnack(null), 2400);
	};

	const { showWarning, dismissWarning } = useInactivityLogout(onLogout);

	const activeSession = state.sessions.find((s) => s.out === null);

	// Workers hydrate asynchronously; until `me` resolves there is nothing to render.
	if (!me) {
		return (
			<div
				className="h-full flex items-center justify-center"
				style={{
					background: "var(--kas-paper)",
					color: "var(--kas-ink-3)",
					fontFamily: "var(--font-jetbrains), monospace",
					fontSize: 11,
					letterSpacing: "0.2em",
					textTransform: "uppercase",
				}}
			>
				Memuat…
			</div>
		);
	}

	const doClockOut = () => {
		if (!activeSession) return;
		const proj = PROJECTS.find((p) => p.id === activeSession.projectId);
		const isLembur = !!activeSession.lemburType;
		setState((s) => ({
			...s,
			sessions: s.sessions.map((x) =>
				x.id === activeSession.id ? { ...x, out: nowStr() } : x,
			),
		}));
		toast(
			isLembur ? "Lembur selesai." : `Pulang · ${proj?.address || proj?.name}`,
		);
	};

	const clockIn = (pid: string, lemburType?: LemburType) => {
		if (activeSession) {
			toast("Pulang dulu dari proyek aktif.");
			return;
		}
		const proj = PROJECTS.find((p) => p.id === pid);
		setState((s) => ({
			...s,
			sessions: [
				...s.sessions,
				{
					id: Date.now(),
					projectId: pid,
					in: nowStr(),
					out: null,
					...(lemburType ? { lemburType } : {}),
				},
			],
		}));
		toast(
			lemburType === "malam"
				? "Lembur malam dimulai."
				: lemburType === "pagi"
					? "Lembur pagi dimulai."
					: `Masuk · ${proj?.address || proj?.name}`,
		);
	};

	// Only kepala proyek reaches clock-out (pekerja is read-only).
	// Clock-out always goes through the laporan (harian + gambar) flow.
	const clockOut = () => {
		if (!activeSession) return;
		setShowLaporanStepper(true);
	};

	const handleLaporanSubmit = () => {
		setShowLaporanStepper(false);
		doClockOut();
		toast("Laporan terkirim. Selamat pulang!");
	};

	const markProjectAbsent = (pid: string, reason: string) => {
		setState((s) => ({
			...s,
			absentProjects: [...s.absentProjects, { id: pid, reason }],
		}));
		toast(`Tidak hadir · ${reason}`);
	};

	return (
		<div
			className="h-full flex flex-col relative overflow-hidden"
			style={{
				background: "var(--kas-paper)",
				color: "var(--kas-ink)",
				fontFamily: "var(--font-manrope), sans-serif",
			}}
		>
			<MobileTopBar tabLabel={TAB_LABELS[tab]} />

			<div className="flex-1 overflow-y-auto">
				{tab === "home" && (
					<HomeTab
						myProjects={myProjects}
						me={me}
						isKepalaProyek={isKepalaProyek}
						state={state}
						setState={setState}
						clockIn={clockIn}
						clockOut={clockOut}
						markProjectAbsent={markProjectAbsent}
						activeSession={activeSession}
						toast={toast}
					/>
				)}
				{tab === "material" && (
					<MaterialTab
						myProjects={myProjects}
						isKepalaProyek={isKepalaProyek}
						toast={toast}
					/>
				)}
				{tab === "tim" && <AMAttend toast={toast} />}
				{tab === "profile" && <ProfileTab me={me} onLogout={onLogout} />}
			</div>

			{(() => {
				const tabs = isKepalaProyek ? KEPALA_TABS : WORKER_TABS;
				return (
					<nav
						className="grid"
						style={{
							gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
							borderTop: "1px solid var(--kas-ink)",
							background: "var(--kas-paper)",
						}}
					>
						{tabs.map((t, i) => (
							<button
								key={t.k}
								type="button"
								onClick={() => setTab(t.k as Tab)}
								className="flex flex-col items-center gap-0.5 py-2.5 pb-3 cursor-pointer"
								style={{
									border: "none",
									borderRight:
										i < tabs.length - 1 ? "1px solid var(--kas-line)" : "none",
									background: tab === t.k ? "var(--kas-ink)" : "transparent",
									color: tab === t.k ? "var(--kas-paper)" : "var(--kas-ink-2)",
								}}
							>
								<span
									style={{
										fontFamily: "var(--font-newsreader), serif",
										fontSize: 16,
										lineHeight: 1,
									}}
								>
									{t.icon}
								</span>
								<span
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 8,
										letterSpacing: "0.1em",
										textTransform: "uppercase",
									}}
								>
									{t.l}
								</span>
							</button>
						))}
					</nav>
				);
			})()}

			{snack && <Toast message={snack} />}

			{showLaporanStepper && (
				<LaporanStepper
					project={myProjects.find((p) => p.id === activeSession?.projectId)}
					workerName={me.name}
					onSubmit={handleLaporanSubmit}
					onCancel={() => setShowLaporanStepper(false)}
					activeLemburType={activeSession?.lemburType}
				/>
			)}

			{showWarning && (
				<div
					className="absolute inset-x-0 bottom-16 mx-4 z-50 p-4 flex items-center justify-between gap-3"
					style={{
						background: "var(--kas-ink)",
						color: "var(--kas-paper)",
						border: "1px solid var(--kas-rust)",
					}}
				>
					<div>
						<div
							style={{
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 9,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: "var(--kas-rust)",
								marginBottom: 2,
							}}
						>
							Sesi hampir berakhir
						</div>
						<div
							style={{
								fontFamily: "var(--font-newsreader), serif",
								fontSize: 14,
							}}
						>
							Anda akan keluar otomatis dalam 1 menit.
						</div>
					</div>
					<button
						type="button"
						onClick={dismissWarning}
						style={{
							border: "1px solid var(--kas-paper)",
							background: "transparent",
							color: "var(--kas-paper)",
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 9,
							letterSpacing: "0.14em",
							textTransform: "uppercase",
							padding: "6px 10px",
							cursor: "pointer",
							flexShrink: 0,
						}}
					>
						Tetap
					</button>
				</div>
			)}
		</div>
	);
}
