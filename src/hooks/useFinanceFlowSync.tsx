
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface SyncResult {
  success: boolean;
  sync_status: 'success' | 'failed' | 'pending';
  original_plan?: string;
  mapped_plan?: string;
  clients_synced?: number;
  synced_at?: string;
  error?: string;
  message?: string;
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
        
        // Better error handling for common issues
        let userMessage = "Não foi possível conectar com o FinanceFlow";
        
        if (error.message?.includes('CORS') || error.message?.includes('Failed to send')) {
          userMessage = "Erro de conexão com o servidor. Tente novamente em alguns minutos.";
        } else if (error.message?.includes('credentials')) {
          userMessage = "Configuração do FinanceFlow não encontrada. Entre em contato com o suporte.";
        }
        
        toast({
          title: "Erro na sincronização",
          description: userMessage,
          variant: "destructive",
        });
        
        return { success: false, sync_status: 'failed', error: error.message };
      }

      const result = data as SyncResult;
      
      if (result.success) {
        setLastSync(new Date().toISOString());
        
        const clientsMessage = result.clients_synced && result.clients_synced > 0 
          ? ` e ${result.clients_synced} cliente${result.clients_synced > 1 ? 's' : ''} sincronizado${result.clients_synced > 1 ? 's' : ''}`
          : '';
        
        toast({
          title: "Sincronização concluída!",
          description: `Plano atualizado para: ${result.mapped_plan}${clientsMessage}`,
        });
        
        // Force refresh of data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('Sync failed:', result.error);
        
        let userMessage = result.error || "Não foi possível sincronizar seu plano";
        
        // Provide more user-friendly error messages
        if (result.error?.includes('not found in FinanceFlow')) {
          userMessage = "Conta não encontrada no FinanceFlow. Verifique se você tem uma conta com o mesmo email.";
        } else if (result.error?.includes('not configured')) {
          userMessage = "Integração com FinanceFlow não configurada. Entre em contato com o suporte.";
        }
        
        toast({
          title: "Erro na sincronização",
          description: userMessage,
          variant: "destructive",
        });
      }

      return result;
      
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      let userMessage = `Falha ao conectar com FinanceFlow: ${errorMessage}`;
      
      // Handle specific error types
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes('timeout')) {
        userMessage = "Tempo limite esgotado. Tente novamente em alguns minutos.";
      }
      
      toast({
        title: "Erro na sincronização",
        description: userMessage,
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
