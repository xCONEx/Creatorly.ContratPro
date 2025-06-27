
-- Simplificar a tabela user_profiles removendo apenas campos desnecessários
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS signature_url,
DROP COLUMN IF EXISTS has_contratpro;

-- Adicionar constraint única no user_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Atualizar a função handle_new_user para ser mais simples
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_id, name, email, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.email, ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', user_profiles.name),
    email = COALESCE(NEW.email, user_profiles.email),
    updated_at = NOW();
  RETURN NEW;
END;
$$;
