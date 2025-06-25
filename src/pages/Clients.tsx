
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft, 
  Mail, 
  Phone,
  MapPin,
  Building,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address: string;
  tags: string[];
  contractsCount: number;
  totalValue: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '', 
    cnpj: '',
    address: '',
    tags: [] as string[]
  });

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Tech Solutions Ltda',
      email: 'contato@techsolutions.com',
      phone: '(11) 98765-4321',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      tags: ['tecnologia', 'desenvolvimento', 'premium'],
      contractsCount: 5,
      totalValue: 'R$ 125.000'
    },
    {
      id: '2',
      name: 'StartupX',
      email: 'hello@startupx.com.br',
      phone: '(21) 91234-5678',
      cnpj: '23.456.789/0001-01',
      address: 'Rua das Flores, 123 - Rio de Janeiro/RJ',
      tags: ['startup', 'inovação'],
      contractsCount: 2,
      totalValue: 'R$ 45.000'
    },
    {
      id: '3',
      name: 'E-commerce Pro',
      email: 'comercial@ecommercepro.com',
      phone: '(85) 97777-8888',
      cnpj: '34.567.890/0001-12',
      address: 'Centro Empresarial, Sala 501 - Fortaleza/CE',
      tags: ['ecommerce', 'varejo', 'digital'],
      contractsCount: 8,
      totalValue: 'R$ 280.000'
    }
  ]);

  const addTag = () => {
    if (newTag.trim() && !newClient.tags.includes(newTag.trim())) {
      setNewClient(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewClient(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddClient = () => {
    if (!newClient.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const client: Client = {
      id: Date.now().toString(),
      ...newClient,
      contractsCount: 0,
      totalValue: 'R$ 0'
    };

    setClients(prev => [...prev, client]);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      cnpj: '',
      address: '',
      tags: []
    });
    setIsAddingClient(false);
    
    toast({
      title: "Cliente adicionado",
      description: "Cliente foi adicionado com sucesso!",
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Gerenciar Clientes
              </h1>
            </div>
          </div>

          <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha as informações do cliente
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="clientName">Nome *</Label>
                  <Input
                    id="clientName"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do cliente ou empresa"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Telefone</Label>
                    <Input
                      id="clientPhone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clientCnpj">CNPJ</Label>
                  <Input
                    id="clientCnpj"
                    value={newClient.cnpj}
                    onChange={(e) => setNewClient(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="clientAddress">Endereço</Label>
                  <Input
                    id="clientAddress"
                    value={newClient.address}
                    onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo"
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Digite uma tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newClient.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddingClient(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddClient} className="bg-gradient-to-r from-green-600 to-blue-600">
                  Adicionar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search and Stats */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar clientes..."
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-4 text-sm text-slate-600">
                <span>{clients.length} clientes totais</span>
                <span>•</span>
                <span>{filteredClients.length} encontrados</span>
              </div>
            </div>
          </div>

          {/* Clients Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="w-3 h-3 mr-1" />
                        {client.cnpj}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {client.email && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {client.email}
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {client.phone}
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {client.address}
                    </div>
                  )}

                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Contratos:</span>
                      <span className="font-medium">{client.contractsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-500">Valor Total:</span>
                      <span className="font-medium text-green-600">{client.totalValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-slate-500">
                Tente ajustar os termos de busca ou adicione um novo cliente.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Clients;
