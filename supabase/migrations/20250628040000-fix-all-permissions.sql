
-- Migration para corrigir todas as permissões do sistema
-- Remove todas as políticas existentes e recria um sistema funcional

-- 1. Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admin can manage all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON public.user_subscriptions;

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.user_settings;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.user_settings;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.user_settings;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON public.user_settings;

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.clients;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.clients;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.clients;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can manage their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.contracts;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.contracts;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.contracts;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON public.contracts;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can manage own reports" ON public.reports;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.reports;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.reports;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.reports;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON public.reports;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- 3. Garantir que os planos existam
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_contracts_per_month, features, api_access)
VALUES 
  ('Gratuito', 'Plano gratuito com recursos básicos', 0.00, 0.00, 10, '["10 contratos por mês", "Templates básicos", "Suporte por email"]', false),
  ('Profissional', 'Plano profissional com recursos avançados', 29.90, 299.00, 50, '["50 contratos por mês", "Templates premium", "Assinatura eletrônica", "Suporte prioritário", "API básica"]', true),
  ('Empresarial', 'Plano empresarial com recursos completos', 99.90, 999.00, 200, '["200 contratos por mês", "Templates personalizados", "API completa", "Relatórios avançados", "Suporte 24/7", "Painel administrativo"]', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_contracts_per_month = EXCLUDED.max_contracts_per_month,
  features = EXCLUDED.features,
  api_access = EXCLUDED.api_access;

-- 4. Garantir que o usuário admin existe no user_roles
DO $$
DECLARE
  admin_user_id UUID;
  free_plan_id UUID;
  enterprise_plan_id UUID;
BEGIN
  -- Buscar o user_id do admin
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'yuriadrskt@gmail.com' 
  LIMIT 1;
  
  -- Buscar os planos
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'Gratuito' LIMIT 1;
  SELECT id INTO enterprise_plan_id FROM public.subscription_plans WHERE name = 'Empresarial' LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Garantir role de admin
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Garantir perfil do admin
    INSERT INTO public.user_profiles (user_id, name, email, user_type, created_at, updated_at)
    VALUES (admin_user_id, 'Admin', 'yuriadrskt@gmail.com', 'pessoa_fisica', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      name = 'Admin',
      email = 'yuriadrskt@gmail.com',
      updated_at = NOW();
    
    -- Garantir assinatura enterprise para o admin
    IF enterprise_plan_id IS NOT NULL THEN
      INSERT INTO public.user_subscriptions (user_id, plan_id, status, started_at, created_at, updated_at)
      VALUES (admin_user_id, enterprise_plan_id, 'active', NOW(), NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        plan_id = enterprise_plan_id,
        status = 'active',
        updated_at = NOW();
    END IF;
    
    -- Garantir configurações para o admin
    INSERT INTO public.user_settings (user_id, created_at, updated_at)
    VALUES (admin_user_id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- 5. Reabilitar RLS e criar políticas simples
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas básicas para user_profiles
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_admin_all" ON public.user_profiles
  FOR ALL USING (auth.uid()::text IN (
    SELECT user_id::text FROM public.user_roles WHERE role = 'admin'
  ));

-- 7. Criar políticas básicas para user_subscriptions
CREATE POLICY "user_subscriptions_select_own" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_own" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_own" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_admin_all" ON public.user_subscriptions
  FOR ALL USING (auth.uid()::text IN (
    SELECT user_id::text FROM public.user_roles WHERE role = 'admin'
  ));

-- 8. Criar políticas básicas para user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. Criar políticas básicas para clients
CREATE POLICY "clients_select_own" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "clients_insert_own" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update_own" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "clients_delete_own" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Criar políticas básicas para contracts
CREATE POLICY "contracts_select_own" ON public.contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "contracts_insert_own" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contracts_update_own" ON public.contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "contracts_delete_own" ON public.contracts
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Criar políticas básicas para notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Criar políticas básicas para reports
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_update_own" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reports_delete_own" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- 13. Criar políticas básicas para user_roles
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (auth.uid()::text IN (
    SELECT user_id::text FROM public.user_roles WHERE role = 'admin'
  ));

-- 14. Permitir leitura pública dos planos de assinatura
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_plans_select_all" ON public.subscription_plans
  FOR SELECT USING (true);

-- 15. Permitir leitura pública dos templates de contrato
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contract_templates_select_public" ON public.contract_templates
  FOR SELECT USING (is_public = true);

-- 16. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON public.user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON public.contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
