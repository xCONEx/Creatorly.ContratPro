
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
import ContractUserInfo from './ContractUserInfo';

interface Client {
  id: string;
  name: string;
  email?: string;
}

const ContractForm = () => {
  const { user } = useAuth();
  const { checkPlanLimit, refetch } = useSubscription();
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

  const [userData, setUserData] = useState({
    user_name: '',
    user_email: '',
    user_cnpj: '',
    user_address: '',
    user_phone: ''
  });

  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchUserData();
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

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, company, address, phone')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setUserData({
        user_name: data?.name || user.email?.split('@')[0] || 'Usuário',
        user_email: data?.email || user.email || '',
        user_cnpj: data?.company || '',
        user_address: data?.address || '',
        user_phone: data?.phone || ''
      });
      setIsUserDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Usar dados padrão se não conseguir buscar
      setUserData({
        user_name: user.email?.split('@')[0] || 'Usuário',
        user_email: user.email || '',
        user_cnpj: '',
        user_address: '',
        user_phone: ''
      });
      setIsUserDataLoaded(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, client_id: value }));
  };

  // Removido handleUserDataChange - agora sempre busca do perfil

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
        status: action === 'send' ? 'enviado' as const : 'rascunho' as const,
        sent_at: action === 'send' ? new Date().toISOString() : null,
        expires_at: action === 'send' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null, // 30 dias
        // Dados do usuário
        user_name: userData.user_name,
        user_email: userData.user_email,
        user_cnpj: userData.user_cnpj,
        user_address: userData.user_address,
        user_phone: userData.user_phone,
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

      // Atualizar contador de contratos
      refetch();

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
          <ContractUserInfo
            userData={userData}
            onUserDataChange={() => {}} // Não editável - sempre busca do perfil
            isEditable={false}
            isLoading={!isUserDataLoaded}
          />
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
