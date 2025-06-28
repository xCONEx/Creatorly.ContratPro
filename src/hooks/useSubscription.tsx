
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_contracts_per_month: number;
  features: string[];
  api_access: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  trial_ends_at: string | null;
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
      fetchSubscription();
      fetchPlans();
      fetchContractCount();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle(); // Usa maybeSingle() ao invés de single()

      if (error) throw error;
      
      if (data) {
        // Transformar os dados para garantir que features seja string[]
        const transformedData = {
          ...data,
          plan: {
            ...data.plan,
            features: Array.isArray(data.plan.features) ? data.plan.features : 
                     typeof data.plan.features === 'string' ? JSON.parse(data.plan.features) : []
          }
        };
        
        setSubscription(transformedData);
      } else {
        // Se não há assinatura, criar uma padrão com o plano gratuito
        await createDefaultSubscription();
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const createDefaultSubscription = async () => {
    if (!user) return;

    try {
      // Buscar o plano gratuito
      const { data: freePlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuito')
        .single();

      if (planError || !freePlan) {
        console.error('Error fetching free plan:', planError);
        return;
      }

      // Criar assinatura gratuita
      const { data: newSubscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: freePlan.id,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (subError) throw subError;

      // Transformar os dados
      const transformedData = {
        ...newSubscription,
        plan: {
          ...newSubscription.plan,
          features: Array.isArray(newSubscription.plan.features) ? newSubscription.plan.features : 
                   typeof newSubscription.plan.features === 'string' ? JSON.parse(newSubscription.plan.features) : []
        }
      };
      
      setSubscription(transformedData);
    } catch (error) {
      console.error('Error creating default subscription:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      
      // Transformar os dados para garantir que features seja string[]
      const transformedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : 
                 typeof plan.features === 'string' ? JSON.parse(plan.features) : []
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractCount = async () => {
    if (!user) return;

    try {
      // Contar contratos do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('contracts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;
      
      setContractCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching contract count:', error);
    }
  };

  const checkPlanLimit = async (feature: 'contracts' | 'api') => {
    if (!subscription) return false;

    if (feature === 'contracts') {
      const limit = subscription.plan.max_contracts_per_month;
      
      if (contractCount >= limit) {
        toast({
          title: "Limite atingido",
          description: `Você atingiu o limite de ${limit} contratos por mês do seu plano ${subscription.plan.name}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (feature === 'api' && !subscription.plan.api_access) {
      toast({
        title: "Recurso não disponível",
        description: "Acesso à API não está disponível no seu plano atual.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    subscription,
    plans,
    loading,
    contractCount,
    checkPlanLimit,
    refetch: () => {
      fetchSubscription();
      fetchContractCount();
    }
  };
};
