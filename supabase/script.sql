-- ============================================================================
-- TAUKE EXTENDED TABLES ONLY
-- Add to existing Tauke Supabase setup (assumes user_role enum already exists)
-- ============================================================================

-- ============================================================================
-- 1. ADDITIONAL ENUMS (user_role already exists from original migration)
-- ============================================================================

CREATE TYPE project_status AS ENUM ('draft', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE material_status AS ENUM ('available', 'low_stock', 'out_of_stock', 'discontinued');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed');
CREATE TYPE field_report_status AS ENUM ('draft', 'submitted', 'reviewed', 'approved');
CREATE TYPE cash_flow_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE cash_flow_category AS ENUM ('project_payment', 'material_purchase', 'labor', 'equipment', 'overhead', 'other');
CREATE TYPE field_worker_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');

-- ============================================================================
-- 2. PROYEK (PROJECTS)
-- ============================================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status project_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  planned_budget DECIMAL(15, 2),
  actual_budget DECIMAL(15, 2),
  project_manager_id UUID REFERENCES public.users(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_project_manager_id ON public.projects(project_manager_id);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);

-- ============================================================================
-- 3. MATERIAL
-- ============================================================================

CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  unit TEXT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  quantity_on_hand DECIMAL(10, 2) NOT NULL DEFAULT 0,
  reorder_level DECIMAL(10, 2),
  status material_status NOT NULL DEFAULT 'available',
  supplier_name TEXT,
  supplier_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_materials_organization_id ON public.materials(organization_id);
CREATE INDEX idx_materials_sku ON public.materials(sku);
CREATE INDEX idx_materials_status ON public.materials(status);

-- ============================================================================
-- 4. TIM (TEAMS)
-- ============================================================================

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_organization_id ON public.teams(organization_id);
CREATE INDEX idx_teams_team_lead_id ON public.teams(team_lead_id);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, worker_id)
);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_worker_id ON public.team_members(worker_id);

-- ============================================================================
-- 5. PEKERJA DI LAPANGAN (FIELD WORKERS)
-- ============================================================================

CREATE TABLE public.field_workers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  specialization TEXT,
  status field_worker_status NOT NULL DEFAULT 'active',
  hire_date DATE,
  salary_per_day DECIMAL(10, 2),
  bank_account TEXT,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_field_workers_organization_id ON public.field_workers(organization_id);
CREATE INDEX idx_field_workers_status ON public.field_workers(status);

-- ============================================================================
-- 6. PROJECT ASSIGNMENTS & MATERIALS
-- ============================================================================

CREATE TABLE public.project_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  role TEXT,
  assigned_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, worker_id)
);

CREATE INDEX idx_project_assignments_project_id ON public.project_team_assignments(project_id);
CREATE INDEX idx_project_assignments_team_id ON public.project_team_assignments(team_id);
CREATE INDEX idx_project_assignments_worker_id ON public.project_team_assignments(worker_id);

CREATE TABLE public.project_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
  quantity_planned DECIMAL(10, 2) NOT NULL,
  quantity_used DECIMAL(10, 2) DEFAULT 0,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_cost DECIMAL(15, 2),
  delivery_date DATE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, material_id)
);

CREATE INDEX idx_project_materials_project_id ON public.project_materials(project_id);
CREATE INDEX idx_project_materials_material_id ON public.project_materials(material_id);

-- ============================================================================
-- 7. LAPORAN DARI LAPANGAN (FIELD REPORTS)
-- ============================================================================

CREATE TABLE public.field_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id),
  report_date DATE NOT NULL,
  status field_report_status NOT NULL DEFAULT 'draft',
  progress_percentage DECIMAL(5, 2),
  work_description TEXT,
  weather_condition TEXT,
  challenges TEXT,
  material_usage_notes TEXT,
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_field_reports_project_id ON public.field_reports(project_id);
CREATE INDEX idx_field_reports_reported_by ON public.field_reports(reported_by);
CREATE INDEX idx_field_reports_report_date ON public.field_reports(report_date);
CREATE INDEX idx_field_reports_status ON public.field_reports(status);

CREATE TABLE public.field_report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_report_id UUID NOT NULL REFERENCES public.field_reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  attachment_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_attachments_field_report_id ON public.field_report_attachments(field_report_id);

-- ============================================================================
-- 8. PERMINTAAN (REQUESTS/QUOTES)
-- ============================================================================

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  request_type TEXT,
  description TEXT NOT NULL,
  location TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  estimated_budget DECIMAL(15, 2),
  quoted_amount DECIMAL(15, 2),
  quote_valid_until DATE,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_requests_organization_id ON public.requests(organization_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_created_by ON public.requests(created_by);

-- ============================================================================
-- 9. TAGIHAN (INVOICES)
-- ============================================================================

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  payment_method TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  line_total DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);

-- ============================================================================
-- 10. ARUS KAS (CASH FLOW)
-- ============================================================================

CREATE TABLE public.cash_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type cash_flow_type NOT NULL,
  category cash_flow_category NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  transaction_date DATE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cash_flows_organization_id ON public.cash_flows(organization_id);
CREATE INDEX idx_cash_flows_type ON public.cash_flows(type);
CREATE INDEX idx_cash_flows_category ON public.cash_flows(category);
CREATE INDEX idx_cash_flows_transaction_date ON public.cash_flows(transaction_date);

-- ============================================================================
-- 11. DAILY ATTENDANCE
-- ============================================================================

CREATE TABLE public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  hours_worked DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, worker_id, attendance_date)
);

CREATE INDEX idx_daily_attendance_project_id ON public.daily_attendance(project_id);
CREATE INDEX idx_daily_attendance_worker_id ON public.daily_attendance(worker_id);
CREATE INDEX idx_daily_attendance_date ON public.daily_attendance(attendance_date);

-- ============================================================================
-- 12. ENABLE RLS FOR ALL NEW TABLES
-- ============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 13. RLS POLICIES
-- ============================================================================

-- PROJECTS
CREATE POLICY "super_admin_view_all_projects" ON public.projects
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_projects" ON public.projects
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.projects.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "worker_view_assigned_projects" ON public.projects
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT DISTINCT pta.worker_id FROM public.project_team_assignments pta
      WHERE pta.project_id = public.projects.id
    )
  );

CREATE POLICY "owner_admin_create_projects" ON public.projects
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.projects.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "owner_admin_update_projects" ON public.projects
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.projects.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- MATERIALS
CREATE POLICY "super_admin_view_all_materials" ON public.materials
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_materials" ON public.materials
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.materials.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "owner_admin_manage_materials" ON public.materials
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.materials.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- TEAMS
CREATE POLICY "super_admin_view_all_teams" ON public.teams
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_teams" ON public.teams
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.teams.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "owner_admin_manage_teams" ON public.teams
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.teams.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- TEAM MEMBERS
CREATE POLICY "team_members_view" ON public.team_members
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      INNER JOIN public.teams t ON uo.organization_id = t.organization_id
      WHERE t.id = public.team_members.team_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- FIELD WORKERS
CREATE POLICY "super_admin_view_all_field_workers" ON public.field_workers
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_field_workers" ON public.field_workers
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.field_workers.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "field_worker_view_own_profile" ON public.field_workers
  FOR SELECT
  USING (auth.uid() = id);

-- PROJECT TEAM ASSIGNMENTS
CREATE POLICY "view_project_assignments" ON public.project_team_assignments
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      INNER JOIN public.projects p ON uo.organization_id = p.organization_id
      WHERE p.id = public.project_team_assignments.project_id
      AND uo.role IN ('owner', 'admin')
    )
    OR
    auth.uid() = public.project_team_assignments.worker_id
  );

-- PROJECT MATERIALS
CREATE POLICY "view_project_materials" ON public.project_materials
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      INNER JOIN public.projects p ON uo.organization_id = p.organization_id
      WHERE p.id = public.project_materials.project_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- FIELD REPORTS
CREATE POLICY "admin_view_org_field_reports" ON public.field_reports
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      INNER JOIN public.projects p ON uo.organization_id = p.organization_id
      WHERE p.id = public.field_reports.project_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "worker_view_own_field_reports" ON public.field_reports
  FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "worker_submit_field_reports" ON public.field_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "worker_update_own_field_reports" ON public.field_reports
  FOR UPDATE
  USING (auth.uid() = reported_by AND status = 'draft');

-- REQUESTS
CREATE POLICY "super_admin_view_all_requests" ON public.requests
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_requests" ON public.requests
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.requests.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "owner_admin_manage_requests" ON public.requests
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.requests.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- INVOICES
CREATE POLICY "super_admin_view_all_invoices" ON public.invoices
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_invoices" ON public.invoices
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.invoices.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "owner_admin_manage_invoices" ON public.invoices
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.invoices.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- CASH FLOWS
CREATE POLICY "super_admin_view_all_cash_flows" ON public.cash_flows
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_cash_flows" ON public.cash_flows
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.cash_flows.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "owner_admin_record_cash_flows" ON public.cash_flows
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      WHERE uo.organization_id = public.cash_flows.organization_id
      AND uo.role IN ('owner', 'admin')
    )
  );

-- DAILY ATTENDANCE
CREATE POLICY "super_admin_view_all_attendance" ON public.daily_attendance
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin'));

CREATE POLICY "owner_admin_view_org_attendance" ON public.daily_attendance
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT uo.user_id FROM public.user_organizations uo
      INNER JOIN public.projects p ON uo.organization_id = p.organization_id
      WHERE p.id = public.daily_attendance.project_id
      AND uo.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "worker_view_own_attendance" ON public.daily_attendance
  FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "worker_log_own_attendance" ON public.daily_attendance
  FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

-- ============================================================================
-- 14. TRIGGERS FOR TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_update_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER materials_update_timestamp BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER teams_update_timestamp BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER field_workers_update_timestamp BEFORE UPDATE ON public.field_workers FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER field_reports_update_timestamp BEFORE UPDATE ON public.field_reports FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER requests_update_timestamp BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER invoices_update_timestamp BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER cash_flows_update_timestamp BEFORE UPDATE ON public.cash_flows FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
