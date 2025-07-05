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
      // Usar apenas a chave anon (mais segura)
      const supabaseUrl = "https://tmxbgvlijandyvjwstsx.supabase.co";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteGJndmxpamFuZHl2andzdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDM0MTQsImV4cCI6MjA2NjIxOTQxNH0.z5lvkJC_dG-TCE5D26ae-7_wImq5BnGNRctYIWgtyiQ";
      
      console.log('Iniciando sincronização para:', user.email);
      console.log('URL da função:', `${supabaseUrl}/functions/v1/sync-financeflow-plan`);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/sync-financeflow-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            user_email: user.email,
            action: 'sync'
          })
        }
      );

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: SyncResult = await response.json();
      console.log('Resultado da sincronização:', result);

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
