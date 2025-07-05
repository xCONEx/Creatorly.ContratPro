import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const planMapping = {
  free: "Gratuito",
  basic: "Gratuito",
  premium: "Profissional",
  pro: "Profissional",
  enterprise: "Empresarial",
  business: "Empresarial",
  "enterprise-annual": "Empresarial",
  "enterprise-monthly": "Empresarial",
  "pro-annual": "Profissional",
  "pro-monthly": "Profissional"
};

// Função para diagnosticar estrutura do FinanceFlow
const diagnoseFinanceFlowStructure = async (financeflowSupabase: any) => {
  console.log('=== Diagnóstico da estrutura do FinanceFlow ===');
  
  try {
    // Testar tabela profiles (PRINCIPAL)
    console.log('1. Testando tabela profiles...');
    const { data: profilesData, error: profilesError } = await financeflowSupabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Erro ao acessar tabela profiles:', profilesError);
    } else {
      console.log('Tabela profiles acessível. Estrutura:', Object.keys(profilesData?.[0] || {}));
    }

    // Testar tabela clients
    console.log('2. Testando tabela clients...');
    const { data: clientsData, error: clientsError } = await financeflowSupabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.error('Erro ao acessar tabela clients:', clientsError);
    } else {
      console.log('Tabela clients acessível. Estrutura:', Object.keys(clientsData?.[0] || {}));
    }

    return {
      profiles: !profilesError,
      clients: !clientsError
    };
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    return { profiles: false, clients: false };
  }
};

// Função para buscar usuário no FinanceFlow
const fetchFinanceFlowUser = async (financeflowSupabase: any, userEmail: string) => {
  console.log(`=== Buscando usuário no FinanceFlow: ${userEmail} ===`);
  
  try {
    console.log('Buscando na tabela profiles...');
    
    const { data, error } = await financeflowSupabase
      .from('profiles')
      .select('id, email, subscription, name, subscription_data')
      .eq('email', userEmail)
      .single();
    
    if (error) {
      console.error('Erro ao buscar em profiles:', error);
      throw new Error(`Usuário não encontrado no FinanceFlow: ${error.message}`);
    }
    
    console.log('Usuário encontrado em profiles:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário no FinanceFlow:', error.message);
    throw error;
  }
};

// Função para buscar usuário no ContratPro
const fetchContratProUser = async (contratproSupabase: any, userEmail: string) => {
  console.log(`=== Buscando usuário no ContratPro: ${userEmail} ===`);
  
  try {
    // Buscar na tabela profiles primeiro
    const { data: profileData, error: profileError } = await contratproSupabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar em profiles:', profileError);
      throw new Error('Erro ao buscar profiles');
    }

    if (profileData) {
      console.log('Usuário encontrado em profiles:', profileData);
      return profileData;
    }

    // Se não encontrou em profiles, buscar em user_profiles
    console.log('Buscando em user_profiles...');
    const { data: userProfileData, error: userProfileError } = await contratproSupabase
      .from('user_profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userProfileError && userProfileError.code !== 'PGRST116') {
      console.error('Erro ao buscar em user_profiles:', userProfileError);
      throw new Error('Erro ao buscar user_profiles');
    }

    if (userProfileData) {
      console.log('Usuário encontrado em user_profiles:', userProfileData);
      return userProfileData;
    }

    throw new Error('Usuário não encontrado no ContratPro');
  } catch (error) {
    console.error('Erro ao buscar usuário no ContratPro:', error.message);
    throw error;
  }
};

// Função para mapear planos do FinanceFlow para ContratPro
const mapFinanceFlowPlanToContratPro = (financeflowPlan: string) => {
  const originalPlan = financeflowPlan?.toLowerCase() || 'free';
  return planMapping[originalPlan] || 'Gratuito';
};

// Função para atualizar assinatura do usuário
const updateUserSubscription = async (contratproSupabase: any, userId: string, planName: string) => {
  console.log(`=== Atualizando assinatura para: ${planName} ===`);
  
  try {
    // Buscar o plano no ContratPro
    const { data: planData, error: planError } = await contratproSupabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .single();

    if (planError || !planData) {
      console.error('Plano não encontrado:', planError);
      throw new Error(`Plano ${planName} não encontrado no ContratPro`);
    }

    console.log('Plano encontrado:', planData.id);

    // Atualizar ou criar assinatura
    const { data: subscriptionData, error: subscriptionError } = await contratproSupabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planData.id,
        status: 'active',
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Erro ao atualizar assinatura:', subscriptionError);
      throw new Error(`Falha ao atualizar assinatura: ${subscriptionError.message}`);
    }

    console.log('Assinatura atualizada com sucesso:', subscriptionData);
    return subscriptionData;
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Starting FinanceFlow sync function ===')
    
    // Parse request body
    const { user_email, action = 'sync' } = await req.json()
    
    if (!user_email) {
      console.error('Missing user_email in request');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'user_email is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing request:', { user_email, action })

    // Initialize Supabase clients
    const contratproUrl = Deno.env.get('SUPABASE_URL')!
    const contratproKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const financeflowUrl = "https://elsilxqruurrbdebxndx.supabase.co"
    const financeflowKey = Deno.env.get('FINANCEFLOW_SUPABASE_KEY')!

    console.log('Environment variables loaded:', {
      contratproUrl: contratproUrl ? 'OK' : 'MISSING',
      contratproKey: contratproKey ? 'OK' : 'MISSING',
      financeflowUrl: financeflowUrl,
      financeflowKey: financeflowKey ? 'OK' : 'MISSING'
    });

    const contratproSupabase = createClient(contratproUrl, contratproKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const financeflowSupabase = createClient(financeflowUrl, financeflowKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Buscar usuário no FinanceFlow
    const { data: financeflowUser, error: userError } = await financeflowSupabase
      .from('profiles')
      .select('*')
      .eq('email', user_email)
      .single();

    if (userError || !financeflowUser) {
      console.error('[SYNC] Erro ao buscar perfil no FinanceFlow:', userError);
      throw new Error('Usuário não encontrado no FinanceFlow');
    }

    // Buscar ou criar perfil no ContratPro
    const { data: userProfile, error: profileError } = await contratproSupabase
      .from('user_profiles')
      .select('*')
      .eq('email', user_email)
      .maybeSingle();

    let finalUserProfile = userProfile;
    
    if (!finalUserProfile) {
      const { data: newProfile, error: createError } = await contratproSupabase
        .from('user_profiles')
        .insert({
          email: user_email,
          name: financeflowUser.name || 'Usuário',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('[SYNC] Erro ao criar perfil no ContratPro:', createError);
        throw createError;
      }

      finalUserProfile = newProfile;
      console.log('[SYNC] Perfil criado no ContratPro:', finalUserProfile.id);
    }

    // Mapear plano do FinanceFlow para ContratPro
    const planKey = (financeflowUser.subscription || 'free').toLowerCase();
    const contratproPlan = planMapping[planKey] || 'Gratuito';

    // Buscar plano no ContratPro
    const { data: planData, error: planError } = await contratproSupabase
      .from('subscription_plans')
      .select('*')
      .eq('name', contratproPlan)
      .single();

    if (planError || !planData) {
      console.error('[SYNC] Plano não encontrado:', contratproPlan, planError);
      throw new Error(`Plano ${contratproPlan} não encontrado`);
    }

    // Atualizar assinatura do usuário
    const { error: subError } = await contratproSupabase
      .from('user_subscriptions')
      .upsert({
        user_id: finalUserProfile.id,
        plan_id: planData.id,
        status: 'active',
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subError) {
      console.error('[SYNC] Erro ao atualizar assinatura:', subError);
      throw subError;
    }

    console.log('[SYNC] Plano sincronizado:', contratproPlan);

    // Sincronizar clientes
    const { data: clientsData, error: clientsError } = await financeflowSupabase
      .from('clients')
      .select(`
        id, user_id, user_email, name, email, phone, address, cnpj, description, created_at, updated_at
      `)
      .eq('user_email', user_email);

    if (clientsError) {
      console.error('[SYNC] Erro ao buscar clientes:', clientsError);
      throw clientsError;
    }

    const formattedClients = clientsData.map((client) => ({
      financeflow_id: client.id,
      user_id: finalUserProfile.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      cnpj: client.cnpj,
      description: client.description,
      created_at: client.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    if (formattedClients.length > 0) {
      const { error: syncError } = await contratproSupabase
        .from('clients')
        .upsert(formattedClients, {
          onConflict: 'financeflow_id'
        });

      if (syncError) {
        console.error('[SYNC] Erro ao sincronizar clientes:', syncError);
        throw syncError;
      }

      console.log(`[SYNC] ${formattedClients.length} cliente(s) sincronizado(s)`);
    } else {
      console.log('[SYNC] Nenhum cliente encontrado para sincronizar.');
    }

    // Step 5: Return success response
    console.log('=== Step 5: Sync completed successfully ===')
    
    const result = {
      success: true,
      sync_status: 'success',
      user_email: user_email,
      financeflow_user: financeflowUser ? {
        id: financeflowUser.id,
        subscription: financeflowUser.subscription
      } : null,
      contratpro_user: {
        id: finalUserProfile.id,
        email: finalUserProfile.email
      },
      final_plan: contratproPlan,
      synced_clients: formattedClients.length,
      synced_at: new Date().toISOString(),
      message: `Plano ${contratproPlan} sincronizado com ${formattedClients.length} cliente(s).`
    }

    console.log('Sync result:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SYNC][ERROR]', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno no servidor',
        details: error.message || error
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
