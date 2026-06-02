import {
	PROJECTS,
	PAYROLL_MAY,
	MATERIALS,
	WORKERS,
	WORK_REPORTS,
	MATERIAL_REQUESTS,
	CHANGE_ORDERS,
	WEBSITE_MONTHLY,
	WEBSITE_PAGES,
	WEBSITE_FUNNEL,
	payrollTotal,
	fmtIDRshort,
} from "@/lib/data";
import type { AnalyticsData } from "./types";

const WORKING_DAYS = 24;

export function getMockData(): AnalyticsData {
	const employees = PAYROLL_MAY.map((pw) => {
		const totalDays = pw.projects.reduce(
			(s, p) => s + p.daysPresent + p.daysHalf * 0.5,
			0,
		);
		const halfDays = pw.projects.reduce((s, p) => s + p.daysHalf, 0);
		const wages = payrollTotal(pw);
		const utilPct = (totalDays / WORKING_DAYS) * 100;
		const reports = WORK_REPORTS.filter(
			(r) => r.workerId === pw.workerId,
		).length;
		const requests = MATERIAL_REQUESTS.filter(
			(r) => r.workerId === pw.workerId,
		).length;
		const revCredit = pw.projects.reduce((s, proj) => {
			const project = PROJECTS.find((p) => p.id === proj.projectId);
			if (!project) return s;
			const projAllDays = PAYROLL_MAY.reduce((sum, w2) => {
				const p2 = w2.projects.find((x) => x.projectId === proj.projectId);
				return p2 ? sum + p2.daysPresent + p2.daysHalf * 0.5 : sum;
			}, 0);
			return (
				s +
				(projAllDays > 0
					? project.paid *
						((proj.daysPresent + proj.daysHalf * 0.5) / projAllDays)
					: 0)
			);
		}, 0);
		const revPerDay = totalDays > 0 ? revCredit / totalDays : 0;
		const worker = WORKERS.find((w) => w.id === pw.workerId);
		return {
			workerId: pw.workerId,
			name: pw.name,
			workerRole: worker?.role ?? "",
			rate: pw.rate,
			totalDays,
			halfDays,
			wages,
			utilPct,
			reports,
			requests,
			revPerDay,
		};
	}).sort((a, b) => b.utilPct - a.utilPct);

	const pendingMR = MATERIAL_REQUESTS.filter((r) => r.status === "Pending");
	const pendingCO = CHANGE_ORDERS.filter((co) => co.status === "Menunggu");

	return {
		website: {
			monthly: WEBSITE_MONTHLY,
			pages: WEBSITE_PAGES,
			funnel: WEBSITE_FUNNEL,
		},
		posthog: {
			totalSessions: 47,
			totalEvents: 312,
			activeUsers: 5,
			byRole: [
				{
					role: "worker",
					label: "Pekerja",
					users: 2,
					sessions: 31,
					events: 248,
					topEvent: "Absen masuk",
				},
				{
					role: "admin",
					label: "Administrasi",
					users: 1,
					sessions: 9,
					events: 44,
					topEvent: "Setujui material",
				},
				{
					role: "owner",
					label: "Pemilik",
					users: 1,
					sessions: 5,
					events: 14,
					topEvent: "Buka dashboard",
				},
				{
					role: "super_admin",
					label: "Super Admin",
					users: 1,
					sessions: 2,
					events: 6,
					topEvent: "Buka analitik produk",
				},
			],
			topEvents: [
				{ event: "worker_clock_in", label: "Absen masuk", count: 92 },
				{ event: "worker_clock_out", label: "Absen keluar", count: 89 },
				{ event: "worker_photo_uploaded", label: "Foto dikirim", count: 47 },
				{
					event: "worker_report_submitted",
					label: "Laporan dikirim",
					count: 18,
				},
				{
					event: "admin_material_approved",
					label: "Material disetujui",
					count: 11,
				},
			],
		},
		employees,
		features: [
			{ label: "Laporan kerja dikirim", value: WORK_REPORTS.length, cap: 20 },
			{
				label: "Permintaan material",
				value: MATERIAL_REQUESTS.length,
				cap: 10,
			},
			{ label: "Ubah Order", value: CHANGE_ORDERS.length, cap: 6 },
		],
		pendingItems: [
			...pendingMR.map((r) => ({
				kind: "material" as const,
				id: r.id,
				materialName: r.materialName,
				workerName: r.workerName,
				qty: r.qty,
				unit: r.unit,
				date: r.date,
			})),
			...pendingCO.map((co) => ({
				kind: "change_order" as const,
				id: co.id,
				description: co.description,
				costImpact: co.costImpact,
				requestedBy: co.requestedBy,
				date: co.date,
			})),
		],
		lowStockMaterials: MATERIALS.filter((m) => m.stock <= m.minStock).map(
			(m) => ({
				name: m.name,
				stock: m.stock,
				minStock: m.minStock,
				unit: m.unit,
				supplier: m.supplier,
			}),
		),
	};
}

export { fmtIDRshort };
