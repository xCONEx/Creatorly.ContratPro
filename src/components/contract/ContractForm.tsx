
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import ContractBasicInfo from './ContractBasicInfo';
import ContractContent from './ContractContent';
import ContractActions from './ContractActions';
import ContractTips from './ContractTips';

interface Client {
  id: string;
  name: string;
  email?: string;
}

const ContractForm = () => {
  const { user } = useAuth();
  const { checkPlanLimit } = useSubscription();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    client_id: '',
    total_value: '',
    due_date: '',
    status: 'draft' as const
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, client_id: value }));
  };

  const handleSubmit = async (e: React.FormEvent, action: 'save' | 'send') => {
    e.preventDefault();
    if (!user) return;

    // Verificar limite de contratos para o plano atual
    const canCreateContract = await checkPlanLimit('contracts');
    if (!canCreateContract) {
      return;
    }

    setIsLoading(true);
    
    try {
      const contractData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        client_id: formData.client_id,
        total_value: formData.total_value ? parseFloat(formData.total_value) : null,
        due_date: formData.due_date || null,
        status: action === 'send' ? 'sent' as const : 'draft' as const,
        sent_at: action === 'send' ? new Date().toISOString() : null,
        expires_at: action === 'send' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null, // 30 dias
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: action === 'send' ? "Contrato enviado!" : "Contrato salvo!",
        description: action === 'send' 
          ? "O contrato foi enviado para o cliente" 
          : "O contrato foi salvo como rascunho",
      });

      navigate('/contracts');

    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Boolean(formData.title && formData.content && formData.client_id);

  return (
    <form onSubmit={(e) => handleSubmit(e, 'save')} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <ContractBasicInfo
            formData={formData}
            clients={clients}
            onInputChange={handleInputChange}
            onClientChange={handleClientChange}
          />
          <ContractContent
            content={formData.content}
            onContentChange={handleInputChange}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContractActions
            isLoading={isLoading}
            isFormValid={isFormValid}
            onSaveDraft={(e) => handleSubmit(e, 'save')}
            onSendToClient={(e) => handleSubmit(e, 'send')}
          />
          <ContractTips />
        </div>
      </div>
    </form>
  );
};

export default ContractForm;
