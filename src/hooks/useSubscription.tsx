import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_days: number | null;
  features: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  plan: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractCount, setContractCount] = useState(0);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, initializing subscription data for:', user.id);
      initializeUserData();
    } else {
      console.log('No user authenticated');
      setLoading(false);
    }
  }, [user]);

  const initializeUserData = async () => {
    try {
      console.log('Starting data initialization...');
      
      // Primeiro buscar os planos
      await fetchPlans();
      
      // Depois buscar/criar a assinatura do usuário
      await fetchSubscription();
      
      // Por último buscar contagem de contratos
      await fetchContractCount();
      
      console.log('Data initialization completed successfully');
    } catch (error) {
      console.error('Error during data initialization:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      console.log('Fetching subscription plans...');
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');

      if (error) {
        console.error('Error fetching plans:', error);
        throw error;
      }
      
      const transformedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : 
                 typeof plan.features === 'string' ? 
                   (() => {
                     try {
                       // Tentar fazer parse do JSON
                       return JSON.parse(plan.features);
                     } catch (e) {
                       // Se falhar, verificar se é texto em português e extrair features
                       const featuresText = plan.features || '';
                       const features = [];
                       
                       // Extrair features baseadas em palavras-chave
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
                       
                       console.warn('Failed to parse features JSON, extracted features from text:', featuresText, '->', features);
                       return features;
                     }
                   })() : []
      }));
      
      console.log('Plans fetched successfully:', transformedPlans.length);
      setPlans(transformedPlans);
      
    } catch (error) {
      console.error('Error in fetchPlans:', error);
      setPlans([]);
    }
  };

  const fetchSubscription = async () => {
    if (!user) {
      console.log('No user available for fetchSubscription');
      return;
    }

    try {
      console.log('Fetching subscription for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }
      
      if (data && data.plan) {
        console.log('Subscription found:', data);
        
        const transformedData = {
          ...data,
          plan: {
            ...data.plan,
            features: Array.isArray(data.plan.features) ? data.plan.features : 
                     typeof data.plan.features === 'string' ? 
                       (() => {
                         try {
                           return JSON.parse(data.plan.features);
                         } catch (e) {
                           // Se falhar, verificar se é texto em português e extrair features
                           const featuresText = data.plan.features || '';
                           const features = [];
                           
                           // Extrair features baseadas em palavras-chave
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
                           
                           console.warn('Failed to parse plan features JSON, extracted features from text:', featuresText, '->', features);
                           return features;
                         }
                       })() : []
          }
        };
        
        setSubscription(transformedData);
      } else {
        console.log('No subscription found, user might be new or have issues');
        // Se não encontrou assinatura, não tentar criar aqui
        // O trigger do banco deve ter criado automaticamente
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos
        
        // Tentar buscar novamente
        const { data: retryData, error: retryError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (retryError) {
          console.error('Error on retry fetch:', retryError);
          throw retryError;
        }
        
        if (retryData && retryData.plan) {
          console.log('Subscription found on retry:', retryData);
          const transformedRetryData = {
            ...retryData,
            plan: {
              ...retryData.plan,
              features: Array.isArray(retryData.plan.features) ? retryData.plan.features : 
                       typeof retryData.plan.features === 'string' ? 
                         (() => {
                           try {
                             return JSON.parse(retryData.plan.features);
                           } catch (e) {
                             // Se falhar, verificar se é texto em português e extrair features
                             const featuresText = retryData.plan.features || '';
                             const features = [];
                             
                             // Extrair features baseadas em palavras-chave
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
                             
                             console.warn('Failed to parse retry plan features JSON, extracted features from text:', featuresText, '->', features);
                             return features;
                           }
                         })() : []
            }
          };
          setSubscription(transformedRetryData);
        } else {
          console.log('Still no subscription found after retry');
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setSubscription(null);
    }
  };

  const fetchContractCount = async () => {
    if (!user) return;

    try {
      console.log('Fetching contract count for user:', user.id);
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('contracts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) {
        console.error('Error fetching contract count:', error);
        return;
      }
      
      const count = data?.length || 0;
      console.log('Contract count:', count);
      setContractCount(count);
    } catch (error) {
      console.error('Error fetching contract count:', error);
    }
  };

  const checkPlanLimit = async (feature: 'contracts' | 'api') => {
    if (!subscription) {
      console.log('No subscription available for limit check');
      return false;
    }

    if (feature === 'contracts') {
      // Usar limite padrão baseado no plano ou permitir ilimitado
      const planName = subscription.plan.name;
      const limit = planName === 'Empresarial' ? -1 : 
                   planName === 'Profissional' ? 100 : 10; // Valores padrão
      
      // Se limit é -1, significa ilimitado
      if (limit === -1) {
        return true;
      }
      
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
      // Verificar se o plano tem acesso à API baseado no nome
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

  // Função para verificar se tem acesso a uma feature específica
  const hasFeatureAccess = (feature: string) => {
    if (!subscription) return false;
    
    // Features específicas por plano
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

  // Função para obter limite de contratos formatado
  const getContractLimitText = () => {
    if (!subscription) return 'N/A';
    
    const planName = subscription.plan.name;
    const limit = planName === 'Empresarial' ? -1 : 
                 planName === 'Profissional' ? 100 : 10;
    
    if (limit === -1) return 'Ilimitado';
    return `${contractCount}/${limit}`;
  };

  return {
    subscription,
    plans,
    loading,
    contractCount,
    checkPlanLimit,
    hasFeatureAccess,
    getContractLimitText,
    refetch: () => {
      console.log('Refetching subscription data...');
      if (user) {
        initializeUserData();
      }
    }
  };
};
