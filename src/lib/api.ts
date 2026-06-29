// Production data-access layer.
//
// Talks to the NestJS backend (see backend/) at NEXT_PUBLIC_API_URL with the
// global "/api/v1" prefix. The backend's data model differs from the UI types
// in ./data.ts (different field names, UUID ids, decimal-as-string money,
// different status enums), so each fetch is paired with an adapter that maps a
// backend record onto the existing frontend type. This keeps the UI components
// unchanged while their data comes from the real database.

import type {
  Project, Worker, Material, MaterialRequest, WorkReport, ChangeOrder,
  Expense, CashFlowEntry, CashAdvance, DailyAllowance, PendingRegistration,
  ProofSubmission, PayrollEntry, BillingStage,
} from "./data";

const BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "") +
  "/api/v1";

const _MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtDateID(iso: string | null | undefined, full = true): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const s = `${d.getDate()} ${_MONTHS_ID[d.getMonth()]}`;
  return full ? `${s} ${d.getFullYear()}` : s;
}

function num(v: string | number | null | undefined): number {
  return Number(v) || 0;
}

function shortFromName(name: string): string {
  return (
    name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() ||
    "??"
  );
}

// ── Raw backend shapes (only the fields we consume) ─────────────────────────

type BackendProject = {
  id: string; title: string; description: string | null;
  clientName: string; clientPhone: string | null; location: string | null;
  status: string; startDate: string | null; endDate: string | null;
  plannedBudget: string; actualBudget: string; createdAt: string;
};

type BackendFieldWorker = {
  id: string; specialization: string | null; status: string; salaryPerDay: string;
  user?: { id: string; name: string; email: string | null; phone: string | null };
};

type BackendMaterial = {
  id: string; name: string; unit: string; unitPrice: string;
  quantityOnHand: string; reorderLevel: string; status: string;
  supplierName: string | null;
};

type BackendMaterialRequest = {
  id: string; projectId: string; materialId: string | null; materialName: string;
  quantity: string; unit: string; status: string; requestedBy: string;
  notes: string | null; createdAt: string;
  project?: { id: string; title: string };
  requester?: { id: string; name: string };
};

type BackendFieldReport = {
  id: string; projectId: string; reportedBy: string; reportDate: string;
  workDescription: string | null; createdAt: string;
  reporter?: { id: string; name: string };
  attachments?: unknown[];
};

type BackendChangeOrder = {
  id: string; projectId: string; title: string; description: string | null;
  amount: string; status: string; createdAt: string;
  requester?: { id: string; name: string };
};

type BackendCashFlow = {
  id: string; type: string; category: string; amount: string;
  description: string | null; transactionDate: string;
};

type BackendCashAdvance = {
  id: string; workerId: string; amount: string; reason: string | null;
  advanceDate: string; worker?: { id: string; name: string };
};

type BackendDailyAllowance = {
  id: string; workerId: string; allowanceType: string; amount: string;
  allowanceDate: string;
};

type BackendWorkerRegistration = {
  id: string; fullName: string; phone: string; specialization: string | null;
  status: string; createdAt: string;
};

type BackendDailyAttendance = {
  id: string; projectId: string; workerId: string; attendanceDate: string;
  status: string; hoursWorked: string | null;
};

type BackendProjectAssignment = {
  id: string; projectId: string; workerId: string | null; teamId: string | null;
};

type BackendInvoiceLineItem = {
  description: string; quantity: string; unitPrice: string; lineTotal: string;
};

type BackendInvoice = {
  id: string; projectId: string | null; invoiceNumber: string;
  invoiceDate: string; dueDate: string; status: string;
  subtotal: string; totalAmount: string; paidAmount: string;
  lineItems?: BackendInvoiceLineItem[];
};

// ── Status mappings ─────────────────────────────────────────────────────────

function mapProjectStatus(s: string): Project["status"] {
  switch (s) {
    case "in_progress": return "Active";
    case "completed":   return "Completed";
    case "on_hold":     return "On Hold";
    default:            return "Draft"; // approved | draft | pending | cancelled
  }
}

// pending → "Pending"/"Menunggu", approved → "Disetujui", rejected → "Ditolak"
function mapReqStatus(s: string): MaterialRequest["status"] {
  switch (s) {
    case "approved": return "Disetujui";
    case "rejected": return "Ditolak";
    default:         return "Pending";
  }
}
function mapCoStatus(s: string): ChangeOrder["status"] {
  switch (s) {
    case "approved": return "Disetujui";
    case "rejected": return "Ditolak";
    default:         return "Menunggu";
  }
}
function mapRegStatus(s: string): PendingRegistration["status"] {
  switch (s) {
    case "approved": return "Disetujui";
    case "rejected": return "Ditolak";
    default:         return "Pending";
  }
}
function mapAllowanceType(s: string): DailyAllowance["type"] {
  const l = (s || "").toLowerCase();
  if (l.includes("makan")) return "makan";
  if (l.includes("bensin") || l.includes("transport")) return "bensin";
  return "lain-lain";
}
function mapExpenseCategory(category: string): Expense["category"] {
  switch (category) {
    case "labor":     return "Upah";
    case "material":  return "Material";
    case "transport": return "Transport";
    default:          return "Lain-lain";
  }
}

// ── Adapters ────────────────────────────────────────────────────────────────

export function adaptProject(p: BackendProject): Project {
  const status = mapProjectStatus(p.status);
  const year = new Date(p.createdAt).getFullYear() || new Date().getFullYear();
  return {
    id: p.id,
    code: `KAS-${year}-${p.id.slice(0, 4).toUpperCase()}`,
    slug: p.id,
    name: p.title,
    client: { name: p.clientName, phone: p.clientPhone || "—", address: p.location || "—" },
    address: p.location || "—",
    category: p.description || "Umum",
    status,
    start: fmtDateID(p.startDate),
    endEst: fmtDateID(p.endDate),
    progress: status === "Completed" ? 100 : 0,
    contractValue: num(p.plannedBudget),
    paid: num(p.actualBudget),
    summary: p.description || undefined,
    assigned: [],
    activity: [],
  };
}

export function adaptWorker(w: BackendFieldWorker): Worker {
  const name = w.user?.name || "Tanpa Nama";
  return {
    id: w.id,
    name,
    short: shortFromName(name),
    role: w.specialization || "Tukang",
    phone: w.user?.phone || "—",
    rate: num(w.salaryPerDay),
  };
}

export function adaptMaterial(m: BackendMaterial): Material {
  return {
    id: m.id,
    name: m.name,
    unit: m.unit,
    unitPrice: num(m.unitPrice),
    supplier: m.supplierName || "—",
    stock: num(m.quantityOnHand),
    minStock: num(m.reorderLevel),
    // Backend tracks stock, not per-period budget/usage. Default to 0 until the
    // backend exposes consumption figures.
    budget: 0,
    used: 0,
  };
}

export function adaptMaterialRequest(r: BackendMaterialRequest): MaterialRequest {
  return {
    id: r.id,
    projectId: r.projectId,
    workerId: r.requestedBy,
    workerName: r.requester?.name || "Tim Lapangan",
    materialId: r.materialId || "",
    materialName: r.materialName,
    qty: num(r.quantity),
    unit: r.unit,
    date: fmtDateID(r.createdAt, false),
    status: mapReqStatus(r.status),
    note: r.notes || undefined,
  };
}

export function adaptWorkReport(r: BackendFieldReport): WorkReport {
  const name = r.reporter?.name || "Tim Lapangan";
  return {
    id: r.id,
    projectId: r.projectId,
    workerId: r.reportedBy,
    workerName: name,
    workerShort: shortFromName(name),
    date: fmtDateID(r.reportDate, false),
    note: r.workDescription || "",
    photos: Array.isArray(r.attachments) ? r.attachments.length : 0,
  };
}

export function adaptChangeOrder(c: BackendChangeOrder): ChangeOrder {
  return {
    id: c.id,
    projectId: c.projectId,
    date: fmtDateID(c.createdAt, false),
    description: c.description || c.title,
    costImpact: num(c.amount),
    status: mapCoStatus(c.status),
    requestedBy: c.requester?.name || "—",
  };
}

export function adaptCashFlow(c: BackendCashFlow): CashFlowEntry {
  return {
    date: fmtDateID(c.transactionDate, false),
    type: c.type === "income" ? "in" : "out",
    projectCode: c.category || "—",
    description: c.description || "—",
    amount: num(c.amount),
  };
}

export function adaptExpense(c: BackendCashFlow): Expense {
  return {
    id: c.id,
    projectId: "",
    date: fmtDateID(c.transactionDate, false),
    category: mapExpenseCategory(c.category),
    description: c.description || "—",
    amount: num(c.amount),
    by: "—",
  };
}

export function adaptCashAdvance(a: BackendCashAdvance): CashAdvance {
  return {
    id: a.id,
    workerId: a.workerId,
    date: fmtDateID(a.advanceDate, false),
    amount: num(a.amount),
    note: a.reason || "",
  };
}

export function adaptDailyAllowance(a: BackendDailyAllowance): DailyAllowance {
  return {
    id: a.id,
    workerId: a.workerId,
    date: fmtDateID(a.allowanceDate, false),
    type: mapAllowanceType(a.allowanceType),
    amount: num(a.amount),
  };
}

export function adaptRegistration(r: BackendWorkerRegistration): PendingRegistration {
  return {
    id: r.id,
    phone: r.phone,
    name: r.fullName,
    gender: "L",
    jabatan: r.specialization || "Tukang",
    photo: null,
    submittedAt: fmtDateID(r.createdAt),
    status: mapRegStatus(r.status),
  };
}

// ── Derived builders (payroll, billing) ─────────────────────────────────────

// A single attendance record counts as a full day (present/hadir/default), a
// half day (half_day/setengah), or nothing (absent/izin/sakit/cuti/alpha).
function attendanceWeight(status: string): { full: number; half: number } {
  const s = (status || "present").toLowerCase();
  if (s.includes("half") || s.includes("setengah")) return { full: 0, half: 1 };
  if (
    s.includes("absent") || s.includes("alpha") || s.includes("izin") ||
    s.includes("sick") || s.includes("sakit") || s.includes("leave") ||
    s.includes("cuti")
  ) {
    return { full: 0, half: 0 };
  }
  return { full: 1, half: 0 };
}

// Build payroll entries by aggregating daily-attendance per worker per project.
// Attendance is keyed by the worker's User id, while the rest of the UI keys
// workers by FieldWorker id — so we bridge through field-workers' user.id.
function buildPayroll(
  attendance: BackendDailyAttendance[],
  fieldWorkers: BackendFieldWorker[],
  projectCodeById: Map<string, string>,
): PayrollEntry[] {
  const fwByUserId = new Map<string, BackendFieldWorker>();
  for (const fw of fieldWorkers) if (fw.user?.id) fwByUserId.set(fw.user.id, fw);

  const entries = new Map<string, PayrollEntry>();
  const projIdx = new Map<string, Map<string, PayrollEntry["projects"][number]>>();

  for (const a of attendance) {
    const fw = fwByUserId.get(a.workerId);
    if (!fw) continue;
    const wid = fw.id;
    let entry = entries.get(wid);
    if (!entry) {
      entry = {
        workerId: wid,
        name: fw.user?.name || "Tanpa Nama",
        role: fw.specialization || "Tukang",
        rate: num(fw.salaryPerDay),
        projects: [],
      };
      entries.set(wid, entry);
      projIdx.set(wid, new Map());
    }
    const pmap = projIdx.get(wid)!;
    let pe = pmap.get(a.projectId);
    if (!pe) {
      pe = {
        projectId: a.projectId,
        code: projectCodeById.get(a.projectId) || a.projectId.slice(0, 8),
        daysPresent: 0,
        daysHalf: 0,
      };
      pmap.set(a.projectId, pe);
      entry.projects.push(pe);
    }
    const w = attendanceWeight(a.status);
    pe.daysPresent += w.full;
    pe.daysHalf += w.half;
  }

  return [...entries.values()];
}

// Map a real invoice onto the UI's payment-breakdown rows. Line items become
// rows; the invoice's paidAmount is allocated cumulatively to mark rows Paid.
function adaptBillingFromInvoice(inv: BackendInvoice): BillingStage[] {
  const items = inv.lineItems ?? [];
  if (items.length === 0) {
    const total = num(inv.totalAmount);
    const paid = num(inv.paidAmount);
    const stages: BillingStage[] = [];
    if (paid > 0) {
      stages.push({ stage: "Terbayar", amount: paid, status: "Paid", date: fmtDateID(inv.invoiceDate) });
    }
    if (total - paid > 0) {
      stages.push({ stage: "Sisa Tagihan", amount: total - paid, status: "Pending", date: null });
    }
    return stages;
  }

  let remainingPaid = num(inv.paidAmount);
  return items.map((li) => {
    const amount = num(li.lineTotal);
    let status: BillingStage["status"] = "Pending";
    let date: string | null = null;
    if (amount > 0 && remainingPaid >= amount) {
      status = "Paid";
      date = fmtDateID(inv.invoiceDate);
      remainingPaid -= amount;
    }
    return { stage: li.description, amount, status, date };
  });
}

// ── Fetch helpers ───────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────

export const api = {
  async getProjects(): Promise<Project[]> {
    const projects = (await get<BackendProject[]>("/projects")).map(adaptProject);
    // Enrich `assigned` from project-assignments. Assignments reference the
    // worker's User id, so bridge through field-workers' user.id → FieldWorker id
    // (the id the rest of the UI uses). Resilient: any failure leaves assigned [].
    try {
      const [fieldWorkers, assignmentLists] = await Promise.all([
        get<BackendFieldWorker[]>("/field-workers").catch(() => [] as BackendFieldWorker[]),
        Promise.all(
          projects.map((p) =>
            get<BackendProjectAssignment[]>(`/project-assignments?projectId=${p.id}`).catch(
              () => [] as BackendProjectAssignment[],
            ),
          ),
        ),
      ]);
      const fwIdByUserId = new Map<string, string>();
      for (const fw of fieldWorkers) if (fw.user?.id) fwIdByUserId.set(fw.user.id, fw.id);
      projects.forEach((p, i) => {
        const ids = (assignmentLists[i] || [])
          .map((a) => (a.workerId ? fwIdByUserId.get(a.workerId) : undefined))
          .filter((x): x is string => !!x);
        p.assigned = [...new Set(ids)];
      });
    } catch (err) {
      console.error("[api] enrich project assignments failed:", err);
    }
    return projects;
  },
  async getPayroll(): Promise<PayrollEntry[]> {
    const [attendance, fieldWorkers, rawProjects] = await Promise.all([
      get<BackendDailyAttendance[]>("/daily-attendance").catch(() => [] as BackendDailyAttendance[]),
      get<BackendFieldWorker[]>("/field-workers").catch(() => [] as BackendFieldWorker[]),
      get<BackendProject[]>("/projects").catch(() => [] as BackendProject[]),
    ]);
    const codeById = new Map(rawProjects.map((p) => [p.id, adaptProject(p).code]));
    return buildPayroll(attendance, fieldWorkers, codeById);
  },
  async getBillingForProject(projectId: string): Promise<BillingStage[]> {
    try {
      const invoices = await get<BackendInvoice[]>("/invoices");
      const inv = invoices.find((i) => i.projectId === projectId);
      return inv ? adaptBillingFromInvoice(inv) : [];
    } catch (err) {
      console.error("[api] getBillingForProject failed:", err);
      return [];
    }
  },
  async getProject(id: string): Promise<Project> {
    return adaptProject(await get<BackendProject>(`/projects/${id}`));
  },
  async getWorkers(): Promise<Worker[]> {
    return (await get<BackendFieldWorker[]>("/field-workers")).map(adaptWorker);
  },
  async getMaterials(): Promise<Material[]> {
    return (await get<BackendMaterial[]>("/materials")).map(adaptMaterial);
  },
  async getMaterialRequests(): Promise<MaterialRequest[]> {
    return (await get<BackendMaterialRequest[]>("/material-requests")).map(adaptMaterialRequest);
  },
  async getWorkReports(): Promise<WorkReport[]> {
    return (await get<BackendFieldReport[]>("/field-reports")).map(adaptWorkReport);
  },
  async getChangeOrders(): Promise<ChangeOrder[]> {
    return (await get<BackendChangeOrder[]>("/change-orders")).map(adaptChangeOrder);
  },
  async getCashFlows(): Promise<CashFlowEntry[]> {
    return (await get<BackendCashFlow[]>("/cash-flows")).map(adaptCashFlow);
  },
  async getExpenses(): Promise<Expense[]> {
    return (await get<BackendCashFlow[]>("/cash-flows"))
      .filter((c) => c.type === "expense")
      .map(adaptExpense);
  },
  async getCashAdvances(): Promise<CashAdvance[]> {
    return (await get<BackendCashAdvance[]>("/cash-advances")).map(adaptCashAdvance);
  },
  async getDailyAllowances(): Promise<DailyAllowance[]> {
    return (await get<BackendDailyAllowance[]>("/daily-allowances")).map(adaptDailyAllowance);
  },
  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    return (await get<BackendWorkerRegistration[]>("/worker-registrations")).map(adaptRegistration);
  },
  async getProofSubmissions(): Promise<ProofSubmission[]> {
    // Endpoint exists but returns the backend's own shape; none seeded yet.
    return [];
  },
};
