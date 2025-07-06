import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Mail, Phone, MapPin, FileText, Edit, Trash2, RefreshCw, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ClientDetailModal from '@/components/client/ClientDetailModal';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  cpf_cnpj?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  origin?: string;
  user_id?: string;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'contratpro' | 'financeflow'>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cnpj: '',
    description: ''
  });
  const [contratproClients, setContratproClients] = useState<Client[]>([]);
  const [financeflowClients, setFinanceflowClients] = useState<Client[]>([]);

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
      client.cnpj?.includes(searchTerm) ||
      client.cpf_cnpj?.includes(searchTerm)
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchClients = async (showRefreshToast = false) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Separar por origem
      const contratpro = (data || []).filter((c: Client) => !c.origin || c.origin === 'contratpro');
      const financeflow = (data || []).filter((c: Client) => c.origin === 'financeflow');
      setContratproClients(contratpro);
      setFinanceflowClients(financeflow);
      setClients(data || []);
      if (showRefreshToast) {
        toast({
          title: "Clientes atualizados!",
          description: `${data?.length || 0} cliente${(data?.length || 0) !== 1 ? 's' : ''} encontrado${(data?.length || 0) !== 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const getFilteredClients = () => {
    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.cnpj?.includes(searchTerm) ||
      client.cpf_cnpj?.includes(searchTerm)
    );

    switch (activeFilter) {
      case 'contratpro':
        return filtered.filter(client => !client.origin || client.origin === 'contratpro');
      case 'financeflow':
        return filtered.filter(client => client.origin === 'financeflow');
      default:
        return filtered;
    }
  };

  const filteredClientsToShow = getFilteredClients();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600">Gerencie seus clientes e informações de contato</p>
      </div>

      {/* Search and Actions */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar clientes por nome, email, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setActiveFilter('contratpro')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'contratpro'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ContratPro ({contratproClients.length})
            </button>
            <button
              onClick={() => setActiveFilter('financeflow')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'financeflow'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              FinanceFlow ({financeflowClients.length})
            </button>
          </div>

          {/* Add Client Button */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
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
                  <Label htmlFor="name" className="text-sm font-medium">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-sm font-medium">CPF/CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição do cliente"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : selectedClient ? 'Atualizar' : 'Criar Cliente'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleCloseDialog}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 h-11"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClientsToShow.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca' 
                : 'Comece adicionando seu primeiro cliente'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClientsToShow.map((client) => (
              <Card 
                key={client.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
                onClick={() => handleClientClick(client)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-gray-900 truncate">
                        {client.name}
                      </CardTitle>
                      {(client.cpf_cnpj || client.cnpj) && (
                        <CardDescription className="text-xs text-gray-500 truncate">
                          {client.cpf_cnpj || client.cnpj}
                        </CardDescription>
                      )}
                      {client.origin === 'financeflow' && (
                        <Badge className="mt-1 text-xs bg-blue-100 text-blue-700">
                          FinanceFlow
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(client);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2 text-xs">{client.address}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
