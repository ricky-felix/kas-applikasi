"use client";
import { useState } from "react";
import { Account, MATERIALS, MATERIAL_REQUESTS, CHANGE_ORDERS } from "@/lib/data";
import { KasBrandMark } from "@/components/primitives";
import { EditProfileOverlay } from "@/components/profile/edit-profile";
import Dashboard from "@/components/super-admin/dashboard";
import ProjectsList from "@/components/super-admin/projects-list";
import ProjectDetail from "@/components/super-admin/project-detail";
import TeamPage from "@/components/super-admin/team-page";
import BillingPage from "@/components/super-admin/billing-page";
import MaterialPage from "@/components/super-admin/material-page";
import FinancePage from "@/components/super-admin/finance-page";
import TimelinePage from "@/components/super-admin/timeline-page";
import UsersPage from "@/components/super-admin/users-page";
import AnalyticsPage from "@/components/super-admin/analytics-page";
import LaporanPage from "@/components/super-admin/laporan-page";
import MaterialRequestsPage from "@/components/super-admin/material-requests-page";
import ChangeOrdersPage from "@/components/super-admin/change-orders-page";
import ContactsPage from "@/components/super-admin/contacts-page";
import NotificationsPage from "@/components/super-admin/notifications-page";

// Badge count for the sidebar — operational items that need action
const NOTIF_COUNT =
	MATERIALS.filter((m) => m.stock < m.minStock).length +
	MATERIAL_REQUESTS.filter((r) => r.status === "Pending").length +
	CHANGE_ORDERS.filter((c) => c.status === "Menunggu").length;

type Page =
	| "dashboard"
	| "projects"
	| "project"
	| "team"
	| "billing"
	| "users"
	| "material"
	| "finance"
	| "timeline"
	| "laporan"
	| "permintaan-material"
	| "change-order"
	| "analytics"
	| "contacts"
	| "notifikasi";

function Sidebar({
	view,
	setView,
	session,
	onLogout,
}: {
	view: { page: Page };
	setView: (v: { page: Page }) => void;
	session: { name: string; short: string; phone?: string };
	onLogout: () => void;
}) {
	const [showEdit, setShowEdit] = useState(false);
	const [profile, setProfile] = useState<{ name: string; phone: string; photo: string | null }>({ name: session.name, phone: session.phone ?? "", photo: null });
	const GROUPS = [
		{
			label: "Operasional",
			items: [
				{ k: "dashboard",           label: "Dashboard" },
				{ k: "notifikasi",          label: "Notifikasi" },
				{ k: "projects",            label: "Proyek" },
				{ k: "timeline",            label: "Timeline" },
				{ k: "laporan",             label: "Laporan Harian" },
				{ k: "permintaan-material", label: "Permintaan Material" },
				{ k: "change-order",        label: "Ubah Order" },
			],
		},
		{
			label: "Tim & Sumber Daya",
			items: [
				{ k: "team",     label: "Pekerja Lapangan" },
				{ k: "material", label: "Material" },
			],
		},
		{
			label: "Keuangan",
			items: [
				{ k: "billing", label: "Tagihan" },
				{ k: "finance", label: "Keuangan" },
			],
		},
		{
			label: "Administrasi",
			items: [
				{ k: "users",     label: "Pengguna" },
				{ k: "contacts",  label: "Direktori Kontak" },
				{ k: "analytics", label: "Analitik" },
			],
		},
	] as const;

	const [openGroups, setOpenGroups] = useState<Set<string>>(
		() => new Set(GROUPS.map((g) => g.label)),
	);
	const toggleGroup = (label: string) =>
		setOpenGroups((prev) => {
			const s = new Set(prev);
			s.has(label) ? s.delete(label) : s.add(label);
			return s;
		});

	return (
		<aside
			className="flex flex-col py-5"
			style={{
				background: "var(--kas-ink)",
				color: "var(--kas-paper)",
				borderRight: "1px solid var(--kas-ink)",
				minWidth: 200,
			}}
		>
			<div className="flex items-center gap-3 mb-6 px-4">
				<KasBrandMark size={28} />
				<div className="flex flex-col leading-none">
					<span
						style={{
							fontFamily: "var(--font-newsreader), serif",
							fontSize: 18,
							lineHeight: 1,
							fontWeight: 500,
						}}
					>
						KAS<span style={{ color: "var(--kas-cobalt)" }}>.</span>
					</span>
					<span
						style={{
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 8,
							letterSpacing: "0.22em",
							color: "rgba(255,255,255,0.5)",
							marginTop: 3,
							textTransform: "uppercase",
						}}
					>
						Super Admin
					</span>
				</div>
			</div>

			<nav className="flex flex-col flex-1 overflow-y-auto">
				{GROUPS.map((group) => {
					const isOpen = openGroups.has(group.label);
					const groupActive = group.items.some(
						(it) =>
							view.page === it.k ||
							(it.k === "projects" && view.page === "project"),
					);
					return (
						<div key={group.label}>
							<button
								type="button"
								onClick={() => toggleGroup(group.label)}
								className="w-full flex items-center justify-between px-4 py-2"
								style={{
									border: "none",
									background:
										groupActive && !isOpen
											? "rgba(255,255,255,0.06)"
											: "transparent",
									cursor: "pointer",
									borderTop: "1px solid rgba(255,255,255,0.1)",
								}}
							>
								<span
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 8,
										letterSpacing: "0.2em",
										textTransform: "uppercase",
										color: groupActive
											? "rgba(255,255,255,0.8)"
											: "rgba(255,255,255,0.35)",
									}}
								>
									{group.label}
								</span>
								<span
									style={{
										fontFamily: "var(--font-jetbrains), monospace",
										fontSize: 8,
										color: "rgba(255,255,255,0.3)",
									}}
								>
									{isOpen ? "▾" : "▸"}
								</span>
							</button>

							{isOpen &&
								group.items.map((it) => {
									const active =
										view.page === it.k ||
										(it.k === "projects" && view.page === "project");
									const isNotif = it.k === "notifikasi";
									return (
										<button
											key={it.k}
											onClick={() => setView({ page: it.k as Page })}
											className="w-full flex items-center justify-between pl-6 pr-4 py-2.5 text-left cursor-pointer"
											style={{
												border: "none",
												background: active
													? "rgba(255,255,255,0.1)"
													: "transparent",
												color: active
													? "var(--kas-paper)"
													: "rgba(255,255,255,0.6)",
												fontFamily: "var(--font-manrope), sans-serif",
												fontSize: 13,
												fontWeight: active ? 600 : 400,
												borderBottom: "1px solid rgba(255,255,255,0.06)",
											}}
										>
											<span>{it.label}</span>
											<span className="flex items-center gap-1.5">
												{isNotif && NOTIF_COUNT > 0 && (
													<span
														style={{
															minWidth: 18,
															height: 18,
															background: "var(--kas-rust)",
															color: "#fff",
															fontFamily: "var(--font-jetbrains), monospace",
															fontSize: 9,
															fontWeight: 700,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															padding: "0 4px",
															letterSpacing: 0,
														}}
													>
														{NOTIF_COUNT}
													</span>
												)}
												{active && (
													<span
														style={{
															display: "inline-block",
															width: 5,
															height: 5,
															background: "var(--kas-cobalt)",
														}}
													/>
												)}
											</span>
										</button>
									);
								})}
						</div>
					);
				})}
			</nav>

			<div className="mt-auto pt-6">
				<div
					style={{
						fontFamily: "var(--font-jetbrains), monospace",
						fontSize: 9,
						letterSpacing: "0.2em",
						color: "rgba(255,255,255,0.4)",
						textTransform: "uppercase",
						marginBottom: 10,
					}}
				>
					Sesi
				</div>
				<div
					className="flex items-center gap-2.5 py-2.5"
					style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
				>
					<div
						className="grid place-items-center"
						style={{
							width: 28,
							height: 28,
							background: "var(--kas-cobalt)",
							color: "var(--kas-paper)",
							fontFamily: "var(--font-newsreader), serif",
							fontSize: 12,
							fontWeight: 600,
							overflow: "hidden",
						}}
					>
						{profile.photo ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={profile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
							) : (
								session.short[0]
							)}
					</div>
					<div className="flex-1">
						<div style={{ fontSize: 13, fontWeight: 600 }}>{profile.name}</div>
						<button
							type="button"
							onClick={() => setShowEdit(true)}
							style={{
								border: "none",
								background: "transparent",
								padding: 0,
								cursor: "pointer",
								fontFamily: "var(--font-jetbrains), monospace",
								fontSize: 9,
								letterSpacing: "0.16em",
								color: "rgba(255,255,255,0.5)",
								textTransform: "uppercase",
							}}
						>
							Super Admin · Edit
						</button>
					</div>
					<button
						onClick={onLogout}
						style={{
							border: "1px solid rgba(255,255,255,0.3)",
							background: "transparent",
							color: "rgba(255,255,255,0.7)",
							padding: "4px 8px",
							cursor: "pointer",
							fontFamily: "var(--font-jetbrains), monospace",
							fontSize: 9,
							letterSpacing: "0.16em",
							textTransform: "uppercase",
						}}
					>
						Out
					</button>
				</div>
			</div>

			{showEdit && (
				<EditProfileOverlay
					name={profile.name}
					phone={profile.phone}
					role="Super Admin"
					allowPhoto
					photo={profile.photo}
					onCancel={() => setShowEdit(false)}
					onSave={(next) => { setProfile(next); setShowEdit(false); }}
				/>
			)}
		</aside>
	);
}

export default function SuperAdmin({
	session,
	onLogout,
}: {
	session: Account | null;
	onLogout: () => void;
}) {
	const [view, setView] = useState<{ page: Page; projectId?: string }>({
		page: "dashboard",
	});
	const sess = session || { name: "Ricky", short: "RC" };

	return (
		<div
			className="h-full grid overflow-hidden"
			style={{
				gridTemplateColumns: "220px 1fr",
				background: "var(--kas-paper)",
				fontFamily: "var(--font-manrope), sans-serif",
				color: "var(--kas-ink)",
			}}
		>
			<style>{`
				@media (max-width: 767px) {
					.sa-phone-wall { display: flex !important; }
					.sa-main-content { display: none !important; }
				}
			`}</style>
			<div className="sa-phone-wall fixed inset-0 z-[999] flex-col items-center justify-center px-8 text-center" style={{ background: "var(--kas-paper)", display: "none" }}>
				<div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 48, lineHeight: 1, marginBottom: 16 }}>⊘</div>
				<div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 12 }}>
					Layar terlalu kecil.
				</div>
				<div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)", letterSpacing: "0.1em", lineHeight: 1.8, maxWidth: 280 }}>
					Halaman Super Admin hanya dapat diakses melalui tablet atau desktop. Buka kembali di layar yang lebih besar.
				</div>
				<div className="mt-8 px-5 py-2.5" style={{ border: "1px solid var(--kas-line)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-4)" }}>
					Min. 768px
				</div>
				<button
					onClick={onLogout}
					className="mt-6"
					style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 28px", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}
				>
					Keluar
				</button>
			</div>
			<div className="sa-main-content h-full grid overflow-hidden" style={{ gridTemplateColumns: "220px 1fr", gridColumn: "1 / -1" }}>
				<Sidebar view={view} setView={setView} session={sess} onLogout={onLogout} />
				<main className="overflow-y-auto">
					{view.page === "dashboard" && (
						<Dashboard
							goProject={(id: string) => setView({ page: "project", projectId: id })}
							goProjects={() => setView({ page: "projects" })}
						/>
					)}
					{view.page === "projects" && (
						<ProjectsList goProject={(id) => setView({ page: "project", projectId: id })} />
					)}
					{view.page === "project" && (
						<ProjectDetail id={view.projectId!} back={() => setView({ page: "projects" })} />
					)}
					{view.page === "team"                && <TeamPage />}
					{view.page === "billing"             && <BillingPage />}
					{view.page === "material"            && <MaterialPage />}
					{view.page === "finance"             && <FinancePage />}
					{view.page === "timeline"            && <TimelinePage />}
					{view.page === "laporan"             && <LaporanPage />}
					{view.page === "permintaan-material" && <MaterialRequestsPage />}
					{view.page === "change-order"        && <ChangeOrdersPage />}
					{view.page === "users"               && <UsersPage />}
					{view.page === "contacts"            && <ContactsPage />}
					{view.page === "analytics"           && <AnalyticsPage />}
					{view.page === "notifikasi"          && <NotificationsPage />}
				</main>
			</div>
		</div>
	);
}
