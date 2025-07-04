// Exemplo de migração de componente do schema antigo para o novo
// Este arquivo mostra como adaptar um componente existente

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// ============================================================================
// ANTES (Schema Antigo)
// ============================================================================

// Tipos antigos (baseados no schema anterior)
interface OldContract {
  id: string; // UUID
  title: string;
  status: string; // 'draft' | 'sent' | 'signed' | 'cancelled'
  created_at: string;
  total_value?: number;
  due_date?: string;
  content: string;
  client_id: string; // UUID
  clients?: {
    name: string;
    email?: string;
  };
}

interface OldClient {
  id: string; // UUID
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  origin?: string; // 'manual' | 'financeflow'
}

// Componente antigo
const OldContractsComponent = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<OldContract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          title,
          status,
          created_at,
          total_value,
          due_date,
          content,
          client_id,
          clients (
            name,
            email
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

  const updateContractStatus = async (contractId: string, newStatus: 'signed' | 'expired') => {
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
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="bg-yellow-100 text-yellow-800">Enviado</span>;
      case 'signed':
        return <span className="bg-green-100 text-green-800">Assinado</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800">Rascunho</span>;
      case 'expired':
        return <span className="bg-red-100 text-red-800">Expirado</span>;
      default:
        return <span>Desconhecido</span>;
    }
  };

  return (
    <div>
      {contracts.map((contract) => (
        <div key={contract.id}>
          <h3>{contract.title}</h3>
          <p>Cliente: {contract.clients?.name}</p>
          {getStatusBadge(contract.status)}
          
          {contract.status === 'sent' && (
            <button onClick={() => updateContractStatus(contract.id, 'signed')}>
              Marcar como Assinado
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// DEPOIS (Novo Schema)
// ============================================================================

// Importar os novos tipos
import { 
  ContractWithClient, 
  CONTRACT_STATUS, 
  getContractStatusLabel, 
  getContractStatusColor,
  ContractStatus
} from '@/integrations/supabase/types-aux';

// Componente atualizado
const NewContractsComponent = () => {
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
      
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do contrato",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {contracts.map((contract) => (
        <div key={contract.id}>
          <h3>{contract.title}</h3>
          <p>Cliente: {contract.clients?.name}</p>
          <span className={getContractStatusColor(contract.status)}>
            {getContractStatusLabel(contract.status)}
          </span>
          
          {/* Botões de ação baseados no status */}
          {contract.status === CONTRACT_STATUS.PENDING && (
            <button onClick={() => updateContractStatus(contract.id, CONTRACT_STATUS.ACTIVE)}>
              Ativar Contrato
            </button>
          )}
          
          {contract.status === CONTRACT_STATUS.ACTIVE && (
            <button onClick={() => updateContractStatus(contract.id, CONTRACT_STATUS.COMPLETED)}>
              Marcar como Concluído
            </button>
          )}
          
          {contract.status === CONTRACT_STATUS.ACTIVE && (
            <button onClick={() => updateContractStatus(contract.id, CONTRACT_STATUS.CANCELLED)}>
              Cancelar Contrato
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// COMPARAÇÃO DETALHADA
// ============================================================================

/*
PRINCIPAIS MUDANÇAS:

1. TIPOS DE ID:
   - Antes: string (UUID)
   - Depois: number (INTEGER)

2. STATUS DE CONTRATOS:
   - Antes: 'draft' | 'sent' | 'signed' | 'cancelled'
   - Depois: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'

3. ORIGEM DE CLIENTES:
   - Antes: 'manual' | 'financeflow'
   - Depois: 'manual' | 'financeflow' | 'import'

4. FUNÇÕES AUXILIARES:
   - Antes: getStatusBadge() manual
   - Depois: getContractStatusLabel() e getContractStatusColor()

5. TIPAGEM:
   - Antes: interface manual
   - Depois: tipos gerados automaticamente do schema

6. QUERIES:
   - Antes: select específico de campos
   - Depois: select * com joins
*/

// ============================================================================
// EXEMPLO DE MIGRAÇÃO GRADUAL
// ============================================================================

// Se você quiser migrar gradualmente, pode criar um wrapper:

const ContractStatusWrapper = ({ status }: { status: string | ContractStatus }) => {
  // Se for string (schema antigo), converter
  if (typeof status === 'string') {
    const oldToNewStatus: Record<string, ContractStatus> = {
      'draft': CONTRACT_STATUS.PENDING,
      'sent': CONTRACT_STATUS.ACTIVE,
      'signed': CONTRACT_STATUS.COMPLETED,
      'cancelled': CONTRACT_STATUS.CANCELLED,
      'expired': CONTRACT_STATUS.EXPIRED
    };
    
    const newStatus = oldToNewStatus[status] || CONTRACT_STATUS.PENDING;
    return (
      <span className={getContractStatusColor(newStatus)}>
        {getContractStatusLabel(newStatus)}
      </span>
    );
  }
  
  // Se for ContractStatus (novo schema), usar diretamente
  return (
    <span className={getContractStatusColor(status)}>
      {getContractStatusLabel(status)}
    </span>
  );
};

// Componente híbrido (durante migração)
const HybridContractsComponent = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]); // any durante migração
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    if (!user) return;

    try {
      // Query que funciona com ambos os schemas
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
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

  const updateContractStatus = async (contractId: string | number, newStatus: string | ContractStatus) => {
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
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  return (
    <div>
      {contracts.map((contract) => (
        <div key={contract.id}>
          <h3>{contract.title}</h3>
          <p>Cliente: {contract.clients?.name}</p>
          <ContractStatusWrapper status={contract.status} />
          
          {/* Botões adaptáveis */}
          {contract.status === 'sent' || contract.status === CONTRACT_STATUS.ACTIVE ? (
            <button onClick={() => updateContractStatus(
              contract.id, 
              typeof contract.status === 'string' ? 'signed' : CONTRACT_STATUS.COMPLETED
            )}>
              Marcar como Concluído
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export {
  OldContractsComponent,
  NewContractsComponent,
  HybridContractsComponent,
  ContractStatusWrapper
}; 