import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user_id } = await req.json()

  if (!user_id) {
    return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 })
  }

  // conecta no Supabase do FINANCEFLOW
  const financeflow = createClient(
    'https://elsilxqruurrbdebxndx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsc2lseHFydXVycmJkZWJ4bmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk0NzY4MiwiZXhwIjoyMDY1NTIzNjgyfQ.YjDGC0dz0FpDwUZLtzml0kFUMXvGS6Y7O8_zvgRS38A'
  )

  // verifica se o usuário tem plano "enterprise"
  const { data: profile, error: profileError } = await financeflow
    .from('profiles')
    .select('subscription')
    .eq('id', user_id)
    .single()

  if (profileError || !profile || profile.subscription !== 'enterprise') {
    return new Response(JSON.stringify({ error: 'Acesso negado: plano inválido.' }), { status: 403 })
  }

  // busca os clientes do usuário no FinanceFlow
  const { data: clients, error: clientsError } = await financeflow
    .from('clients')
    .select('*')
    .eq('user_id', user_id)

  if (clientsError) {
    return new Response(JSON.stringify({ error: clientsError.message }), { status: 500 })
  }

  return new Response(JSON.stringify(clients), { status: 200 })
})
