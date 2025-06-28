
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface SyncResult {
  success: boolean;
  sync_status: 'success' | 'failed' | 'pending';
  original_plan?: string;
  mapped_plan?: string;
  synced_at?: string;
  error?: string;
}

export const useFinanceFlowSync = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const syncPlan = async (): Promise<SyncResult> => {
    if (!user?.email) {
      console.error('No user email available for sync');
      return { success: false, sync_status: 'failed', error: 'No user email' };
    }

    setIsLoading(true);
    
    try {
      console.log('Starting FinanceFlow sync for:', user.email);
      
      const { data, error } = await supabase.functions.invoke('sync-financeflow-plan', {
        body: { user_email: user.email }
      });

      if (error) {
        console.error('Sync function error:', error);
        throw error;
      }

      const result = data as SyncResult;
      
      if (result.success) {
        setLastSync(new Date().toISOString());
        toast({
          title: "Plano sincronizado!",
          description: `Seu plano foi atualizado para: ${result.mapped_plan}`,
        });
        
        // Force refresh of subscription data
        window.location.reload();
      } else {
        console.error('Sync failed:', result.error);
        toast({
          title: "Erro na sincronização",
          description: result.error || "Não foi possível sincronizar seu plano",
          variant: "destructive",
        });
      }

      return result;
      
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro na sincronização",
        description: `Falha ao conectar com FinanceFlow: ${errorMessage}`,
        variant: "destructive",
      });
      
      return { success: false, sync_status: 'failed', error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const autoSync = async () => {
    if (!user?.email) return;
    
    // Check if we should auto-sync (avoid too frequent calls)
    const lastSyncTime = localStorage.getItem(`last_sync_${user.id}`);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (lastSyncTime && (now - parseInt(lastSyncTime)) < oneHour) {
      console.log('Skipping auto-sync, too recent');
      return;
    }
    
    console.log('Performing auto-sync...');
    const result = await syncPlan();
    
    if (result.success) {
      localStorage.setItem(`last_sync_${user.id}`, now.toString());
    }
  };

  return {
    syncPlan,
    autoSync,
    isLoading,
    lastSync
  };
};
