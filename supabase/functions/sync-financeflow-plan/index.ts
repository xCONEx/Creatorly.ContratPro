
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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

    // Parse request body with better error handling
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

    const { user_email } = requestBody
    console.log('Processing sync for user:', user_email)
    
    // Validate email format
    if (!user_email || typeof user_email !== 'string' || !user_email.includes('@')) {
      console.error('Invalid email provided:', user_email)
      return new Response(
        JSON.stringify({ error: 'Valid user_email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get environment variables with detailed logging
    const contratproUrl = Deno.env.get('CONTRATPRO_SUPABASE_URL');
    const contratproKey = Deno.env.get('CONTRATPRO_SUPABASE_KEY');
    const financeflowUrl = Deno.env.get('FINANCEFLOW_SUPABASE_URL');
    const financeflowKey = Deno.env.get('FINANCEFLOW_SUPABASE_KEY');
    
    console.log('=== Environment Variables Check ===')
    console.log('SUPABASE_URL:', contratproUrl ? `Set (${contratproUrl.substring(0, 20)}...)` : 'MISSING')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', contratproKey ? 'Set (hidden)' : 'MISSING')
    console.log('FINANCEFLOW_SUPABASE_URL:', financeflowUrl ? `Set (${financeflowUrl.substring(0, 20)}...)` : 'MISSING')
    console.log('FINANCEFLOW_SUPABASE_KEY:', financeflowKey ? 'Set (hidden)' : 'MISSING')

    // Check ContratPro credentials
    if (!contratproUrl || !contratproKey) {
      console.error('Missing ContratPro Supabase credentials')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ContratPro database not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', 
          sync_status: 'failed' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check FinanceFlow credentials
    if (!financeflowUrl || !financeflowKey) {
      console.error('Missing FinanceFlow Supabase credentials')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'FinanceFlow connection not configured. Please add FINANCEFLOW_SUPABASE_URL and FINANCEFLOW_SUPABASE_KEY to Supabase Secrets.', 
          sync_status: 'failed' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase clients with error handling
    let contratproSupabase, financeflowSupabase;
    
    try {
      console.log('=== Initializing Supabase clients ===')
      contratproSupabase = createClient(contratproUrl, contratproKey)
      financeflowSupabase = createClient(financeflowUrl, financeflowKey)
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

    // Step 2: Get ContratPro user with improved error handling
    console.log('=== Step 2: Fetching user from ContratPro ===')
    let contratproUser;
    try {
      // Try to get user from user_profiles table first (more reliable)
      const { data: profileData, error: profileError } = await contratproSupabase
        .from('user_profiles')  
        .select('user_id, email, name')
        .eq('email', user_email)
        .maybeSingle()

      if (!profileError && profileData) {
        contratproUser = {
          user: {
            id: profileData.user_id,
            email: profileData.email
          }
        }
        console.log('ContratPro user found via profiles:', { 
          id: contratproUser.user.id, 
          email: contratproUser.user.email 
        })
      } else {
        console.log('User not found in user_profiles, trying auth.users...')
        
        // Fallback: try to access auth.users (less reliable but sometimes needed)
        const { data: authUsers, error: authError } = await contratproSupabase
          .rpc('get_user_by_email', { email_input: user_email })

        if (!authError && authUsers && authUsers.length > 0) {
          contratproUser = {
            user: {
              id: authUsers[0].id,
              email: authUsers[0].email
            }
          }
          console.log('ContratPro user found via RPC:', { 
            id: contratproUser.user.id, 
            email: contratproUser.user.email 
          })
        } else {
          throw new Error('User not found in ContratPro database')
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
      'free': 'Gratuito'
    }

    const originalPlan = financeflowUser.subscription?.toLowerCase() || 'free'
    const contratproPlan = planMapping[originalPlan] || 'Gratuito'
    
    console.log(`Plan mapping: ${financeflowUser.subscription} -> ${contratproPlan}`)

    // Get target plan ID
    let targetPlan;
    try {
      const { data, error } = await contratproSupabase
        .from('subscription_plans')
        .select('id, name')
        .eq('name', contratproPlan)
        .single()

      if (error) {
        console.error('Plan query error:', error)
        throw error
      }

      targetPlan = data
      console.log('Target plan found:', targetPlan)
    } catch (error) {
      console.error('Error finding subscription plan:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Plan ${contratproPlan} not found in ContratPro`, 
          sync_status: 'failed',
          details: error.message
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user subscription
    console.log('=== Step 4: Updating user subscription ===')
    try {
      const { error } = await contratproSupabase
        .from('user_subscriptions')
        .upsert({
          user_id: contratproUser.user.id,
          plan_id: targetPlan.id,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Subscription update error:', error)
        throw error
      }

      console.log('Subscription updated successfully')
    } catch (error) {
      console.error('Error updating subscription:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to update subscription in ContratPro', 
          sync_status: 'failed',
          details: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 5: Sync clients
    console.log('=== Step 5: Syncing clients ===')
    let clientsSynced = 0
    
    try {
      // Fetch clients from FinanceFlow
      const { data: financeflowClients, error: clientsError } = await financeflowSupabase
        .from('clients')
        .select('*')
        .eq('user_id', financeflowUser.id)

      if (clientsError) {
        console.error('Error fetching FinanceFlow clients:', clientsError)
        throw clientsError
      }

      console.log(`Found ${financeflowClients?.length || 0} clients in FinanceFlow`)

      if (financeflowClients && financeflowClients.length > 0) {
        // Get existing clients to avoid duplicates
        const { data: existingClients } = await contratproSupabase
          .from('clients')
          .select('email, cpf_cnpj')
          .eq('user_id', contratproUser.user.id)

        const existingEmails = new Set(existingClients?.map(c => c.email).filter(Boolean) || [])
        const existingDocs = new Set(existingClients?.map(c => c.cpf_cnpj).filter(Boolean) || [])

        // Transform and filter clients
        const clientsToInsert = financeflowClients
          .map(client => ({
            user_id: contratproUser.user.id,
            name: client.name || 'Cliente sem nome',
            email: client.email || null,
            phone: client.phone || null,
            address: client.address || null,
            cpf_cnpj: client.cpf_cnpj || client.document || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
          .filter(client => {
            if (client.email && existingEmails.has(client.email)) return false
            if (client.cpf_cnpj && existingDocs.has(client.cpf_cnpj)) return false
            return true
          })

        if (clientsToInsert.length > 0) {
          const { error: insertError } = await contratproSupabase
            .from('clients')
            .insert(clientsToInsert)

          if (insertError) {
            console.error('Error inserting clients:', insertError)
            throw insertError
          }

          clientsSynced = clientsToInsert.length
          console.log(`Successfully synced ${clientsSynced} new clients`)
        } else {
          console.log('No new clients to sync (all already exist)')
        }
      }
    } catch (error) {
      console.error('Error during client sync:', error)
      // Don't fail the entire operation for client sync issues
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
        synced_at: new Date().toISOString(),
        message: `Plan successfully synced from ${financeflowUser.subscription} to ${contratproPlan}. ${clientsSynced} clients synchronized.`
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
