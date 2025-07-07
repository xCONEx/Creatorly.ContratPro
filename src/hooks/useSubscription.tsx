import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_monthly: number | null;
  price_yearly: number | null;
  max_contracts_per_month: number | null;
  api_access: boolean | null;
  features: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  plan: SubscriptionPlan;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  contractCount: number;
  error: string | null;
  checkPlanLimit: (feature: 'contracts' | 'api') => Promise<boolean>;
  hasFeatureAccess: (feature: string) => boolean;
  getContractLimitText: () => string;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractCount, setContractCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const initializeUserData = async () => {
    setError(null);
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      console.log('[SubscriptionProvider] Iniciando fetch de planos, assinatura e contratos...');
      const [plansResult, subscriptionResult, contractCountResult] = await Promise.allSettled([
        fetchPlans(),
        fetchSubscription(),
        fetchContractCount()
      ]);
      if (plansResult.status === 'fulfilled') setPlans(plansResult.value);
      else setError('Erro ao buscar planos de assinatura.');
      if (subscriptionResult.status === 'fulfilled') setSubscription(subscriptionResult.value);
      else setError('Erro ao buscar assinatura do usuário.');
      if (contractCountResult.status === 'fulfilled') setContractCount(contractCountResult.value);
      else setError('Erro ao buscar contagem de contratos.');
      console.log('[SubscriptionProvider] Fetch concluído.');
    } catch (err: any) {
      console.error('[SubscriptionProvider] Erro geral:', err);
      setError('Erro inesperado ao carregar dados de assinatura.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    initializeUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPlans = async (): Promise<SubscriptionPlan[]> => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');
      if (error) throw error;
      const transformedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : 
          typeof plan.features === 'string' ? (() => {
            try { return JSON.parse(plan.features); } catch (e) {
              const featuresText = plan.features || '';
              const features = [];
              if (featuresText.includes('contrato') || featuresText.includes('Contrato')) features.push('contracts');
              if (featuresText.includes('template') || featuresText.includes('Template')) features.push('templates');
              if (featuresText.includes('API') || featuresText.includes('api')) features.push('api');
              if (featuresText.includes('relatório') || featuresText.includes('Relatório')) features.push('reports');
              if (featuresText.includes('assinatura') || featuresText.includes('Assinatura')) features.push('signature');
              if (featuresText.includes('notificação') || featuresText.includes('Notificação')) features.push('notifications');
              if (featuresText.includes('backup') || featuresText.includes('Backup')) features.push('backup');
              if (featuresText.includes('integração') || featuresText.includes('Integração')) features.push('integrations');
              if (featuresText.includes('analytics') || featuresText.includes('Analytics')) features.push('analytics');
              if (featuresText.includes('suporte') || featuresText.includes('Suporte')) features.push('support');
              return features;
            }
          })() : []
      }));
      return transformedPlans;
    } catch (error) {
      console.error('Error in fetchPlans:', error);
      return [];
    }
  };

  const fetchSubscription = async (): Promise<UserSubscription | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`*, plan:subscription_plans(*)`)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data && data.plan) {
        return {
          ...data,
          plan: {
            ...data.plan,
            features: Array.isArray(data.plan.features) ? data.plan.features :
              typeof data.plan.features === 'string' ? (() => {
                try { return JSON.parse(data.plan.features); } catch (e) {
                  const featuresText = data.plan.features || '';
                  const features = [];
                  if (featuresText.includes('contrato') || featuresText.includes('Contrato')) features.push('contracts');
                  if (featuresText.includes('template') || featuresText.includes('Template')) features.push('templates');
                  if (featuresText.includes('API') || featuresText.includes('api')) features.push('api');
                  if (featuresText.includes('relatório') || featuresText.includes('Relatório')) features.push('reports');
                  if (featuresText.includes('assinatura') || featuresText.includes('Assinatura')) features.push('signature');
                  if (featuresText.includes('notificação') || featuresText.includes('Notificação')) features.push('notifications');
                  if (featuresText.includes('backup') || featuresText.includes('Backup')) features.push('backup');
                  if (featuresText.includes('integração') || featuresText.includes('Integração')) features.push('integrations');
                  if (featuresText.includes('analytics') || featuresText.includes('Analytics')) features.push('analytics');
                  if (featuresText.includes('suporte') || featuresText.includes('Suporte')) features.push('support');
                  return features;
                }
              })() : []
          }
        };
      } else {
        // Criar assinatura gratuita automaticamente
        const defaultSubscription = await createDefaultSubscription();
        if (defaultSubscription) return defaultSubscription;
        return null;
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      return null;
    }
  };

  const createDefaultSubscription = async (): Promise<UserSubscription | null> => {
    if (!user) return null;
    try {
      const { data: freePlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuito')
        .single();
      if (planError || !freePlan) return null;
      const { data: newSubscription, error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: freePlan.id,
          status: 'active',
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select(`*, plan:subscription_plans(*)`).single();
      if (subError) return null;
      return {
        ...newSubscription,
        plan: {
          ...newSubscription.plan,
          features: Array.isArray(newSubscription.plan.features) ? newSubscription.plan.features :
            typeof newSubscription.plan.features === 'string' ? (() => {
              try { return JSON.parse(newSubscription.plan.features); } catch (e) {
                const featuresText = newSubscription.plan.features || '';
                const features = [];
                if (featuresText.includes('contrato') || featuresText.includes('Contrato')) features.push('contracts');
                if (featuresText.includes('template') || featuresText.includes('Template')) features.push('templates');
                if (featuresText.includes('API') || featuresText.includes('api')) features.push('api');
                if (featuresText.includes('relatório') || featuresText.includes('Relatório')) features.push('reports');
                if (featuresText.includes('assinatura') || featuresText.includes('Assinatura')) features.push('signature');
                if (featuresText.includes('notificação') || featuresText.includes('Notificação')) features.push('notifications');
                if (featuresText.includes('backup') || featuresText.includes('Backup')) features.push('backup');
                if (featuresText.includes('integração') || featuresText.includes('Integração')) features.push('integrations');
                if (featuresText.includes('analytics') || featuresText.includes('Analytics')) features.push('analytics');
                if (featuresText.includes('suporte') || featuresText.includes('Suporte')) features.push('support');
                return features;
              }
            })() : []
        }
      };
    } catch (error) {
      return null;
    }
  };

  const fetchContractCount = async (): Promise<number> => {
    if (!user) return 0;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const { data, error } = await supabase
        .from('contracts_counter')
        .select('count')
        .eq('user_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();
      if (error) {}
      if (data && typeof data.count === 'number') return data.count;
      const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      if (contractsError) return 0;
      return contracts?.length || 0;
    } catch (error) {
      return 0;
    }
  };

  const checkPlanLimit = async (feature: 'contracts' | 'api') => {
    if (!subscription) return false;
    if (feature === 'contracts') {
      const planName = subscription.plan.name;
      const limit = planName === 'Empresarial' ? -1 : planName === 'Profissional' ? 100 : 10;
      if (limit === -1) return true;
      if (contractCount >= limit) {
        toast({
          title: "Limite atingido",
          description: `Você atingiu o limite de ${limit} contratos por mês do seu plano ${subscription.plan.name}.`,
          variant: "destructive",
        });
        return false;
      }
    }
    if (feature === 'api') {
      const planName = subscription.plan.name;
      const hasApiAccess = planName === 'Profissional' || planName === 'Empresarial';
      if (!hasApiAccess) {
        toast({
          title: "Recurso não disponível",
          description: "Acesso à API não está disponível no seu plano atual.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const hasFeatureAccess = (feature: string) => {
    if (!subscription) return false;
    const planFeatures = {
      'Gratuito': ['basic_templates', 'pdf_export', 'email_support'],
      'Profissional': [
        'basic_templates', 'pdf_export', 'email_support',
        'premium_templates', 'electronic_signature', 'priority_support',
        'basic_api', 'basic_reports', 'email_notifications',
        'auto_backup', 'advanced_client_management', 'custom_templates'
      ],
      'Empresarial': [
        'basic_templates', 'pdf_export', 'email_support',
        'premium_templates', 'electronic_signature', 'priority_support',
        'basic_api', 'basic_reports', 'email_notifications',
        'auto_backup', 'advanced_client_management', 'custom_templates',
        'unlimited_contracts', 'full_api', 'advanced_reports',
        'analytics', 'support_24_7', 'admin_panel',
        'advanced_integrations', 'zapier_integration', 'white_label',
        'full_backup', 'multi_user', 'advanced_signature',
        'automations', 'multi_format_export', 'compliance', 'sso'
      ]
    };
    const features = planFeatures[subscription.plan.name as keyof typeof planFeatures] || [];
    return features.includes(feature);
  };

  const getContractLimitText = () => {
    if (!subscription) return 'N/A';
    const planName = subscription.plan.name;
    const limit = planName === 'Empresarial' ? -1 : planName === 'Profissional' ? 100 : 10;
    if (limit === -1) return 'Ilimitado';
    return `${contractCount}/${limit}`;
  };

  const refetch = async () => {
    setLoading(true);
    await initializeUserData();
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      plans,
      loading,
      contractCount,
      error,
      checkPlanLimit,
      hasFeatureAccess,
      getContractLimitText,
      refetch
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
