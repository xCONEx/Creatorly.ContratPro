import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    return res.status(200).end('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(400).json({ error: 'user_email is required' });
    }

    const contratproUrl = process.env.CONTRATPRO_SUPABASE_URL;
    const contratproKey = process.env.CONTRATPRO_SUPABASE_KEY;
    const financeflowUrl = process.env.FINANCEFLOW_SUPABASE_URL;
    const financeflowKey = process.env.FINANCEFLOW_SUPABASE_KEY;

    if (!contratproUrl || !contratproKey) {
      return res.status(500).json({ error: 'Missing ContratPro Supabase credentials' });
    }
    if (!financeflowUrl || !financeflowKey) {
      return res.status(500).json({ error: 'Missing FinanceFlow Supabase credentials' });
    }

    const contratproSupabase = createClient(contratproUrl, contratproKey);
    const financeflowSupabase = createClient(financeflowUrl, financeflowKey);

    const { data: financeflowUser, error: ffError } = await financeflowSupabase
      .from('profiles')
      .select(`id, email, subscription, name`)
      .eq('email', user_email)
      .single();

    if (ffError) {
      return res.status(404).json({ error: 'User not found in FinanceFlow', details: ffError.message });
    }

    const { data: contratproUser, error: cpUserError } = await contratproSupabase.auth.admin.getUserByEmail(user_email);
    if (cpUserError || !contratproUser.user) {
      return res.status(404).json({ error: 'User not found in ContratPro' });
    }

    const planMapping: { [key: string]: string } = {
      'premium': 'Profissional',
      'enterprise': 'Empresarial',
      'free': 'Gratuito'
    };
    const contratproPlan = planMapping[financeflowUser.subscription?.toLowerCase()] || 'Gratuito';

    const { data: targetPlan, error: planError } = await contratproSupabase
      .from('subscription_plans')
      .select('id')
      .eq('name', contratproPlan)
      .single();

    if (planError || !targetPlan) {
      return res.status(404).json({ error: `Plan ${contratproPlan} not found in ContratPro` });
    }

    const { error: updateError } = await contratproSupabase
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
      });

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update subscription in ContratPro', details: updateError.message });
    }

    let clientsSynced = 0;
    const { data: financeflowClients, error: clientsError } = await financeflowSupabase
      .from('clients')
      .select('*')
      .eq('user_id', financeflowUser.id);

    if (!clientsError && financeflowClients?.length > 0) {
      const clientsToInsert = financeflowClients.map(client => ({
        user_id: contratproUser.user.id,
        name: client.name || 'Cliente sem nome',
        email: client.email || null,
        phone: client.phone || null,
        address: client.address || null,
        cpf_cnpj: client.cpf_cnpj || client.document || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: existingClients } = await contratproSupabase
        .from('clients')
        .select('email, cpf_cnpj')
        .eq('user_id', contratproUser.user.id);

      const existingEmails = new Set(existingClients?.map(c => c.email).filter(Boolean) || []);
      const existingDocs = new Set(existingClients?.map(c => c.cpf_cnpj).filter(Boolean) || []);

      const newClients = clientsToInsert.filter(client => {
        if (client.email && existingEmails.has(client.email)) return false;
        if (client.cpf_cnpj && existingDocs.has(client.cpf_cnpj)) return false;
        return true;
      });

      if (newClients.length > 0) {
        const { error: insertError } = await contratproSupabase.from('clients').insert(newClients);
        if (!insertError) clientsSynced = newClients.length;
      }
    }

    return res.status(200).json({
      success: true,
      original_plan: financeflowUser.subscription,
      mapped_plan: contratproPlan,
      clients_synced: clientsSynced,
      message: `Plan successfully synced from ${financeflowUser.subscription} to ${contratproPlan}. ${clientsSynced} clients synchronized.`,
      synced_at: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Internal error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
