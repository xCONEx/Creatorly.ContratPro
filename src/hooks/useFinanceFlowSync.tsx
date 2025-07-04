import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface SyncResult {
  success: boolean;
  sync_status: 'success' | 'failed' | 'pending';
  original_plan?: string;
  mapped_plan?: string;
  clients_synced?: number;
  contracts_synced?: number;
  synced_at?: string;
  error?: string;
  message?: string;
  details?: string;
  timestamp?: string;
}

export const useFinanceFlowSync = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  console.log('useFinanceFlowSync: Hook initialized, user:', user?.email);

  const syncPlan = async (): Promise<SyncResult> => {
    if (!user?.email) {
      console.error('No user email available for sync');
      return { success: false, sync_status: 'failed', error: 'No user email' };
    }

    setIsLoading(true);
    
    try {
      console.log('=== Starting FinanceFlow sync ===');
      console.log('User email:', user.email);
      console.log('Supabase URL configured');
      console.log('Testing function accessibility...');
      
      console.log('useFinanceFlowSync: Invoking function with email:', user.email);
      const { data, error } = await supabase.functions.invoke('sync-financeflow-plan', {
        body: { user_email: user.email }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Sync function error:', error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: error.context || 'No context available'
        });
        
        // Enhanced error handling for specific errors
        let userMessage = "Não foi possível conectar com o FinanceFlow";
        
        if (error.message?.includes('Edge Function returned a non-2xx status code')) {
          // Try to get more details from the response
          if (error.context?.response) {
            try {
              const errorResponse = await error.context.response.json();
              console.error('Detailed error response:', errorResponse);
              userMessage = errorResponse.error || "Erro interno na função de sincronização";
            } catch (e) {
              console.error('Could not parse error response:', e);
            }
          }
          
          if (error.message?.includes('404')) {
            userMessage = "Função 'sync-financeflow-plan' não encontrada no Supabase. Verifique se foi deployada corretamente.";
          } else if (error.message?.includes('500')) {
            userMessage = "Erro interno na função de sincronização. Verifique os logs no Supabase Dashboard para mais detalhes.";
          }
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
          userMessage = "Erro de conexão com o servidor. Verifique sua internet e tente novamente.";
        } else if (error.message?.includes('timeout')) {
          userMessage = "Tempo limite esgotado. Tente novamente em alguns minutos.";
        } else if (error.message?.includes('CORS')) {
          userMessage = "Erro de configuração do servidor. Entre em contato com o suporte.";
        } else if (error.message?.includes('credentials') || error.message?.includes('not configured')) {
          userMessage = "Configuração do FinanceFlow não encontrada. Entre em contato com o suporte.";
        }
        
        toast({
          title: "Erro na sincronização",
          description: userMessage,
          variant: "destructive",
        });
        
        return { 
          success: false, 
          sync_status: 'failed', 
          error: error.message,
          details: JSON.stringify({
            error: error,
            context: error.context || 'No context',
            timestamp: new Date().toISOString()
          })
        };
      }

      const result = data as SyncResult;
      console.log('Sync result:', result);
      
      if (result.success) {
        setLastSync(new Date().toISOString());
        
        const clientsMessage = result.clients_synced && result.clients_synced > 0 
          ? ` ${result.clients_synced} cliente${result.clients_synced > 1 ? 's' : ''} sincronizado${result.clients_synced > 1 ? 's' : ''}`
          : '';
          
        const contractsMessage = result.contracts_synced && result.contracts_synced > 0 
          ? ` e ${result.contracts_synced} contrato${result.contracts_synced > 1 ? 's' : ''} sincronizado${result.contracts_synced > 1 ? 's' : ''}`
          : '';
        
        toast({
          title: "Sincronização concluída!",
          description: `Plano atualizado para: ${result.mapped_plan}.${clientsMessage}${contractsMessage}`,
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
        } else if (result.error?.includes('not found in ContratPro')) {
          userMessage = "Usuário não encontrado no ContratPro. Faça login novamente.";
        } else if (result.error?.includes('insufficient permissions')) {
          userMessage = "Permissões insuficientes. Entre em contato com o suporte.";
        } else if (result.error?.includes('Plan') && result.error?.includes('not found')) {
          userMessage = "Plano não encontrado no sistema. Entre em contato com o suporte.";
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
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      let userMessage = `Falha ao conectar com FinanceFlow: ${errorMessage}`;
      
      // Handle specific error types
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes('timeout')) {
        userMessage = "Tempo limite esgotado. Tente novamente em alguns minutos.";
      } else if (errorMessage.includes('NetworkError')) {
        userMessage = "Erro de rede. Verifique sua conexão e tente novamente.";
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

  // Chamar autoSync automaticamente ao detectar login/criação de conta
  useEffect(() => {
    console.log('useFinanceFlowSync: User email detected:', user?.email);
    if (user?.email) {
      // Desabilitar auto-sync temporariamente para evitar conflitos
      console.log('useFinanceFlowSync: Auto-sync disabled temporarily');
      // setTimeout(() => {
      //   console.log('useFinanceFlowSync: Starting auto-sync...');
      //   autoSync();
      // }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return { isLoading, lastSync };
};
