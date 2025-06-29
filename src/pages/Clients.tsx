import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Mail, Phone, MapPin, FileText, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ClientDetailModal from '@/components/client/ClientDetailModal';
import ClientsDebugInfo from '@/components/ClientsDebugInfo';
import FinanceFlowDebug from '@/components/FinanceFlowDebug';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cnpj: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.cnpj?.includes(searchTerm)
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchClients = async (showRefreshToast = false) => {
    if (!user) return;

    console.log('=== Fetching clients ===');
    console.log('User ID:', user.id);
    console.log('User email:', user.email);

    try {
      // Buscar todos os clientes sem filtros iniciais para debug
      const { data: allData, error: allError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('All clients in database:', allData);
      console.log('All clients error:', allError);

      // Buscar clientes específicos do usuário
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('User clients query result:', { data, error });
      console.log('Found clients count:', data?.length || 0);

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      // Filtrar clientes não arquivados
      const activeClients = (data || []).filter(client => 
        !client.name.startsWith('[ARQUIVADO]')
      );
      
      console.log('Active clients after filter:', activeClients);
      
      setClients(activeClients);
      
      if (showRefreshToast) {
        toast({
          title: "Clientes atualizados!",
          description: `${activeClients.length} cliente${activeClients.length !== 1 ? 's' : ''} encontrado${activeClients.length !== 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchClients(true);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        cnpj: client.cnpj || '',
        description: client.description || ''
      });
    } else {
      setSelectedClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        cnpj: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseDialog = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      cnpj: '',
      description: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const clientData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        cnpj: formData.cnpj || null,
        description: formData.description || null,
      };

      console.log('Saving client data:', clientData);

      if (selectedClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', selectedClient.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado!",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);

        if (error) throw error;

        toast({
          title: "Cliente criado!",
          description: "Novo cliente adicionado com sucesso.",
        });
      }

      handleCloseDialog();
      fetchClients();

    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja arquivar este cliente? Ele não será deletado permanentemente.')) return;

    try {
      // Marcar como arquivado modificando o nome para indicar status
      const { error } = await supabase
        .from('clients')
        .update({ 
          name: `[ARQUIVADO] ${clients.find(c => c.id === clientId)?.name || 'Cliente'}`,
        })
        .eq('id', clientId)
        .eq('user_id', user?.id);
      
      if (error) throw error;

      toast({
        title: "Cliente arquivado",
        description: "Cliente foi arquivado com sucesso.",
      });

      fetchClients();
    } catch (error) {
      console.error('Error archiving client:', error);
      toast({
        title: "Erro",
        description: "Erro ao arquivar cliente",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">Gerencie seus clientes e informações de contato</p>
      </div>

      {/* Debug Components */}
      <FinanceFlowDebug />
      <ClientsDebugInfo />

      {/* Search and Add Client */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {selectedClient 
                  ? 'Atualize as informações do cliente' 
                  : 'Preencha os dados do novo cliente'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CPF/CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição do cliente"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Salvando...' : selectedClient ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm 
                ? 'Tente buscar por outros termos' 
                : 'Adicione seu primeiro cliente ou sincronize com o FinanceFlow'}
            </p>
            {!searchTerm && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cliente
                </Button>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Sincronização
                </Button>
              </div>
            )}
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleClientClick(client)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg">{client.name}</CardTitle>
                    {(client.cpf_cnpj || client.cnpj) && (
                      <CardDescription className="text-sm">
                        {client.cpf_cnpj || client.cnpj}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(client);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client.id);
                      }}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
};

export default Clients;
