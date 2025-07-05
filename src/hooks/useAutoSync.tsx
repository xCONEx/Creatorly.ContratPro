import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { toast } from './use-toast';

export const useAutoSync = () => {
  const { user, session } = useAuth();
  const { subscription, refetch } = useSubscription();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (user && !hasSynced.current) {
      syncData();
    }
  }, [user]);

  const syncData = async () => {
    if (!user || hasSynced.current) return;

    try {
      console.log('🔄 Iniciando sincronização automática...');
      
      const response = await fetch('/api/sync-financeflow-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sincronização automática concluída:', result);
        
        // Atualizar dados da assinatura após sincronização
        await refetch();
        
        if (result.sync_status === 'updated') {
          toast({
            title: "Sincronização concluída",
            description: "Seus dados foram sincronizados com o FinanceFlow.",
          });
        }
      } else {
        console.error('❌ Erro na sincronização automática:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    } finally {
      hasSynced.current = true;
    }
  };

  return { syncData };
}; 