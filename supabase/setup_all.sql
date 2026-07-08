-- Proto: полная настройка БД для Supabase SQL Editor
-- Запускайте по частям, если какой-то шаг выдаёт "already exists".

-- =============================================================================
-- ШАГ 1: Если таблиц ещё нет — сначала part1, потом part2
-- (скопируйте содержимое continue_schema_part1.sql и выполните)
-- (затем continue_schema_part2.sql)
-- =============================================================================

-- =============================================================================
-- ШАГ 2: Обязательный фикс онбординга (можно запускать повторно)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'companies'
      AND policyname = 'companies_select_pending_setup'
  ) THEN
    CREATE POLICY companies_select_pending_setup ON public.companies
      FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM public.company_members cm
          WHERE cm.company_id = companies.id
        )
      );
  END IF;
END $$;

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

-- =============================================================================
-- ШАГ 3: Проверка — должны существовать ключевые таблицы
-- =============================================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'companies',
    'company_members',
    'clients',
    'transactions',
    'chat_conversations',
    'chat_messages'
  )
ORDER BY table_name;
