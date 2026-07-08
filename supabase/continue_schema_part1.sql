-- BizAuto SaaS — initial schema (all modules, MVP)
-- Auth via Supabase; manual plan/access on companies (no billing)

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE member_role AS ENUM ('owner', 'employee');
CREATE TYPE member_status AS ENUM ('active', 'invited', 'disabled');
CREATE TYPE company_plan AS ENUM ('free', 'starter', 'pro');
CREATE TYPE category_type AS ENUM ('income', 'expense');
CREATE TYPE client_status AS ENUM ('lead', 'active', 'inactive', 'churned');
CREATE TYPE client_segment AS ENUM ('vip', 'regular', 'low_value', 'unsegmented');
CREATE TYPE interaction_type AS ENUM ('note', 'call', 'email', 'meeting', 'deal', 'import');
CREATE TYPE deal_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'canceled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_entity_type AS ENUM ('client', 'deal', 'employee', 'product', 'none');
CREATE TYPE import_module AS ENUM ('clients', 'products', 'transactions');
CREATE TYPE import_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE employee_status AS ENUM ('active', 'inactive');
CREATE TYPE product_type AS ENUM ('product', 'service');
CREATE TYPE product_status AS ENUM ('active', 'archived');
CREATE TYPE channel_type AS ENUM ('telegram'); -- TODO: email, whatsapp
CREATE TYPE channel_status AS ENUM ('active', 'disabled', 'error');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_status AS ENUM ('new', 'draft_ready', 'approved', 'sent', 'archived');
CREATE TYPE social_platform AS ENUM ('telegram'); -- TODO: vk, instagram
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system', 'tool');
CREATE TYPE agent_action_status AS ENUM ('pending', 'approved', 'rejected', 'executed', 'failed');

-- =============================================================================
-- HELPERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
