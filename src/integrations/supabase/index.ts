import { createClient } from '@supabase/supabase-js'

const FINANCEFLOW_SUPABASE_URL = 'https://elsilxqruurrbdebxndx.supabase.co'
const FINANCEFLOW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...'

export const financeflowClient = createClient(
  FINANCEFLOW_SUPABASE_URL,
  FINANCEFLOW_SERVICE_ROLE_KEY
)

/**
 * Busca os clientes do usuário no FinanceFlow, se ele tiver plano enterprise.
 */
export async function getFinanceflowClients(userId: string) {
  if (!userId) throw new Error('Missing user ID')

  // Verifica se o usuário tem plano enterprise
  const { data: profile, error: profileError } = await financeflowClient
    .from('profiles')
    .select('subscription')
    .eq('id', userId)
    .single()

  if (profileError || !profile || profile.subscription !== 'enterprise') {
    throw new Error('Acesso negado: plano inválido.')
  }

  // Busca os clientes
  const { data: clients, error: clientsError } = await financeflowClient
    .from('clients')
    .select('*')
    .eq('user_id', userId)

  if (clientsError) throw new Error(clientsError.message)

  return clients
}
