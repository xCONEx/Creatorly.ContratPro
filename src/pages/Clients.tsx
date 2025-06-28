'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, User, Mail, Phone, MapPin } from 'lucide-react';
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
  cpf_cnpj?: string;
  created_at: string;
  user_id: string;
}

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cpf_cnpj: ''
  });

  useEffect(() => {
    if (user) {
      fetchRemoteClients();
    }
  }, [user]);

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf_cnpj?.includes(searchTerm) || ''
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchRemoteClients = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/get_financeflow_clients', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) throw new Error('Erro ao buscar dados da função');

      const result = await response.json();

      const clientsData: Client[] = (result.data || []).filter(client =>
        !client.name.startsWith('[ARQUIVADO]')
      );

      setClients(clientsData);
    } catch (error) {
      console.error('Erro na função edge:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar clientes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientClick = (client: Client) => {
    setViewingClient(client);
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        cpf_cnpj: client.cpf_cnpj || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        cpf_cnpj: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      cpf_cnpj: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const clientData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        cpf_cnpj: formData.cpf_cnpj || null,
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id)
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
      fetchRemoteClients();

    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja arquivar este cliente? Ele não será deletado permanentemente.')) return;

    try {
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

      fetchRemoteClients();
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
  <div className="p-4">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Clientes</h1>
      <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" />Novo Cliente</Button>
    </div>

    <div className="mb-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF/CNPJ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredClients.map((client) => (
        <Card key={client.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleClientClick(client)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {client.name}
              <div className="space-x-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(client); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>{client.cpf_cnpj}</CardDescription>
          </CardHeader>
          <CardContent>
            {client.email && <p className="flex items-center"><Mail className="h-4 w-4 mr-2" /> {client.email}</p>}
            {client.phone && <p className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {client.phone}</p>}
            {client.address && <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {client.address}</p>}
            <p className="text-sm text-muted-foreground mt-2">Criado em: {new Date(client.created_at).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>Preencha os dados do cliente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input id="cpf_cnpj" name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} />
          </div>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
        </form>
      </DialogContent>
    </Dialog>

    {viewingClient && (
      <ClientDetailModal client={viewingClient} onClose={() => setViewingClient(null)} />
    )}
  </div>
);
};

export default Clients;
