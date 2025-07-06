import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  cpf_cnpj?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  origin?: string;
  user_id?: string;
}

// Cache global para evitar chamadas duplicadas
const clientsCache = new Map<string, { data: Client[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = `clients_${user.id}`;
    const cached = clientsCache.get(cacheKey);
    
    // Verificar se há cache válido
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setClients(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clientsData = data || [];
      
      // Atualizar cache
      clientsCache.set(cacheKey, {
        data: clientsData,
        timestamp: Date.now()
      });

      setClients(clientsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
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

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          ...clientData
        });

      if (error) throw error;

      // Invalidar cache e recarregar
      clientsCache.delete(`clients_${user.id}`);
      await fetchClients(true);

      toast({
        title: "Cliente criado!",
        description: "Novo cliente adicionado com sucesso.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchClients]);

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidar cache e recarregar
      clientsCache.delete(`clients_${user.id}`);
      await fetchClients(true);

      toast({
        title: "Cliente atualizado!",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchClients]);

  const deleteClient = useCallback(async (clientId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidar cache e recarregar
      clientsCache.delete(`clients_${user.id}`);
      await fetchClients(true);

      toast({
        title: "Cliente removido!",
        description: "Cliente removido com sucesso.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover cliente';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchClients]);

  // Separar clientes por origem usando useMemo para performance
  const { contratproClients, financeflowClients } = useMemo(() => {
    const contratpro = clients.filter(client => !client.origin || client.origin === 'contratpro');
    const financeflow = clients.filter(client => client.origin === 'financeflow');
    
    return { contratproClients: contratpro, financeflowClients: financeflow };
  }, [clients]);

  // Carregar clientes quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchClients();
    } else {
      setClients([]);
      setLoading(false);
    }
  }, [user, fetchClients]);

  return {
    clients,
    contratproClients,
    financeflowClients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    refetch: () => fetchClients(true)
  };
}; 