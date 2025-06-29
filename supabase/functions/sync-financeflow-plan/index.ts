
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Nova função para buscar clientes do FinanceFlow por user_email
const fetchFinanceFlowClientsByUserEmail = async (financeflowSupabase: any, userEmail: string) => {
  console.log(`=== Buscando clientes do FinanceFlow para user_email: ${userEmail} ===`);
  
  try {
    // Primeiro, testar conexão com FinanceFlow
    console.log('=== Testando conexão com FinanceFlow ===');
    const { data: testConnection, error: testError } = await financeflowSupabase
      .from('clients')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (testError) {
      console.error('Erro de conexão com FinanceFlow:', testError);
      throw new Error(`Conexão com FinanceFlow falhou: ${testError.message}`);
    }
    
    console.log('Conexão com FinanceFlow estabelecida com sucesso');
    
    // Buscar TODOS os clientes primeiro para debug
    console.log('=== Debug: Buscando TODOS os clientes do FinanceFlow ===');
    const { data: allClientsData, error: allClientsError } = await financeflowSupabase
      .from('clients')
      .select(`
        id,
        user_id,
        user_email,
        name,
        nome,
        email,
        phone,
        telefone,
        celular,
        address,
        endereco,
        cnpj,
        cpf_cnpj,
        cpf,
        document,
        description,
        observacoes,
        obs,
        created_at,
        updated_at
      `)
      .limit(10);
    
    if (allClientsError) {
      console.error('Erro ao buscar todos os clientes:', allClientsError);
    } else {
      console.log(`Total de clientes encontrados na base FinanceFlow: ${allClientsData?.length || 0}`);
      if (allClientsData && allClientsData.length > 0) {
        console.log('Exemplo de cliente na base:', {
          id: allClientsData[0].id,
          user_email: allClientsData[0].user_email,
          name: allClientsData[0].name || allClientsData[0].nome,
          email: allClientsData[0].email
        });
        
        // Verificar se existem clientes com o user_email procurado
        const clientsWithEmail = allClientsData.filter(client => client.user_email === userEmail);
        console.log(`Clientes encontrados com user_email ${userEmail}: ${clientsWithEmail.length}`);
        
        if (clientsWithEmail.length === 0) {
          // Buscar clientes com emails similares para debug
          const similarEmails = allClientsData
            .filter(client => client.user_email && client.user_email.includes('@'))
            .map(client => client.user_email)
            .slice(0, 5);
          console.log('Emails encontrados na base (primeiros 5):', similarEmails);
        }
      }
    }
    
    // Agora buscar clientes usando user_email diretamente
    console.log(`=== Buscando clientes específicos para user_email: ${userEmail} ===`);
    const { data: clientsData, error: clientsError } = await financeflowSupabase
      .from('clients')
      .select(`
        id,
        user_id,
        user_email,
        name,
        nome,
        email,
        phone,
        telefone,
        celular,
        address,
        endereco,
        cnpj,
        cpf_cnpj,
        cpf,
        document,
        description,
        observacoes,
        obs,
        created_at,
        updated_at
      `)
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (clientsError) {
      console.error('Erro ao buscar clientes por user_email:', clientsError);
      throw clientsError;
    }

    console.log(`Encontrados ${clientsData?.length || 0} clientes para user_email ${userEmail}`);
    
    if (clientsData && clientsData.length > 0) {
      console.log('Clientes encontrados:', clientsData.map(client => ({
        id: client.id,
        name: client.name || client.nome,
        email: client.email,
        user_email: client.user_email,
        phone: client.phone || client.telefone || client.celular,
        cnpj: client.cnpj || client.cpf_cnpj || client.document || client.cpf
      })));
    } else {
      console.log('ATENÇÃO: Nenhum cliente encontrado para este user_email no FinanceFlow');
      console.log('Verificar se:');
      console.log('1. O user_email está correto:', userEmail);
      console.log('2. Existem clientes cadastrados no FinanceFlow com este email');
      console.log('3. O campo user_email está preenchido na tabela clients do FinanceFlow');
    }

    return clientsData || [];
  } catch (error) {
    console.error('Erro na função fetchFinanceFlowClientsByUserEmail:', error);
    throw error;
  }
};

serve(async (req) => {
  console.log('=== Edge Function Called ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error('Method not allowed:', req.method)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    console.log('=== Starting sync function ===')

    // Parse request body
    let requestBody;
    try {
      const rawBody = await req.text()
      console.log('Raw request body:', rawBody)
      requestBody = JSON.parse(rawBody)
    } catch (e) {
      console.error('Error parsing request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: e.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { user_email, action = 'sync' } = requestBody
    console.log('Processing request:', { user_email, action })
    
    // Validate email format
    if (!user_email || typeof user_email !== 'string' || !user_email.includes('@')) {
      console.error('Invalid email provided:', user_email)
      return new Response(
        JSON.stringify({ error: 'Valid user_email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get environment variables
    const contratproUrl = Deno.env.get('CONTRATPRO_SUPABASE_URL');
    const contratproKey = Deno.env.get('CONTRATPRO_SUPABASE_KEY');
    const financeflowUrl = Deno.env.get('FINANCEFLOW_SUPABASE_URL');
    const financeflowKey = Deno.env.get('FINANCEFLOW_SUPABASE_KEY');

    console.log('=== Environment Variables Check ===')
    console.log('SUPABASE_URL:', contratproUrl ? `Set (${contratproUrl.substring(0, 20)}...)` : 'MISSING')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', contratproKey ? 'Set (hidden)' : 'MISSING')
    console.log('FINANCEFLOW_SUPABASE_URL:', financeflowUrl ? `Set (${financeflowUrl.substring(0, 20)}...)` : 'MISSING')
    console.log('FINANCEFLOW_SUPABASE_KEY:', financeflowKey ? 'Set (hidden)' : 'MISSING')

    // Check credentials
    if (!contratproUrl || !contratproKey) {
      console.error('Missing ContratPro Supabase credentials')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ContratPro database not configured', 
          sync_status: 'failed' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!financeflowUrl || !financeflowKey) {
      console.error('Missing FinanceFlow Supabase credentials')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'FinanceFlow connection not configured', 
          sync_status: 'failed' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase clients
    let contratproSupabase, financeflowSupabase;
    
    try {
      console.log('=== Initializing Supabase clients ===')
      contratproSupabase = createClient(contratproUrl, contratproKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      financeflowSupabase = createClient(financeflowUrl, financeflowKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      console.log('Supabase clients initialized successfully')
    } catch (error) {
      console.error('Error initializing Supabase clients:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to initialize database connections', 
          sync_status: 'failed',
          details: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Fetch user from FinanceFlow
    console.log('=== Step 1: Fetching user from FinanceFlow ===')
    let financeflowUser;
    try {
      const { data, error } = await financeflowSupabase
        .from('profiles')
        .select(`
          id,
          email,
          subscription,
          name
        `)
        .eq('email', user_email)
        .single()

      if (error) {
        console.error('FinanceFlow query error:', error)
        throw error
      }

      financeflowUser = data
      console.log('FinanceFlow user found:', { 
        id: financeflowUser.id, 
        email: financeflowUser.email, 
        subscription: financeflowUser.subscription,
        name: financeflowUser.name 
      })
    } catch (error) {
      console.error('Error fetching FinanceFlow user:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User not found in FinanceFlow or connection failed', 
          sync_status: 'failed',
          details: error.message
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Se a ação for apenas buscar clientes, retornar apenas os clientes
    if (action === 'fetch_clients') {
      console.log('=== Ação: Buscar apenas clientes ===')
      try {
        const clients = await fetchFinanceFlowClientsByUserEmail(financeflowSupabase, user_email);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            action: 'fetch_clients',
            user_email: user_email,
            clients: clients,
            clients_count: clients.length,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Erro ao buscar clientes do FinanceFlow',
            details: error.message,
            timestamp: new Date().toISOString()
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Step 2: Get ContratPro user
    console.log('=== Step 2: Fetching user from ContratPro ===')
    let contratproUser;
    try {
      // Try to get user from profiles table first
      const { data: profileData, error: profileError } = await contratproSupabase
        .from('user_profiles')  
        .select('id, email, name, user_id')
        .eq('email', user_email)
        .maybeSingle()

      if (!profileError && profileData) {
        contratproUser = {
          user: {
            id: profileData.user_id,
            email: profileData.email
          }
        }
        console.log('ContratPro user found via user_profiles:', { 
          id: contratproUser.user.id, 
          email: contratproUser.user.email 
        })
      } else {
        console.log('User not found in user_profiles, checking auth.users...')
        
        const { data: userData, error: userError } = await contratproSupabase.auth.admin.listUsers()
        
        if (userData && userData.users) {
          const foundUser = userData.users.find(u => u.email === user_email)
          if (foundUser) {
            contratproUser = {
              user: {
                id: foundUser.id,
                email: foundUser.email
              }
            }
            console.log('ContratPro user found via auth.users:', { 
              id: contratproUser.user.id, 
              email: contratproUser.user.email 
            })
          } else {
            throw new Error('User not found in ContratPro database')
          }
        } else {
          throw new Error('Could not access auth.users')
        }
      }
    } catch (error) {
      console.error('Error fetching ContratPro user:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User not found in ContratPro or insufficient permissions', 
          sync_status: 'failed',
          details: error.message
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Map and sync subscription plan
    console.log('=== Step 3: Mapping subscription plan ===')
    const planMapping: Record<string, string> = {
      'premium': 'Profissional',
      'enterprise': 'Empresarial',
      'enterprise-annual': 'Empresarial',
      'free': 'Gratuito',
      'gratuito': 'Gratuito'
    }

    const originalPlan = financeflowUser.subscription?.toLowerCase() || 'free'
    const contratproPlan = planMapping[originalPlan] || 'Gratuito'
    
    console.log(`Plan mapping: ${financeflowUser.subscription} -> ${contratproPlan}`)

    // Step 4: Sync clients from FinanceFlow usando user_email
    console.log('=== Step 4: Syncing clients usando user_email ===')
    let clientsSynced = 0
    
    try {
      // Usar a nova função para buscar clientes por user_email
      const financeflowClients = await fetchFinanceFlowClientsByUserEmail(financeflowSupabase, user_email);
      
      console.log(`=== Resultado da busca de clientes FinanceFlow ===`);
      console.log(`Clientes encontrados: ${financeflowClients?.length || 0}`);
      
      if (financeflowClients && financeflowClients.length > 0) {
        console.log('Sample client data from FinanceFlow:', financeflowClients[0])
        
        // Get existing clients to avoid duplicates
        const { data: existingClients } = await contratproSupabase
          .from('clients')
          .select('email, cnpj, name')
          .eq('user_id', contratproUser.user.id)

        console.log(`Found ${existingClients?.length || 0} existing clients in ContratPro`)

        const existingEmails = new Set(existingClients?.map(c => c.email).filter(Boolean) || [])
        const existingCnpjs = new Set(existingClients?.map(c => c.cnpj).filter(Boolean) || [])
        const existingNames = new Set(existingClients?.map(c => c.name).filter(Boolean) || [])

        // Transform and filter clients according to ContratPro schema
        const clientsToInsert = financeflowClients
          .map(client => {
            console.log('Processing FinanceFlow client:', {
              name: client.name || client.nome,
              email: client.email,
              phone: client.phone || client.telefone || client.celular,
              cnpj: client.cnpj || client.cpf_cnpj || client.document || client.cpf,
              user_email: client.user_email
            })
            
            return {
              user_id: contratproUser.user.id,
              company_id: null, // Não temos company_id no FinanceFlow
              name: client.name || client.nome || 'Cliente sem nome',
              phone: client.phone || client.telefone || client.celular || null,
              email: client.email || null,
              address: client.address || client.endereco || null,
              cnpj: client.cnpj || client.cpf_cnpj || client.document || client.cpf || null,
              description: client.description || client.observacoes || client.obs || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
          .filter(client => {
            // Avoid duplicates by name, email or CNPJ
            if (existingNames.has(client.name)) {
              console.log(`Skipping duplicate client by name: ${client.name}`)
              return false
            }
            if (client.email && existingEmails.has(client.email)) {
              console.log(`Skipping duplicate client by email: ${client.email}`)
              return false
            }
            if (client.cnpj && existingCnpjs.has(client.cnpj)) {
              console.log(`Skipping duplicate client by CNPJ: ${client.cnpj}`)
              return false
            }
            return true
          })

        console.log(`Clients to insert: ${clientsToInsert.length}`)

        if (clientsToInsert.length > 0) {
          console.log('Inserting clients into ContratPro:', clientsToInsert.map(c => ({ 
            name: c.name, 
            email: c.email, 
            phone: c.phone,
            cnpj: c.cnpj 
          })))
          
          const { data: insertData, error: insertError } = await contratproSupabase
            .from('clients')
            .insert(clientsToInsert)
            .select()

          if (insertError) {
            console.error('Error inserting clients:', insertError)
            console.error('Insert error details:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            })
            throw insertError
          }

          clientsSynced = clientsToInsert.length
          console.log(`Successfully synced ${clientsSynced} new clients`)
          console.log('Inserted clients data:', insertData)
        } else {
          console.log('No new clients to sync (all already exist)')
        }
      } else {
        console.log('No clients found in FinanceFlow for this user_email')
        console.log('IMPORTANTE: Verificar se existem clientes cadastrados no FinanceFlow com user_email:', user_email)
      }
    } catch (error) {
      console.error('Error during client sync:', error)
      console.error('Client sync error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Don't fail the entire operation for client sync issues, but log the error
      console.log('Continuing despite client sync error...')
    }

    console.log('=== Sync completed successfully ===')
    console.log(`Plan: ${financeflowUser.subscription} -> ${contratproPlan}`)
    console.log(`Clients synced: ${clientsSynced}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sync_status: 'success',
        original_plan: financeflowUser.subscription,
        mapped_plan: contratproPlan,
        clients_synced: clientsSynced,
        contracts_synced: 0,
        synced_at: new Date().toISOString(),
        message: `Sync completed successfully. Plan: ${contratproPlan}, Clients: ${clientsSynced}`,
        financeflow_user_id: financeflowUser.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== FATAL ERROR ===')
    console.error('Error details:', error)
    console.error('Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error during sync', 
        sync_status: 'failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
