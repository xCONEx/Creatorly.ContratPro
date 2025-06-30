
-- 1. Adicionar campos ao user_profiles para dados completos
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'pessoa_fisica' CHECK (user_type IN ('pessoa_fisica', 'pessoa_juridica')),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id);

-- 2. Criar tabela para reports/relatórios
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('contracts', 'clients', 'revenue', 'custom')),
  data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela para configurações do usuário
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  contract_reminders BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela para user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inserir planos padrão (somente se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Gratuito') THEN
    INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_contracts_per_month, features, api_access)
    VALUES ('Gratuito', 'Plano básico para começar', 0.00, 0.00, 3, '["3 contratos por mês", "Templates básicos", "Suporte por email"]', false);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Profissional') THEN
    INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_contracts_per_month, features, api_access)
    VALUES ('Profissional', 'Para freelancers e pequenas empresas', 29.90, 299.00, 20, '["20 contratos por mês", "Templates premium", "Assinatura eletrônica", "Suporte prioritário"]', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Empresarial') THEN
    INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_contracts_per_month, features, api_access)
    VALUES ('Empresarial', 'Para empresas em crescimento', 79.90, 799.00, 100, '["100 contratos por mês", "Templates personalizados", "API completa", "Relatórios avançados", "Suporte 24/7"]', true);
  END IF;
END $$;

-- 6. Habilitar RLS nas novas tabelas
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS para as novas tabelas
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reports" ON public.reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 8. Atualizar a função handle_new_user para criar configurações padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Buscar o ID do plano gratuito
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'Gratuito' LIMIT 1;
  
  -- Inserir perfil do usuário
  INSERT INTO public.user_profiles (user_id, name, email, subscription_plan_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.email, ''),
    free_plan_id
  );
  
  -- Inserir configurações padrão
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Inserir assinatura gratuita
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
