-- Fix onboarding: allow INSERT ... RETURNING on companies before membership exists
-- Run in Supabase SQL Editor if onboarding fails with RLS on companies

CREATE POLICY companies_select_pending_setup ON public.companies
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.company_members cm
      WHERE cm.company_id = companies.id
    )
  );

-- Optional: atomic company creation (more reliable)
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name text,
  company_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE user_id = current_user_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User already has a company';
  END IF;

  INSERT INTO public.companies (name, slug)
  VALUES (company_name, company_slug)
  RETURNING id INTO new_company_id;

  INSERT INTO public.company_members (company_id, user_id, role, status)
  VALUES (new_company_id, current_user_id, 'owner', 'active');

  RETURN new_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_company_with_owner(text, text) TO authenticated;
