const _DAYS_ID   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const _MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// daysAgo > 0 = past, daysAgo < 0 = future
function _rd(daysAgo: number, full = false): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const s = `${d.getDate()} ${_MONTHS_ID[d.getMonth()]}`;
  return full ? `${s} ${d.getFullYear()}` : s;
}

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

export const ACCOUNTS: Account[] = [
  { phone: "081160000001", pin: "RICKY9", role: "super_admin", name: "Ricky", short: "RC" },
  { phone: "081260118821", pin: "BAPAK1", role: "owner", name: "Pak Hartono", short: "PH" },
  { phone: "081360010055", pin: "ADM088", role: "admin", name: "Bu Sari", short: "SR" },
  { phone: "081361220901", pin: "SUPAR9", role: "worker", workerId: "w1", name: "Pak Suparman", short: "SP" },
  { phone: "081361223301", pin: "KEPLA1", role: "worker", workerId: "w7", name: "Pak Anto", short: "AN" },
];

export const WORKERS: Worker[] = [
  { id: "w1", name: "Pak Suparman",  short: "SP", role: "Tukang Senior",  phone: "+62 813 6122 0901", rate: 250000 },
  { id: "w2", name: "Budi Hartono",  short: "BH", role: "Tukang",         phone: "+62 813 6122 1502", rate: 200000 },
  { id: "w3", name: "Eko Prasetyo",  short: "EP", role: "Tukang",         phone: "+62 813 6122 9821", rate: 200000 },
  { id: "w4", name: "Dedi Saragih",  short: "DS", role: "Tukang Madya",   phone: "+62 813 6122 4470", rate: 220000 },
  { id: "w5", name: "Joko Sianturi", short: "JS", role: "Tukang",         phone: "+62 813 6122 7733", rate: 200000 },
  { id: "w6", name: "Rahmat Sinaga", short: "RS", role: "Helper",         phone: "+62 813 6122 8810", rate: 150000 },
  { id: "w7", name: "Pak Anto",     short: "AN", role: "Tukang Senior",  phone: "+62 813 6122 3301", rate: 400000, isKepalaProyek: true },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    code: "KAS-2026-014",
    slug: "a3f8b2c1-4d5e-4f6a-8b9c-0d1e2f3a4b5c",
    name: "Atap Beton Ruko Cemara Asri",
    client: { name: "Bpk. Wijaya", phone: "+62 812 6011 8821", address: "Cemara Asri Blok C5 No. 12, Medan" },
    address: "Cemara Asri Blok C5",
    category: "Waterproofing Atap",
    status: "Active",
    start:  _rd(12, true),
    endEst: _rd(-6, true),
    progress: 68,
    contractValue: 18500000,
    paid: 11100000,
    assigned: ["w1", "w2", "w3", "w7"],
    activity: [
      { t: "08:15", who: "Pak Suparman", action: "Check-in Hadir" },
      { t: "08:14", who: "Budi Hartono", action: "Check-in Hadir" },
      { t: "07:51", who: "Eko Prasetyo", action: "Setengah Hari" },
      { t: "Kemarin", who: "Pak Suparman", action: "Upload foto progres (3)" },
    ],
  },
  {
    id: "p2",
    code: "KAS-2026-013",
    slug: "7e6d5c4b-3a2f-4e1d-9c8b-7a6f5e4d3c2b",
    name: "Basement Apartemen Cambridge",
    client: { name: "PT. Sentra Properti", phone: "+62 811 6033 9912", address: "Jl. S. Parman No. 217, Medan" },
    address: "Jl. S. Parman",
    category: "Waterproofing Basement",
    status: "Active",
    start:  _rd(22, true),
    endEst: _rd(-17, true),
    progress: 42,
    contractValue: 87000000,
    paid: 43500000,
    assigned: ["w1", "w4", "w5", "w6", "w7"],
    activity: [
      { t: "08:20", who: "Dedi Saragih",  action: "Check-in Hadir" },
      { t: "08:18", who: "Joko Sianturi", action: "Check-in Hadir" },
    ],
  },
  {
    id: "p3",
    code: "KAS-2026-012",
    slug: "d4c3b2a1-f0e9-4d8c-b7a6-5f4e3d2c1b0a",
    name: "Kolam Renang Villa Setiabudi",
    client: { name: "Ibu Halim", phone: "+62 812 6055 1102", address: "Komplek Setiabudi Indah No. 8" },
    address: "Setiabudi Indah",
    category: "Waterproofing Kolam",
    status: "On Hold",
    start:  _rd(34, true),
    endEst: _rd(-4, true),
    progress: 80,
    contractValue: 32500000,
    paid: 22750000,
    assigned: [],
    activity: [],
  },
  {
    id: "p5",
    code: "KAS-2026-010",
    slug: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    name: "Waterproofing Gudang Logistik Mabar",
    client: { name: "CV. Maju Bersama", phone: "+62 811 6044 5566", address: "Jl. Mabar Hilir No. 45, Medan" },
    address: "Jl. Mabar Hilir",
    category: "Waterproofing Lantai",
    status: "Draft",
    start:  _rd(-17, true),
    endEst: _rd(-67, true),
    progress: 0,
    contractValue: 55000000,
    paid: 0,
    assigned: [],
    activity: [],
  },
  {
    id: "p6",
    code: "KAS-2026-009",
    slug: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    name: "Dak Beton Perumahan Griya Makmur",
    client: { name: "Bpk. Situmorang", phone: "+62 812 6055 7788", address: "Perumahan Griya Makmur Blok B No. 7" },
    address: "Griya Makmur Blok B",
    category: "Waterproofing Atap",
    status: "Active",
    start:  _rd(53, true),
    endEst: _rd(14, true),
    progress: 75,
    contractValue: 28000000,
    paid: 14000000,
    assigned: ["w3", "w6"],
    activity: [],
  },
  {
    id: "p4",
    code: "KAS-2026-011",
    slug: "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e",
    name: "Fasad Gedung Capital Building",
    client: { name: "PT. Capital Medan", phone: "+62 811 6011 2204", address: "Jl. Putri Hijau No. 1" },
    address: "Jl. Putri Hijau",
    category: "Waterproofing Fasad",
    status: "Completed",
    start:  _rd(75, true),
    endEst: _rd(26, true),
    progress: 100,
    contractValue: 145000000,
    paid: 145000000,
    assigned: [],
    activity: [],
  },
];

export const BILLING: BillingStage[] = [
  { stage: "DP (30%)",        amount: 5550000,  status: "Paid",    date: _rd(12, true) },
  { stage: "Termin 1 (30%)", amount: 5550000,  status: "Paid",    date: _rd(4, true)  },
  { stage: "Termin 2 (20%)", amount: 3700000,  status: "Pending", date: null },
  { stage: "Pelunasan (20%)",amount: 3700000,  status: "Pending", date: null },
];

export const WORKER_TODAY = {
  workerId: "w1",
  projectIds: ["p1", "p2"],
};

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

export const MATERIALS: Material[] = [
  { id: "m1", name: "Sika Top Seal-107",  unit: "kg",  unitPrice: 45000, supplier: "Toko Jaya Bangun", stock: 38,  minStock: 20, budget: 120, used: 84 },
  { id: "m2", name: "Aquaproof Original", unit: "kg",  unitPrice: 38000, supplier: "Mitra Material",   stock: 4,   minStock: 15, budget: 60,  used: 60 },
  { id: "m3", name: "Kuas Roll 9\"",      unit: "pcs", unitPrice: 25000, supplier: "Toko Jaya Bangun", stock: 12,  minStock: 5,  budget: 8,   used: 6  },
  { id: "m4", name: "Primer Coat",        unit: "ltr", unitPrice: 65000, supplier: "Mitra Material",   stock: 8,   minStock: 10, budget: 25,  used: 19 },
  { id: "m5", name: "Sika Latex",         unit: "ltr", unitPrice: 72000, supplier: "Toko Jaya Bangun", stock: 22,  minStock: 8,  budget: 30,  used: 14 },
  { id: "m6", name: "Net Fiber Glass",    unit: "m²",  unitPrice: 18000, supplier: "CV Bangunan Maju", stock: 150, minStock: 50, budget: 200, used: 80 },
];

export function fmtIDR(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export function fmtIDRshort(n: number): string {
  if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + " jt";
  if (n >= 1000) return "Rp " + Math.floor(n / 1000) + "rb";
  return "Rp " + n;
}

export type Expense = {
  id: string; projectId: string; date: string;
  category: "Material" | "Transport" | "Upah" | "Lain-lain";
  description: string; amount: number; by: string;
};

export type WorkReport = {
  id: string; projectId: string; workerId: string;
  workerName: string; workerShort: string;
  date: string; note: string; photos: number;
};

export type MaterialRequest = {
  id: string; projectId: string; workerId: string; workerName: string;
  materialId: string; materialName: string; qty: number; unit: string;
  date: string; status: "Pending" | "Disetujui" | "Ditolak"; note?: string;
};

export type ChangeOrder = {
  id: string; projectId: string; date: string;
  description: string; costImpact: number;
  status: "Menunggu" | "Disetujui" | "Ditolak"; requestedBy: string;
};

export type PayrollEntry = {
  workerId: string; name: string; role: string; rate: number;
  projects: { projectId: string; code: string; daysPresent: number; daysHalf: number }[];
};

export type CashFlowEntry = {
  date: string; type: "in" | "out";
  projectCode: string; description: string; amount: number;
};

export const EXPENSES: Expense[] = [
  { id: "e1",  projectId: "p1", date: _rd(12), category: "Material",    description: "Sika Top Seal-107 40 kg",          amount: 1800000, by: "Bu Sari" },
  { id: "e2",  projectId: "p1", date: _rd(12), category: "Transport",   description: "Ongkos mobilisasi alat",            amount: 350000,  by: "Pak Suparman" },
  { id: "e3",  projectId: "p1", date: _rd(10), category: "Material",    description: "Aquaproof Original 20 kg",          amount: 760000,  by: "Bu Sari" },
  { id: "e4",  projectId: "p1", date: _rd(6),  category: "Lain-lain",   description: "Konsumsi lapangan",                 amount: 120000,  by: "Pak Suparman" },
  { id: "e5",  projectId: "p1", date: _rd(4),  category: "Material",    description: "Net Fiber Glass 50 m²",             amount: 900000,  by: "Bu Sari" },
  { id: "e6",  projectId: "p2", date: _rd(22), category: "Material",    description: "Primer Coat 10 ltr",                amount: 650000,  by: "Bu Sari" },
  { id: "e7",  projectId: "p2", date: _rd(19), category: "Transport",   description: "Mobilisasi alat berat",             amount: 750000,  by: "Dedi Saragih" },
  { id: "e8",  projectId: "p2", date: _rd(16), category: "Material",    description: "Sika Latex 15 ltr",                 amount: 1080000, by: "Bu Sari" },
  { id: "e9",  projectId: "p2", date: _rd(9),  category: "Material",    description: "Aquaproof Original 40 kg",          amount: 1520000, by: "Bu Sari" },
  { id: "e10", projectId: "p2", date: _rd(4),  category: "Lain-lain",   description: "Konsumsi lapangan 3 hari",          amount: 360000,  by: "Dedi Saragih" },
];

export const WORK_REPORTS: WorkReport[] = [
  { id: "r1", projectId: "p1", workerId: "w1", workerName: "Pak Suparman",  workerShort: "SP", date: _rd(0), note: "Aplikasi lapisan ke-2 waterproofing selesai 25m². Area selatan sudah kering sempurna.", photos: 3 },
  { id: "r2", projectId: "p1", workerId: "w2", workerName: "Budi Hartono",  workerShort: "BH", date: _rd(0), note: "Bantu Pak Suparman di area selatan. Persiapan area utara untuk besok.", photos: 1 },
  { id: "r3", projectId: "p2", workerId: "w4", workerName: "Dedi Saragih",  workerShort: "DS", date: _rd(0), note: "Waterproofing basement lantai B1 zona 3 selesai. Tunggu curing 24 jam.", photos: 2 },
  { id: "r4", projectId: "p1", workerId: "w1", workerName: "Pak Suparman",  workerShort: "SP", date: _rd(1), note: "Primer coat zona tengah selesai. Cuaca panas, pengeringan lebih cepat dari estimasi.", photos: 2 },
  { id: "r5", projectId: "p2", workerId: "w5", workerName: "Joko Sianturi", workerShort: "JS", date: _rd(1), note: "Persiapan permukaan B2 zona 1. Ada retakan kecil, sudah ditambal dengan Sika Latex.", photos: 1 },
];

export const MATERIAL_REQUESTS: MaterialRequest[] = [
  { id: "mr1", projectId: "p1", workerId: "w1", workerName: "Pak Suparman",  materialId: "m1", materialName: "Sika Top Seal-107",  qty: 20, unit: "kg",  date: _rd(0), status: "Pending",   note: "Untuk lapisan ke-3 area utara" },
  { id: "mr2", projectId: "p2", workerId: "w4", workerName: "Dedi Saragih",  materialId: "m4", materialName: "Primer Coat",        qty: 5,  unit: "ltr", date: _rd(0), status: "Pending" },
  { id: "mr3", projectId: "p1", workerId: "w2", workerName: "Budi Hartono",  materialId: "m3", materialName: "Kuas Roll 9\"",      qty: 4,  unit: "pcs", date: _rd(1), status: "Disetujui" },
  { id: "mr4", projectId: "p2", workerId: "w5", workerName: "Joko Sianturi", materialId: "m2", materialName: "Aquaproof Original", qty: 10, unit: "kg",  date: _rd(2), status: "Disetujui" },
  { id: "mr5", projectId: "p2", workerId: "w6", workerName: "Rahmat Sinaga", materialId: "m6", materialName: "Net Fiber Glass",    qty: 30, unit: "m²",  date: _rd(3), status: "Ditolak",  note: "Stok cukup, ambil dari gudang" },
];

export const CHANGE_ORDERS: ChangeOrder[] = [
  { id: "co1", projectId: "p1", date: _rd(6),  description: "Penambahan area waterproofing dak teras samping ±15m²", costImpact: 2250000, status: "Disetujui", requestedBy: "Bpk. Wijaya" },
  { id: "co2", projectId: "p2", date: _rd(14), description: "Perluasan cakupan ke lantai B3 zona tangga darurat",    costImpact: 8500000, status: "Menunggu",  requestedBy: "PT. Sentra Properti" },
  { id: "co3", projectId: "p2", date: _rd(9),  description: "Material upgrade: Sika ke Mapei sistem zona kritis",    costImpact: 3200000, status: "Ditolak",   requestedBy: "Pak Suparman" },
];

export const PAYROLL_MAY: PayrollEntry[] = [
  { workerId: "w1", name: "Pak Suparman", role: "Tukang Senior", rate: 250000, projects: [
    { projectId: "p1", code: "KAS-2026-014", daysPresent: 10, daysHalf: 2 },
    { projectId: "p2", code: "KAS-2026-013", daysPresent: 8,  daysHalf: 0 },
  ]},
  { workerId: "w2", name: "Budi Hartono",  role: "Tukang",        rate: 200000, projects: [
    { projectId: "p1", code: "KAS-2026-014", daysPresent: 12, daysHalf: 0 },
  ]},
  { workerId: "w3", name: "Eko Prasetyo",  role: "Tukang",        rate: 200000, projects: [
    { projectId: "p1", code: "KAS-2026-014", daysPresent: 9,  daysHalf: 3 },
  ]},
  { workerId: "w4", name: "Dedi Saragih",  role: "Tukang Madya",  rate: 220000, projects: [
    { projectId: "p2", code: "KAS-2026-013", daysPresent: 18, daysHalf: 1 },
  ]},
  { workerId: "w5", name: "Joko Sianturi", role: "Tukang",        rate: 200000, projects: [
    { projectId: "p2", code: "KAS-2026-013", daysPresent: 17, daysHalf: 2 },
  ]},
  { workerId: "w6", name: "Rahmat Sinaga", role: "Helper",        rate: 150000, projects: [
    { projectId: "p2", code: "KAS-2026-013", daysPresent: 19, daysHalf: 0 },
  ]},
  { workerId: "w7", name: "Pak Anto",     role: "Tukang Senior", rate: 400000, projects: [
    { projectId: "p1", code: "KAS-2026-014", daysPresent: 12, daysHalf: 0 },
    { projectId: "p2", code: "KAS-2026-013", daysPresent: 10, daysHalf: 0 },
  ]},
];

export const CASHFLOW_MAY: CashFlowEntry[] = [
  { date: _rd(19), type: "in",  projectCode: "KAS-2026-013", description: "DP Termin I (50%)",                         amount: 43500000 },
  { date: _rd(12), type: "in",  projectCode: "KAS-2026-014", description: "DP (30%)",                                   amount: 5550000  },
  { date: _rd(12), type: "out", projectCode: "KAS-2026-014", description: "Material Sika + ongkos mobilisasi",          amount: 2150000  },
  { date: _rd(10), type: "out", projectCode: "KAS-2026-014", description: "Aquaproof Original 20 kg",                   amount: 760000   },
  { date: _rd(9),  type: "out", projectCode: "KAS-2026-013", description: "Aquaproof Original 40 kg",                   amount: 1520000  },
  { date: _rd(6),  type: "out", projectCode: "KAS-2026-014", description: "Konsumsi lapangan",                          amount: 120000   },
  { date: _rd(4),  type: "in",  projectCode: "KAS-2026-014", description: "Termin 1 (30%)",                             amount: 5550000  },
  { date: _rd(4),  type: "out", projectCode: "KAS-2026-014", description: "Net Fiber Glass 50m²",                       amount: 900000   },
  { date: _rd(4),  type: "out", projectCode: "KAS-2026-013", description: "Konsumsi lapangan + Sika Latex",             amount: 1440000  },
  { date: _rd(0),  type: "out", projectCode: "PENGGAJIAN",   description: "Upah bulan ini (parsial) – 7 pekerja",      amount: 28570000 },
];

export function payrollTotal(entry: PayrollEntry): number {
  return entry.projects.reduce((s, p) => s + (p.daysPresent + p.daysHalf * 0.5) * entry.rate, 0);
}

// ── Website analytics (karyaagungsejati.com) mock data ────────────────────

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
  { label: "Beranda",        views: 234, avgTime: "1:42" },
  { label: "Portofolio",     views: 188, avgTime: "2:15" },
  { label: "Kontak",         views: 156, avgTime: "0:58" },
  { label: "Tentang Kami",   views: 89,  avgTime: "1:24" },
  { label: "Blog / Artikel", views: 44,  avgTime: "2:48" },
];

export const WEBSITE_FUNNEL = {
  visitors:       234,
  inquiries:      8,
  waContacts:     5,
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

export const PROOF_SUBMISSIONS: ProofSubmission[] = [
  {
    id: "ps1", projectId: "p1", stageIdx: 2,
    stageLabel: "Termin 2 (20%)", amount: 3700000,
    fileName: "bukti-transfer-termin2-cemara.jpg", fileType: "image",
    submittedAt: _rd(0) + ", 09:14",
    note: "Transfer dari BCA rek 081xxx. Mohon dikonfirmasi.",
  },
  {
    id: "ps2", projectId: "p2", stageIdx: 1,
    stageLabel: "Termin 1 (30%)", amount: 26100000,
    fileName: "bukti-bca-cambridge-t1.pdf", fileType: "pdf",
    submittedAt: _rd(0) + ", 11:32",
  },
];

export function fmtPhone(s: string): string {
  const d = (s || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 4) return d;
  if (d.length <= 8) return d.slice(0, 4) + " " + d.slice(4);
  return d.slice(0, 4) + " " + d.slice(4, 8) + " " + d.slice(8, 12);
}
