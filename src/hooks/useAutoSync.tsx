import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { useClients } from './useClients';
import { useContracts } from './useContracts';
import { toast } from './use-toast';

export const useAutoSync = () => {
  const { user, session } = useAuth();
  const { subscription, refetch } = useSubscription();
  const { fetchClients } = useClients();
  const { fetchContracts } = useContracts();
  const hasSynced = useRef(false);
  const isSyncing = useRef(false);

  // Memoizar a função de sincronização para evitar re-criações
  const syncData = useCallback(async () => {
    if (!user || hasSynced.current || isSyncing.current) return;

    isSyncing.current = true;

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
        
        // Atualizar todos os dados após sincronização
        console.log('🔄 Atualizando dados do frontend...');
        
        try {
          // Atualizar dados da assinatura
          await refetch();
          
          // Atualizar dados dos clientes
          await fetchClients(true);
          
          // Atualizar dados dos contratos
          await fetchContracts(true);
          
          console.log('✅ Dados do frontend atualizados com sucesso');
          
          if (result.sync_status === 'updated') {
            toast({
              title: "Sincronização concluída",
              description: "Seus dados foram sincronizados com o FinanceFlow e atualizados na interface.",
            });
          }
        } catch (error) {
          console.error('❌ Erro ao atualizar dados do frontend:', error);
          toast({
            title: "Sincronização parcial",
            description: "Dados sincronizados, mas houve erro ao atualizar a interface.",
            variant: "destructive",
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
      isSyncing.current = false;
    }
  }, [user, refetch, fetchClients, fetchContracts]);

  // Executar sincronização apenas quando o usuário estiver autenticado e não tiver sincronizado ainda
  useEffect(() => {
    if (user && session && !hasSynced.current) {
      // Pequeno delay para garantir que outros hooks estejam prontos
      const timer = setTimeout(() => {
        syncData();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, session, syncData]);

  return { syncData };
}; 
