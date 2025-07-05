import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface SyncResult {
  success: boolean;
  synced_clients?: number;
  message?: string;
  error?: string;
}

export const useAutoSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const syncData = async (): Promise<SyncResult> => {
    if (!user?.email) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSyncing(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-financeflow-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({
            user_email: user.email,
            action: 'sync'
          })
        }
      );

      const result: SyncResult = await response.json();

      if (result.success) {
        setLastSync(new Date());
        toast({
          title: "Sincronização concluída!",
          description: result.message || `Sincronizados ${result.synced_clients || 0} cliente(s)`,
        });
      } else {
        toast({
          title: "Erro na sincronização",
          description: result.error || "Falha ao sincronizar dados",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Falha ao conectar com o servidor",
        variant: "destructive",
      });
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setIsSyncing(false);
    }
  };

  // Sincronizar automaticamente no login
  useEffect(() => {
    if (user?.email && !lastSync) {
      // Aguardar um pouco para garantir que a sessão está estabelecida
      const timer = setTimeout(() => {
        syncData();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user?.email, lastSync]);

  // Sincronizar quando a página é recarregada (se passou mais de 1 hora)
  useEffect(() => {
    const shouldSync = () => {
      if (!lastSync) return true;
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return lastSync < oneHourAgo;
    };

    if (user?.email && shouldSync()) {
      const timer = setTimeout(() => {
        syncData();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user?.email, lastSync]);

  return {
    syncData,
    isSyncing,
    lastSync,
    setLastSync
  };
}; 