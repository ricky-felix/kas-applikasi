export type WebsiteMonthly = { month: string; visitors: number; pageViews: number; inquiries: number; bounceRate: number };
export type WebsitePage    = { label: string; views: number; avgTime: string };
export type WebsiteFunnel  = { visitors: number; inquiries: number; waContacts: number; projectsSigned: number };

export type RoleActivity = {
  role: string; label: string; users: number;
  sessions: number; events: number; topEvent: string;
};
export type AppEvent = { event: string; label: string; count: number };

export type EmployeeRow = {
  workerId: string; name: string; workerRole: string; rate: number;
  totalDays: number; halfDays: number; wages: number;
  utilPct: number; reports: number; requests: number; revPerDay: number;
};

export type PendingItem =
  | { kind: "material";     id: string; materialName: string; workerName: string; qty: number; unit: string; date: string }
  | { kind: "change_order"; id: string; description: string; costImpact: number; requestedBy: string; date: string };

export type LowStockMaterial = { name: string; stock: number; minStock: number; unit: string; supplier: string };

export type AnalyticsData = {
  website:      { monthly: WebsiteMonthly[]; pages: WebsitePage[]; funnel: WebsiteFunnel };
  posthog:      { totalSessions: number; totalEvents: number; activeUsers: number; byRole: RoleActivity[]; topEvents: AppEvent[] };
  employees:    EmployeeRow[];
  features:     { label: string; value: number; cap: number }[];
  pendingItems: PendingItem[];
  lowStockMaterials: LowStockMaterial[];
};

export type RecType = "danger" | "warning" | "info";
export type Recommendation = { type: RecType; label: string; text: string; nav?: string };

export type DataSource = "posthog-web" | "posthog-app" | "supabase" | "computed";
