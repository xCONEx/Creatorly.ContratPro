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
    const { count, error: testError } = await financeflowSupabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error('Erro de conexão com FinanceFlow:', testError);
      throw new Error(`Conexão com FinanceFlow falhou: ${testError.message}`);
    }
    
    console.log(`Conexão com FinanceFlow estabelecida. Total de clientes na base: ${count}`);
    
    // Se for ação de fetch_clients, buscar TODOS os clientes primeiro para debug
    console.log('=== Debug: Buscando TODOS os clientes do FinanceFlow ===');
    const { data: allClientsData, error: allClientsError } = await financeflowSupabase
      .from('clients')
      .select(`
        id,
        user_id,
        user_email,
        name,
        email,
        phone,
        address,
        cnpj,
        cpf_cnpj,
        description,
        created_at,
        updated_at
      `)
      .limit(5);
    
    if (allClientsError) {
      console.error('Erro ao buscar todos os clientes:', allClientsError);
    } else {
      console.log(`Primeiros 5 clientes na base FinanceFlow:`, allClientsData?.map(c => ({
        id: c.id,
        name: c.name,
        user_email: c.user_email,
        email: c.email
      })));
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
        email,
        phone,
        address,
        cnpj,
        cpf_cnpj,
        description,
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
        name: client.name,
        email: client.email,
        user_email: client.user_email,
        phone: client.phone,
        cnpj: client.cnpj || client.cpf_cnpj
      })));
    } else {
      console.log('ATENÇÃO: Nenhum cliente encontrado para este user_email no FinanceFlow');
      console.log('Verificações necessárias:');
      console.log('1. O user_email está correto:', userEmail);
      console.log('2. Existem clientes cadastrados no FinanceFlow com este email no campo user_email');
      console.log('3. O campo user_email está preenchido na tabela clients do FinanceFlow');
      
      // Verificar se existem clientes com emails similares
      if (allClientsData && allClientsData.length > 0) {
        const emailsFound = allClientsData
          .filter(client => client.user_email)
          .map(client => client.user_email)
          .slice(0, 3);
        console.log('Exemplos de user_emails encontrados na base:', emailsFound);
      }
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
    console.log('SUPABASE_URL:', contratproUrl ? `Set (${contratproUrl.substring(0, 30)}...)` : 'MISSING')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', contratproKey ? 'Set (hidden)' : 'MISSING')
    console.log('FINANCEFLOW_SUPABASE_URL:', financeflowUrl ? `Set (${financeflowUrl.substring(0, 30)}...)` : 'MISSING')
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

    // Step 2: Get ContratPro user
    console.log('=== Step 2: Fetching user from ContratPro ===');
    let contratproUser;
    try {
      // Buscar apenas em user_profiles
      const { data: profileData, error: profileError } = await contratproSupabase.from('user_profiles').select('user_id, email, name').eq('email', user_email).maybeSingle();
      if (!profileError && profileData) {
        contratproUser = {
          user: {
            id: profileData.user_id,
            email: profileData.email
          }
        };
        console.log('ContratPro user found via user_profiles:', {
          id: contratproUser.user.id,
          email: contratproUser.user.email
        });
      } else {
        throw new Error('User not found in ContratPro database');
      }
    } catch (error) {
      console.error('Error fetching ContratPro user:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found in ContratPro or insufficient permissions',
        sync_status: 'failed',
        details: error.message
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Step 3: Map and sync subscription plan
    console.log('=== Step 3: Mapping subscription plan ===');
    const planMapping = {
      'premium': 'Profissional',
      'enterprise': 'Empresarial',
      'enterprise-annual': 'Empresarial',
      'free': 'Gratuito',
      'gratuito': 'Gratuito'
    };
    const originalPlan = financeflowUser.subscription?.toLowerCase() || 'free';
    const contratproPlan = planMapping[originalPlan] || 'Gratuito';
    console.log(`Plan mapping: ${financeflowUser.subscription} -> ${contratproPlan}`);

    // Step 3.1: Atualizar plano do ContratPro (user_subscriptions)
    try {
      // Buscar plano atual do ContratPro
      const { data: userSub, error: userSubError } = await contratproSupabase.from('user_subscriptions').select('id, plan_id, status').eq('user_id', contratproUser.user.id).maybeSingle();
      // Buscar plano correspondente
      const { data: planData, error: planError } = await contratproSupabase.from('subscription_plans').select('id, name').eq('name', contratproPlan).maybeSingle();
      if (planError || !planData) {
        throw new Error('Plano não encontrado no ContratPro: ' + contratproPlan);
      }
      if (!userSub) {
        // Criar nova assinatura
        await contratproSupabase.from('user_subscriptions').insert({
          user_id: contratproUser.user.id,
          plan_id: planData.id,
          status: 'active',
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        console.log('Assinatura criada no ContratPro:', contratproPlan);
      } else if (userSub.plan_id !== planData.id || userSub.status !== 'active') {
        // Atualizar assinatura existente
        await contratproSupabase.from('user_subscriptions').update({
          plan_id: planData.id,
          status: 'active',
          updated_at: new Date().toISOString()
        }).eq('id', userSub.id);
        console.log('Assinatura atualizada no ContratPro:', contratproPlan);
      } else {
        console.log('Assinatura já está correta no ContratPro.');
      }
    } catch (error) {
      console.error('Erro ao atualizar plano do ContratPro:', error);
    }

    // Step 4: Sync clients from FinanceFlow usando user_email
    console.log('=== Step 4: Syncing clients usando user_email ===');
    let clientsSynced = 0;
    try {
      // Usar a nova função para buscar clientes por user_email
      const financeflowClients = await fetchFinanceFlowClientsByUserEmail(financeflowSupabase, user_email);
      console.log(`=== Resultado da busca de clientes FinanceFlow ===`);
      console.log(`Clientes encontrados: ${financeflowClients?.length || 0}`);
      // Buscar clientes existentes do ContratPro
      const { data: existingClients } = await contratproSupabase.from('clients').select('email, cnpj, name, origin').eq('user_id', contratproUser.user.id);
      const existingEmails = new Set(existingClients?.filter(c => c.origin === 'financeflow').map(c => c.email).filter(Boolean) || []);
      const existingCnpjs = new Set(existingClients?.filter(c => c.origin === 'financeflow').map(c => c.cnpj).filter(Boolean) || []);
      const existingNames = new Set(existingClients?.filter(c => c.origin === 'financeflow').map(c => c.name).filter(Boolean) || []);
      // Transformar e filtrar clientes
      const clientsToInsert = financeflowClients.map((client) => ({
        user_id: contratproUser.user.id,
        company_id: null,
        name: client.name || 'Cliente sem nome',
        phone: client.phone || null,
        email: client.email || null,
        address: client.address || null,
        cnpj: client.cnpj || client.cpf_cnpj || null,
        description: client.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        origin: 'financeflow'
      })).filter((client) => {
        // Evitar duplicatas por nome, email ou CNPJ
        if (existingNames.has(client.name)) return false;
        if (client.email && existingEmails.has(client.email)) return false;
        if (client.cnpj && existingCnpjs.has(client.cnpj)) return false;
        return true;
      });
      if (clientsToInsert.length > 0) {
        const { error: insertError } = await contratproSupabase.from('clients').insert(clientsToInsert);
        if (insertError) {
          console.error('Erro ao inserir clientes:', insertError);
          throw insertError;
        }
        clientsSynced = clientsToInsert.length;
        console.log(`Clientes do FinanceFlow inseridos: ${clientsSynced}`);
      } else {
        console.log('Nenhum novo cliente do FinanceFlow para inserir.');
      }
      // Se o plano do usuário NÃO for elegível, remover/ocultar clientes de origem 'financeflow'
      if (!['Profissional', 'Empresarial'].includes(contratproPlan)) {
        // Remover clientes de origem 'financeflow' deste usuário
        const { error: delError } = await contratproSupabase.from('clients').delete().eq('user_id', contratproUser.user.id).eq('origin', 'financeflow');
        if (delError) {
          console.error('Erro ao remover clientes de origem financeflow:', delError);
        } else {
          console.log('Clientes de origem financeflow removidos pois o plano não é elegível.');
        }
        clientsSynced = 0;
      }
    } catch (error) {
      console.error('Erro durante sync de clientes:', error);
      console.log('Continuando apesar do erro de sync de clientes...');
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
