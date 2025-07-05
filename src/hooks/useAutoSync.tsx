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
      
      // Usar a função edge do Supabase diretamente
      const supabaseUrl = "https://tmxbgvlijandyvjwstsx.supabase.co";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteGJndmxpamFuZHl2andzdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDM0MTQsImV4cCI6MjA2NjIxOTQxNH0.z5lvkJC_dG-TCE5D26ae-7_wImq5BnGNRctYIWgtyiQ";
      
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
            user_email: user.email
          })
        }
      );

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
        const errorText = await response.text();
        console.error('❌ Detalhes do erro:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    } finally {
      hasSynced.current = true;
    }
  };

  return { syncData };
}; 
