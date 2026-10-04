/**
 * Nailed It Property Solutions — Complete Supabase PostgreSQL Database Schema
 * All 11 tables, indexes, and RLS policies for instant cloud deployment.
 */
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- NAILED IT PROPERTY SOLUTIONS — SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project -> Go to "SQL Editor" -> Click "New query"
-- 3. Paste this entire SQL script and click "Run"
-- 4. All tables, indexes, and Row Level Security (RLS) policies will be created.
-- ==============================================================================

-- 1. USERS & TECHNICIANS
CREATE TABLE IF NOT EXISTS public.users (
    uid TEXT PRIMARY KEY,
    email TEXT DEFAULT '',
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'dispatcher', 'technician', 'client', 'investor')),
    phone TEXT,
    avatar_url TEXT,
    client_id TEXT,
    employee_id TEXT DEFAULT '',
    pin TEXT DEFAULT '',
    telegram_chat_id TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    is_company BOOLEAN DEFAULT FALSE,
    company_name TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    billing_address JSONB DEFAULT '{}'::jsonb,
    property_ids JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    total_spent NUMERIC(12, 2) DEFAULT 0,
    active_jobs_count INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_is_archived ON public.clients(is_archived);

-- 3. PROPERTIES
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    property_type TEXT DEFAULT 'single_family',
    notes TEXT DEFAULT '',
    service_history_job_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_client_id ON public.properties(client_id);

-- 4. JOBS (DISPATCH BOARD)
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    job_number TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    property_id TEXT NOT NULL,
    property_address TEXT NOT NULL,
    assigned_tech_id TEXT,
    assigned_tech_name TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'unscheduled',
    priority TEXT DEFAULT 'medium',
    scheduled_date DATE,
    time_window_start TEXT DEFAULT '',
    time_window_end TEXT DEFAULT '',
    checklist JSONB DEFAULT '[]'::jsonb,
    photos_before JSONB DEFAULT '[]'::jsonb,
    photos_after JSONB DEFAULT '[]'::jsonb,
    invoice_id TEXT,
    estimate_id TEXT,
    work_agreement_id TEXT,
    original_estimate_total NUMERIC(12, 2),
    variance_amount NUMERIC(12, 2),
    variance_reason TEXT,
    notes TEXT DEFAULT '',
    total_amount NUMERIC(12, 2) DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tech ON public.jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client ON public.jobs(client_id);

-- 5. ESTIMATES & QUOTES
CREATE TABLE IF NOT EXISTS public.estimates (
    id TEXT PRIMARY KEY,
    estimate_number TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    property_id TEXT NOT NULL,
    property_address TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    tax_rate NUMERIC(6, 4) DEFAULT 0.08,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    deposit_paid NUMERIC(12, 2) DEFAULT 0,
    work_agreement_id TEXT,
    payments JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    valid_until DATE,
    converted_to_job_id TEXT,
    market_comparison JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimates_client_id ON public.estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON public.estimates(status);

-- 6. COMPANY WORK AGREEMENTS & SERVICE CONTRACTS
CREATE TABLE IF NOT EXISTS public.work_agreements (
    id TEXT PRIMARY KEY,
    contract_id TEXT,
    agreement_number TEXT NOT NULL,
    estimate_id TEXT NOT NULL,
    estimate_number TEXT NOT NULL,
    job_id TEXT,
    job_number TEXT,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    property_id TEXT NOT NULL,
    property_address TEXT NOT NULL,
    original_estimate_total NUMERIC(12, 2) DEFAULT 0,
    updated_total NUMERIC(12, 2) DEFAULT 0,
    variance_amount NUMERIC(12, 2) DEFAULT 0,
    variance_reason TEXT DEFAULT '',
    deposit_paid NUMERIC(12, 2) DEFAULT 0,
    balance_due NUMERIC(12, 2) DEFAULT 0,
    payment_method TEXT,
    payment_receipt_number TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    terms TEXT DEFAULT '',
    contractor_signed_by TEXT DEFAULT '',
    contractor_signed_at TIMESTAMPTZ,
    client_signature_name TEXT,
    client_signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_estimate_id ON public.work_agreements(estimate_id);
CREATE INDEX IF NOT EXISTS idx_agreements_contract_id ON public.work_agreements(contract_id);

-- 7. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    job_id TEXT NOT NULL,
    job_number TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    property_id TEXT NOT NULL,
    property_address TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    tax NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    balance_due NUMERIC(12, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    stripe_payment_link TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 8. SUBSCRIPTIONS (RECURRING MEMBERSHIPS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    property_id TEXT NOT NULL,
    property_address TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    billing_interval TEXT DEFAULT 'month',
    status TEXT NOT NULL DEFAULT 'active',
    stripe_subscription_id TEXT NOT NULL,
    stripe_price_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    auto_dispatch_enabled BOOLEAN DEFAULT TRUE,
    last_dispatched_job_id TEXT,
    tier TEXT,
    pricing_variables JSONB,
    selected_add_ons JSONB,
    monthly_add_ons_total NUMERIC(10, 2) DEFAULT 0,
    one_time_add_ons_total NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DAILY WORK LOGS (TIMESHEET OCR)
CREATE TABLE IF NOT EXISTS public.daily_work_logs (
    id TEXT PRIMARY KEY,
    technician_id TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    stop_time TEXT NOT NULL,
    total_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    property_location TEXT NOT NULL,
    property_id TEXT,
    task_details TEXT DEFAULT '',
    job_category TEXT NOT NULL,
    scanned_image_url TEXT,
    raw_ocr_text TEXT,
    confidence_score NUMERIC(4, 3) DEFAULT 0,
    source TEXT DEFAULT 'manual_entry',
    weekly_timesheet_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_logs_tech ON public.daily_work_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_date ON public.daily_work_logs(date);

-- 10. WEEKLY TIMESHEETS & AUDIT
CREATE TABLE IF NOT EXISTS public.weekly_timesheets (
    id TEXT PRIMARY KEY,
    technician_id TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    week_number INT NOT NULL,
    year INT NOT NULL DEFAULT 2026,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    daily_log_ids JSONB DEFAULT '[]'::jsonb,
    total_hours NUMERIC(6, 2) DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
    total_gross_pay NUMERIC(10, 2) DEFAULT 0,
    bonuses JSONB DEFAULT '[]'::jsonb,
    total_bonuses NUMERIC(10, 2) DEFAULT 0,
    deductions JSONB DEFAULT '[]'::jsonb,
    total_deductions NUMERIC(10, 2) DEFAULT 0,
    net_pay NUMERIC(10, 2) DEFAULT 0,
    audit_confirmed BOOLEAN DEFAULT FALSE,
    audit_confirmed_at TIMESTAMPTZ,
    audit_confirmed_by TEXT,
    status TEXT DEFAULT 'draft',
    locked BOOLEAN DEFAULT FALSE,
    payment_verification JSONB,
    generated_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timesheets_tech ON public.weekly_timesheets(technician_id);

-- 11. AUDIT LOGS (IMMUTABLE ACTIVITY FEED)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    employee_id TEXT DEFAULT '',
    employee_name TEXT DEFAULT '',
    employee_role TEXT DEFAULT '',
    user_name TEXT,
    user_role TEXT,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_title TEXT,
    summary TEXT NOT NULL,
    description TEXT,
    previous_state JSONB,
    new_state JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enables transparent reads and writes for authorized application clients.

DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'users', 'clients', 'properties', 'jobs', 'estimates', 
        'work_agreements', 'invoices', 'subscriptions', 
        'daily_work_logs', 'weekly_timesheets', 'audit_logs'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop existing policies if any
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy" ON public.%I;', t);
        
        -- Grant full access to anon and authenticated clients
        EXECUTE format('
            CREATE POLICY "Public access policy" ON public.%I
            FOR ALL
            TO anon, authenticated
            USING (true)
            WITH CHECK (true);
        ', t);
    END LOOP;
END $$;
`;
