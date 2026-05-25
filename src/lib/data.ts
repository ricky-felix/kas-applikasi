export const TODAY = "Senin, 24 Mei 2026";
export const TODAY_SHORT = "24 MEI 2026";

export type Worker = {
  id: string;
  name: string;
  short: string;
  role: string;
  phone: string;
  rate: number;
};

export type Project = {
  id: string;
  code: string;
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
  { phone: "081361221502", pin: "BUDI22", role: "worker", workerId: "w2", name: "Budi Hartono", short: "BH" },
];

export const WORKERS: Worker[] = [
  { id: "w1", name: "Pak Suparman",  short: "SP", role: "Tukang Senior",  phone: "+62 813 6122 0901", rate: 250000 },
  { id: "w2", name: "Budi Hartono",  short: "BH", role: "Tukang",         phone: "+62 813 6122 1502", rate: 200000 },
  { id: "w3", name: "Eko Prasetyo",  short: "EP", role: "Tukang",         phone: "+62 813 6122 9821", rate: 200000 },
  { id: "w4", name: "Dedi Saragih",  short: "DS", role: "Tukang Madya",   phone: "+62 813 6122 4470", rate: 220000 },
  { id: "w5", name: "Joko Sianturi", short: "JS", role: "Tukang",         phone: "+62 813 6122 7733", rate: 200000 },
  { id: "w6", name: "Rahmat Sinaga", short: "RS", role: "Helper",         phone: "+62 813 6122 8810", rate: 150000 },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    code: "KAS-2026-014",
    name: "Atap Beton Ruko Cemara Asri",
    client: { name: "Bpk. Wijaya", phone: "+62 812 6011 8821", address: "Cemara Asri Blok C5 No. 12, Medan" },
    address: "Cemara Asri Blok C5",
    category: "Waterproofing Atap",
    status: "Active",
    start: "12 Mei 2026",
    endEst: "30 Mei 2026",
    progress: 68,
    contractValue: 18500000,
    paid: 11100000,
    assigned: ["w1", "w2", "w3"],
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
    name: "Basement Apartemen Cambridge",
    client: { name: "PT. Sentra Properti", phone: "+62 811 6033 9912", address: "Jl. S. Parman No. 217, Medan" },
    address: "Jl. S. Parman",
    category: "Waterproofing Basement",
    status: "Active",
    start: "02 Mei 2026",
    endEst: "10 Jun 2026",
    progress: 42,
    contractValue: 87000000,
    paid: 43500000,
    assigned: ["w1", "w4", "w5", "w6"],
    activity: [
      { t: "08:20", who: "Dedi Saragih", action: "Check-in Hadir" },
      { t: "08:18", who: "Joko Sianturi", action: "Check-in Hadir" },
    ],
  },
  {
    id: "p3",
    code: "KAS-2026-012",
    name: "Kolam Renang Villa Setiabudi",
    client: { name: "Ibu Halim", phone: "+62 812 6055 1102", address: "Komplek Setiabudi Indah No. 8" },
    address: "Setiabudi Indah",
    category: "Waterproofing Kolam",
    status: "On Hold",
    start: "20 Apr 2026",
    endEst: "28 Mei 2026",
    progress: 80,
    contractValue: 32500000,
    paid: 22750000,
    assigned: [],
    activity: [],
  },
  {
    id: "p4",
    code: "KAS-2026-011",
    name: "Fasad Gedung Capital Building",
    client: { name: "PT. Capital Medan", phone: "+62 811 6011 2204", address: "Jl. Putri Hijau No. 1" },
    address: "Jl. Putri Hijau",
    category: "Waterproofing Fasad",
    status: "Completed",
    start: "10 Mar 2026",
    endEst: "28 Apr 2026",
    progress: 100,
    contractValue: 145000000,
    paid: 145000000,
    assigned: [],
    activity: [],
  },
];

export const BILLING: BillingStage[] = [
  { stage: "DP (30%)",        amount: 5550000,  status: "Paid",    date: "12 Mei 2026" },
  { stage: "Termin 1 (30%)", amount: 5550000,  status: "Paid",    date: "20 Mei 2026" },
  { stage: "Termin 2 (20%)", amount: 3700000,  status: "Pending", date: null },
  { stage: "Pelunasan (20%)",amount: 3700000,  status: "Pending", date: null },
];

export const WORKER_TODAY = {
  workerId: "w1",
  projectIds: ["p1", "p2"],
};

export const MATERIALS = [
  { name: "Sika Top Seal-107",  unit: "kg",  budget: 120, used: 84, supplier: "Toko Jaya Bangun" },
  { name: "Aquaproof Original", unit: "kg",  budget: 60,  used: 60, supplier: "Mitra Material" },
  { name: "Kuas Roll 9\"",      unit: "pcs", budget: 8,   used: 6,  supplier: "Toko Jaya Bangun" },
  { name: "Primer Coat",        unit: "ltr", budget: 25,  used: 19, supplier: "Mitra Material" },
];

export function fmtIDR(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export function fmtIDRshort(n: number): string {
  if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + " jt";
  if (n >= 1000) return "Rp " + Math.floor(n / 1000) + "rb";
  return "Rp " + n;
}

export function fmtPhone(s: string): string {
  const d = (s || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 4) return d;
  if (d.length <= 8) return d.slice(0, 4) + " " + d.slice(4);
  return d.slice(0, 4) + " " + d.slice(4, 8) + " " + d.slice(8, 12);
}
