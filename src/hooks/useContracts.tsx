import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

type ContractStatus = Database['public']['Enums']['contract_status'];
type ContractRow = Database['public']['Tables']['contracts']['Row'];
type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

interface ContractWithClient extends ContractRow {
  clients?: {
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

// Cache global para evitar chamadas duplicadas
const contractsCache = new Map<string, { data: ContractWithClient[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = `contracts_${user.id}`;
    const cached = contractsCache.get(cacheKey);
    
    // Verificar se há cache válido
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setContracts(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (
            name,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contractsData = data || [];
      
      // Atualizar cache
      contractsCache.set(cacheKey, {
        data: contractsData,
        timestamp: Date.now()
      });

      setContracts(contractsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar contratos';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createContract = useCallback(async (contractData: Omit<ContractInsert, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          ...contractData
        });

      if (error) throw error;

      // Invalidar cache e recarregar
      contractsCache.delete(`contracts_${user.id}`);
      await fetchContracts(true);

      toast({
        title: "Contrato criado!",
        description: "Novo contrato criado com sucesso.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar contrato';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchContracts]);

  const updateContract = useCallback(async (contractId: string, updates: ContractUpdate) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidar cache e recarregar
      contractsCache.delete(`contracts_${user.id}`);
      await fetchContracts(true);

      toast({
        title: "Contrato atualizado!",
        description: "Contrato atualizado com sucesso.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar contrato';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchContracts]);

  const deleteContract = useCallback(async (contractId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidar cache e recarregar
      contractsCache.delete(`contracts_${user.id}`);
      await fetchContracts(true);

      toast({
        title: "Contrato removido!",
        description: "Contrato removido com sucesso.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover contrato';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchContracts]);

  // Calcular estatísticas usando useMemo para performance
  const stats = useMemo(() => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const completedContracts = contracts.filter(c => c.status === 'completed').length;
    const totalRevenue = contracts
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (Number(c.total_value) || 0), 0);

    // Receita do mês atual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = contracts
      .filter(c => {
        const contractDate = new Date(c.created_at);
        return contractDate.getMonth() === currentMonth && 
               contractDate.getFullYear() === currentYear &&
               c.status === 'completed';
      })
      .reduce((sum, c) => sum + (Number(c.total_value) || 0), 0);

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      totalRevenue,
      monthlyRevenue
    };
  }, [contracts]);

  // Contratos recentes (últimos 5)
  const recentContracts = useMemo(() => {
    return contracts.slice(0, 5);
  }, [contracts]);

  // Carregar contratos quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchContracts();
    } else {
      setContracts([]);
      setLoading(false);
    }
  }, [user, fetchContracts]);

  return {
    contracts,
    recentContracts,
    stats,
    loading,
    error,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    refetch: () => fetchContracts(true)
  };
}; 