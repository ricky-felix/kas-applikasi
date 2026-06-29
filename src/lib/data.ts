// Shared domain types + pure utilities for the app.
//
// The live data collections (projects, workers, materials, requests, reports,
// change orders, cash flow, advances, allowances, registrations, proof
// submissions) are now fetched from the backend — see src/lib/api.ts and the
// hydrating hooks in src/lib/stores.ts (and src/lib/projects-store.ts).
//
// What remains here:
//   • Types consumed across the UI.
//   • Pure formatting/utility helpers (fmtIDR, fmtIDRshort, fmtPhone,
//     payrollTotal, TODAY, TODAY_SHORT).
//   • ACCOUNTS — the login lookup (auth mechanism, not display data). There is
//     no phone+PIN backend endpoint, so this stays until real auth is wired.
//   • WEBSITE_* — marketing-site analytics. No backend / analytics-query source
//     exists, so these stay static placeholders.
//
// Removed (now sourced from the backend via src/lib/api.ts + src/lib/stores.ts):
//   PROJECTS, WORKERS → useProjects()/useWorkers(); PAYROLL_MAY → usePayroll()
//   (built from /daily-attendance); BILLING → api.getBillingForProject()
//   (from /invoices); WORKER_TODAY → project.assigned (from /project-assignments).

const _DAYS_ID = [
	"Minggu",
	"Senin",
	"Selasa",
	"Rabu",
	"Kamis",
	"Jumat",
	"Sabtu",
];
const _MONTHS_ID = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

export const TODAY = (() => {
	const d = new Date();
	return `${_DAYS_ID[d.getDay()]}, ${d.getDate()} ${_MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
})();

export const TODAY_SHORT = (() => {
	const d = new Date();
	return `${d.getDate()} ${_MONTHS_ID[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
})();

export type Worker = {
	id: string;
	name: string;
	short: string;
	role: string;
	phone: string;
	rate: number;
	isKepalaProyek?: boolean;
};

export type Project = {
	id: string;
	code: string;
	slug: string;
	name: string;
	client: { name: string; phone: string; address: string };
	address: string;
	category: string;
	status: "Active" | "On Hold" | "Completed" | "Draft";
	start: string;
	endEst: string;
	progress: number;
	contractValue: number;
	paid: number;
	paymentSplits?: number;
	summary?: string;
	daysRunning?: number;
	photos?: number;
	assigned: string[];
	activity: { t: string; who: string; action: string }[];
};

export type BillingStage = {
	stage: string;
	amount: number;
	status: "Paid" | "Pending";
	date: string | null;
};

export type Account = {
	phone: string;
	pin: string;
	role: "super_admin" | "owner" | "admin" | "worker";
	name: string;
	short: string;
	workerId?: string;
};

// Login lookup (auth mechanism, not display data). Migrate to real Supabase
// auth / the users table when wiring production authentication.
export const ACCOUNTS: Account[] = [
	{
		phone: "081160000001",
		pin: "RICKY9",
		role: "super_admin",
		name: "Ricky",
		short: "RC",
	},
	{
		phone: "081260118821",
		pin: "BAPAK1",
		role: "owner",
		name: "Pak Hartono",
		short: "PH",
	},
	{
		phone: "081360010055",
		pin: "ADM088",
		role: "admin",
		name: "Bu Sari",
		short: "SR",
	},
	{
		phone: "081361220901",
		pin: "SUPAR9",
		role: "worker",
		workerId: "w1",
		name: "Pak Suparman",
		short: "SP",
	},
	{
		phone: "081361223301",
		pin: "KEPLA1",
		role: "worker",
		workerId: "w7",
		name: "Pak Anto",
		short: "AN",
	},
];

export type Material = {
	id: string;
	name: string;
	unit: string;
	unitPrice: number;
	supplier: string;
	stock: number;
	minStock: number;
	budget: number;
	used: number;
};

export function fmtIDR(n: number): string {
	return "Rp " + (n || 0).toLocaleString("id-ID");
}

export function fmtIDRshort(n: number): string {
	if (n >= 1000000)
		return "Rp " + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + " jt";
	if (n >= 1000) return "Rp " + Math.floor(n / 1000) + "rb";
	return "Rp " + n;
}

export type Expense = {
	id: string;
	projectId: string;
	date: string;
	category: "Material" | "Transport" | "Upah" | "Lain-lain";
	description: string;
	amount: number;
	by: string;
};

export type WorkReport = {
	id: string;
	projectId: string;
	workerId: string;
	workerName: string;
	workerShort: string;
	date: string;
	note: string;
	photos: number;
};

export type MaterialRequest = {
	id: string;
	projectId: string;
	workerId: string;
	workerName: string;
	materialId: string;
	materialName: string;
	qty: number;
	unit: string;
	date: string;
	status: "Pending" | "Disetujui" | "Ditolak";
	note?: string;
};

export type ChangeOrder = {
	id: string;
	projectId: string;
	date: string;
	description: string;
	costImpact: number;
	status: "Menunggu" | "Disetujui" | "Ditolak";
	requestedBy: string;
};

export type PayrollEntry = {
	workerId: string;
	name: string;
	role: string;
	rate: number;
	projects: {
		projectId: string;
		code: string;
		daysPresent: number;
		daysHalf: number;
	}[];
};

export type CashAdvance = {
	id: string;
	workerId: string;
	date: string;
	amount: number;
	note: string;
};

export type DailyAllowance = {
	id: string;
	workerId: string;
	date: string;
	type: "makan" | "bensin" | "lain-lain";
	amount: number;
};

export type CashFlowEntry = {
	date: string;
	type: "in" | "out";
	projectCode: string;
	description: string;
	amount: number;
};

export function payrollTotal(entry: PayrollEntry): number {
	return entry.projects.reduce(
		(s, p) => s + (p.daysPresent + p.daysHalf * 0.5) * entry.rate,
		0,
	);
}

// ── Website analytics (karyaagungsejati.com) ──────────────────────────────
// TODO(production): there is no backend source for marketing-site analytics.
// These remain static until a real analytics integration is added.

export type WebsiteMonthStat = {
	month: string;
	visitors: number;
	pageViews: number;
	inquiries: number;
	bounceRate: number;
};

export const WEBSITE_MONTHLY: WebsiteMonthStat[] = [
	{ month: "Jan", visitors: 142, pageViews: 487, inquiries: 3, bounceRate: 62 },
	{ month: "Feb", visitors: 168, pageViews: 531, inquiries: 4, bounceRate: 58 },
	{ month: "Mar", visitors: 201, pageViews: 644, inquiries: 6, bounceRate: 55 },
	{ month: "Apr", visitors: 189, pageViews: 612, inquiries: 5, bounceRate: 57 },
	{ month: "Mei", visitors: 234, pageViews: 751, inquiries: 8, bounceRate: 52 },
];

export type WebsitePage = { label: string; views: number; avgTime: string };

export const WEBSITE_PAGES: WebsitePage[] = [
	{ label: "Beranda", views: 234, avgTime: "1:42" },
	{ label: "Portofolio", views: 188, avgTime: "2:15" },
	{ label: "Kontak", views: 156, avgTime: "0:58" },
	{ label: "Tentang Kami", views: 89, avgTime: "1:24" },
	{ label: "Blog / Artikel", views: 44, avgTime: "2:48" },
];

export const WEBSITE_FUNNEL = {
	visitors: 234,
	inquiries: 8,
	waContacts: 5,
	projectsSigned: 1,
};

export type ProofSubmission = {
	id: string;
	projectId: string;
	stageIdx: number;
	stageLabel: string;
	amount: number;
	fileName: string;
	fileType: "image" | "pdf";
	submittedAt: string;
	note?: string;
};

export type PendingRegistration = {
	id: string;
	phone: string;
	name: string;
	gender: "L" | "P";
	jabatan: string;
	photo: string | null;
	submittedAt: string;
	status: "Pending" | "Disetujui" | "Ditolak";
};

export function fmtPhone(s: string): string {
	const d = (s || "").replace(/\D/g, "");
	if (!d) return "";
	if (d.length <= 4) return d;
	if (d.length <= 8) return d.slice(0, 4) + " " + d.slice(4);
	return d.slice(0, 4) + " " + d.slice(4, 8) + " " + d.slice(8, 12);
}
