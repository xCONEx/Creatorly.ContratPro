
-- 1. Corrigir RLS policies para permitir acesso aos dados
-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can manage own reports" ON public.reports;

-- Criar políticas RLS corretas
CREATE POLICY "Enable read access for users based on user_id" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users based on user_id" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON public.user_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for users based on user_id" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users based on user_id" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for users based on user_id" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users based on user_id" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON public.reports
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Criar políticas para clients e contracts
CREATE POLICY "Enable read access for users based on user_id" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users based on user_id" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for users based on user_id" ON public.contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users based on user_id" ON public.contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON public.contracts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON public.contracts
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Atualizar planos com limites corretos
UPDATE public.subscription_plans 
SET 
  max_contracts_per_month = 10,
  features = '["10 contratos por mês", "Templates básicos", "Suporte por email"]'
WHERE name = 'Gratuito';

UPDATE public.subscription_plans 
SET 
  max_contracts_per_month = 50,
  features = '["50 contratos por mês", "Templates premium", "Assinatura eletrônica", "Suporte prioritário", "API básica"]'
WHERE name = 'Profissional';

UPDATE public.subscription_plans 
SET 
  max_contracts_per_month = 200,
  features = '["200 contratos por mês", "Templates personalizados", "API completa", "Relatórios avançados", "Suporte 24/7", "Painel administrativo"]'
WHERE name = 'Empresarial';

-- 4. Criar sistema de roles para admin
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_roles (admin pode ver tudo, usuários podem ver só o próprio)
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      )
    );

CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      )
    );

-- 5. Conceder acesso admin para yuriadrskt@gmail.com e plano enterprise
DO $$
DECLARE
  admin_user_id UUID;
  enterprise_plan_id UUID;
BEGIN
  -- Buscar o user_id do admin
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'yuriadrskt@gmail.com' 
  LIMIT 1;
  
  -- Buscar o plano enterprise
  SELECT id INTO enterprise_plan_id 
  FROM public.subscription_plans 
  WHERE name = 'Empresarial' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Inserir role de admin
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Atualizar assinatura para enterprise
    IF enterprise_plan_id IS NOT NULL THEN
      UPDATE public.user_subscriptions 
      SET plan_id = enterprise_plan_id, status = 'active'
      WHERE user_id = admin_user_id;
      
      -- Se não existe assinatura, criar uma
      INSERT INTO public.user_subscriptions (user_id, plan_id, status)
      SELECT admin_user_id, enterprise_plan_id, 'active'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_subscriptions 
        WHERE user_id = admin_user_id
      );
    END IF;
  END IF;
END $$;

-- 6. Permitir que admins vejam todos os usuários e dados
CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      )
    );

CREATE POLICY "Admins can manage all user profiles" ON public.user_profiles
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      )
    );

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      )
    );

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      )
    );

-- 7. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON public.contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
