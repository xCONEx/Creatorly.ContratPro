import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  ContractWithClient, 
  Client,
  CONTRACT_STATUS, 
  CLIENT_ORIGIN,
  getContractStatusLabel, 
  getContractStatusColor,
  getClientOriginLabel,
  getClientOriginColor,
  ContractStatus,
  ClientOrigin
} from '@/integrations/supabase/types-aux';

// Exemplo de componente usando os novos tipos
export const ContractsExample = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Buscar contratos com dados do cliente
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            origin
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Buscar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (clientsError) throw clientsError;

      setContracts(contractsData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContractStatus = async (contractId: number, newStatus: ContractStatus) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Contrato atualizado para ${getContractStatusLabel(newStatus)}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do contrato",
        variant: "destructive",
      });
    }
  };

  const createClient = async (clientData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    origin: ClientOrigin;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          origin: clientData.origin
        });

      if (error) throw error;

      toast({
        title: "Cliente criado!",
        description: "Cliente adicionado com sucesso",
      });

      fetchData();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cliente",
        variant: "destructive",
      });
    }
  };

  const createContract = async (contractData: {
    title: string;
    content: string;
    client_id: number;
    total_value: number;
    due_date: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: contractData.title,
          content: contractData.content,
          client_id: contractData.client_id,
          total_value: contractData.total_value,
          due_date: contractData.due_date,
          status: CONTRACT_STATUS.PENDING // Status inicial
        });

      if (error) throw error;

      toast({
        title: "Contrato criado!",
        description: "Contrato criado com sucesso",
      });

      fetchData();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar contrato",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exemplo de Uso do Novo Schema</h2>
      
      {/* Lista de Contratos */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Contratos</h3>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{contract.title}</h4>
                  <p className="text-sm text-gray-600">
                    Cliente: {contract.clients?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Valor: R$ {contract.total_value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Vencimento: {new Date(contract.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getContractStatusColor(contract.status)}`}>
                    {getContractStatusLabel(contract.status)}
                  </span>
                  
                  {/* Botões de ação baseados no status */}
                  {contract.status === CONTRACT_STATUS.PENDING && (
                    <button
                      onClick={() => updateContractStatus(contract.id, CONTRACT_STATUS.ACTIVE)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Ativar
                    </button>
                  )}
                  
                  {contract.status === CONTRACT_STATUS.ACTIVE && (
                    <button
                      onClick={() => updateContractStatus(contract.id, CONTRACT_STATUS.COMPLETED)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Clientes */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Clientes</h3>
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{client.name}</h4>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  <p className="text-sm text-gray-600">{client.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getClientOriginColor(client.origin)}`}>
                  {getClientOriginLabel(client.origin)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Estatísticas</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{contracts.length}</div>
            <div className="text-sm text-gray-600">Total de Contratos</div>
          </div>
          <div className="border p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === CONTRACT_STATUS.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600">Contratos Concluídos</div>
          </div>
          <div className="border p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{clients.length}</div>
            <div className="text-sm text-gray-600">Total de Clientes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exemplo de hooks personalizados usando os novos tipos
export const useContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            origin
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContractStatus = async (contractId: number, newStatus: ContractStatus) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchContracts();
      return true;
    } catch (error) {
      console.error('Error updating contract status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [user]);

  return {
    contracts,
    loading,
    fetchContracts,
    updateContractStatus
  };
};

export const useClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    origin: ClientOrigin;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          ...clientData
        });

      if (error) throw error;
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error creating client:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    fetchClients,
    createClient
  };
}; 