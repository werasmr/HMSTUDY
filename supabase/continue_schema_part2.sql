-- =============================================================================
-- AUTH / ACCOUNT
-- =============================================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan company_plan NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT jsonb_build_object(
    'currency', 'RUB',
    'timezone', 'Europe/Moscow',
    'segment_thresholds', jsonb_build_object(
      'vip', 100000,
      'regular', 10000,
      'low_value', 0
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'employee',
  status member_status NOT NULL DEFAULT 'active',
  invited_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);

CREATE UNIQUE INDEX company_members_invited_email_idx
  ON public.company_members (company_id, invited_email)
  WHERE invited_email IS NOT NULL AND user_id IS NULL;

CREATE OR REPLACE FUNCTION public.user_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.company_members
  WHERE user_id = auth.uid()
    AND status = 'active';
$$;

-- =============================================================================
-- FINANCE (statement upload only — no bank API)
-- =============================================================================

CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  currency text NOT NULL DEFAULT 'RUB',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transaction_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  type category_type NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name, type)
);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  bank_account_id uuid REFERENCES public.bank_accounts (id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.transaction_categories (id) ON DELETE SET NULL,
  amount numeric(14, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'RUB',
  description text NOT NULL DEFAULT '',
  transaction_date date NOT NULL,
  import_ref text,
  ai_categorized boolean NOT NULL DEFAULT false,
  ai_confidence numeric(3, 2),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX transactions_company_date_idx
  ON public.transactions (company_id, transaction_date DESC);

CREATE UNIQUE INDEX transactions_import_ref_idx
  ON public.transactions (company_id, import_ref)
  WHERE import_ref IS NOT NULL;

-- =============================================================================
-- CRM + CLIENT BASE (single clients table)
-- =============================================================================

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  status client_status NOT NULL DEFAULT 'lead',
  source text,
  total_purchases numeric(14, 2) NOT NULL DEFAULT 0,
  segment client_segment NOT NULL DEFAULT 'unsegmented',
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}',
  duplicate_of uuid REFERENCES public.clients (id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clients_company_status_idx ON public.clients (company_id, status);
CREATE INDEX clients_company_segment_idx ON public.clients (company_id, segment);
CREATE INDEX clients_company_email_idx ON public.clients (company_id, email);
CREATE INDEX clients_company_phone_idx ON public.clients (company_id, phone);

CREATE TABLE public.client_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  type interaction_type NOT NULL DEFAULT 'note',
  title text,
  content text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  title text NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'lead',
  amount numeric(14, 2),
  currency text NOT NULL DEFAULT 'RUB',
  expected_close_date date,
  assigned_to uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX deals_company_stage_idx ON public.deals (company_id, stage);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date date,
  assignee_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  entity_type task_entity_type NOT NULL DEFAULT 'none',
  entity_id uuid,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_company_entity_idx
  ON public.tasks (company_id, entity_type, entity_id);

CREATE TABLE public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  module import_module NOT NULL,
  file_path text NOT NULL,
  status import_status NOT NULL DEFAULT 'pending',
  stats jsonb NOT NULL DEFAULT '{}',
  error_log text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- EMPLOYEES
-- =============================================================================

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name text NOT NULL,
  position text,
  department text,
  hire_date date,
  status employee_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  period date NOT NULL,
  metric_key text NOT NULL,
  metric_label text NOT NULL,
  value numeric(14, 2) NOT NULL DEFAULT 0,
  target numeric(14, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, period, metric_key)
);

-- =============================================================================
-- COMPETITORS
-- =============================================================================

CREATE TABLE public.competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  website text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.competitor_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  competitor_id uuid NOT NULL REFERENCES public.competitors (id) ON DELETE CASCADE,
  product_name text NOT NULL,
  price numeric(14, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'RUB',
  notes text,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- PRODUCTS + PRICING
-- =============================================================================

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  type product_type NOT NULL DEFAULT 'product',
  sku text,
  cost numeric(14, 2),
  price numeric(14, 2),
  margin_percent numeric(5, 2),
  description text,
  status product_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pricing_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  cost numeric(14, 2) NOT NULL,
  margin_percent numeric(5, 2) NOT NULL,
  calculated_price numeric(14, 2) NOT NULL,
  ai_recommended_price numeric(14, 2),
  ai_reasoning text,
  competitor_context jsonb,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- INBOX (Telegram MVP)
-- =============================================================================

CREATE TABLE public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  type channel_type NOT NULL DEFAULT 'telegram',
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status channel_status NOT NULL DEFAULT 'disabled',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.inbox_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels (id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients (id) ON DELETE SET NULL,
  external_id text,
  direction message_direction NOT NULL,
  from_contact text NOT NULL,
  subject text,
  body text NOT NULL DEFAULT '',
  status message_status NOT NULL DEFAULT 'new',
  ai_draft text,
  approved_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  sent_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inbox_messages_company_status_idx
  ON public.inbox_messages (company_id, status, received_at DESC);

CREATE UNIQUE INDEX inbox_messages_external_idx
  ON public.inbox_messages (channel_id, external_id)
  WHERE external_id IS NOT NULL;

-- =============================================================================
-- SMM (Telegram MVP)
-- =============================================================================

CREATE TABLE public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  platform social_platform NOT NULL DEFAULT 'telegram',
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status channel_status NOT NULL DEFAULT 'disabled',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  social_account_id uuid REFERENCES public.social_accounts (id) ON DELETE SET NULL,
  content text NOT NULL,
  media_urls text[],
  scheduled_at timestamptz,
  published_at timestamptz,
  status post_status NOT NULL DEFAULT 'draft',
  external_post_id text,
  ai_generated boolean NOT NULL DEFAULT false,
  error_message text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX social_posts_scheduled_idx
  ON public.social_posts (company_id, scheduled_at)
  WHERE status = 'scheduled';

-- =============================================================================
-- CHAT + AGENT ACTIONS
-- =============================================================================

CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations (id) ON DELETE CASCADE,
  role chat_role NOT NULL,
  content text,
  tool_calls jsonb,
  tool_results jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.chat_conversations (id) ON DELETE SET NULL,
  requested_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  action_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  preview text,
  status agent_action_status NOT NULL DEFAULT 'pending',
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX agent_actions_pending_idx
  ON public.agent_actions (company_id, status)
  WHERE status = 'pending';

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- AUTH TRIGGER: auto-create profile on signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Companies
CREATE POLICY companies_select_member ON public.companies
  FOR SELECT USING (id IN (SELECT public.user_company_ids()));

CREATE POLICY companies_insert_authenticated ON public.companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY companies_update_owner ON public.companies
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Company members
CREATE POLICY company_members_select ON public.company_members
  FOR SELECT USING (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY company_members_insert ON public.company_members
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
    OR NOT EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id
    )
  );

CREATE POLICY company_members_update_owner ON public.company_members
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Generic company-scoped policies macro pattern
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'bank_accounts', 'transaction_categories', 'transactions',
    'clients', 'client_interactions', 'deals', 'tasks', 'import_jobs',
    'employees', 'employee_kpis', 'competitors', 'competitor_items',
    'products', 'pricing_scenarios', 'channels', 'inbox_messages',
    'social_accounts', 'social_posts', 'chat_conversations', 'agent_actions'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT USING (company_id IN (SELECT public.user_company_ids()))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON public.%I FOR INSERT WITH CHECK (company_id IN (SELECT public.user_company_ids()))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON public.%I FOR UPDATE USING (company_id IN (SELECT public.user_company_ids()))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON public.%I FOR DELETE USING (company_id IN (SELECT public.user_company_ids()))',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Chat messages via conversation ownership
CREATE POLICY chat_messages_select ON public.chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE company_id IN (SELECT public.user_company_ids())
    )
  );

CREATE POLICY chat_messages_insert ON public.chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE company_id IN (SELECT public.user_company_ids())
        AND user_id = auth.uid()
    )
  );

-- =============================================================================
-- STORAGE (imports bucket)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false,
  10485760,
  ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY imports_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imports'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_company_ids())
  );

CREATE POLICY imports_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_company_ids())
  );

CREATE POLICY imports_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'imports'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_company_ids())
  );
