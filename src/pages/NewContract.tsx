
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Save, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email?: string;
}

const NewContract = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    client_id: '',
    total_value: '',
    due_date: '',
    status: 'draft'
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

  const handleSubmit = async (e: React.FormEvent, action: 'save' | 'send') => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const contractData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        client_id: formData.client_id,
        total_value: formData.total_value ? parseFloat(formData.total_value) : null,
        due_date: formData.due_date || null,
        status: action === 'send' ? 'sent' : 'draft',
        sent_at: action === 'send' ? new Date().toISOString() : null,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFormData(prev => ({ ...prev, content }));
        toast({
          title: "Arquivo carregado",
          description: "O conteúdo do arquivo foi adicionado ao contrato",
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/contracts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Novo Contrato</h1>
            <p className="text-slate-600">Crie um novo contrato para seus clientes</p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'save')} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Contrato</CardTitle>
                <CardDescription>
                  Preencha os dados básicos do contrato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Contrato *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Contrato de Prestação de Serviços"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Cliente *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.email && `(${client.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clients.length === 0 && (
                    <p className="text-sm text-slate-500">
                      <Link to="/clients" className="text-blue-600 hover:text-blue-700">
                        Cadastre um cliente primeiro
                      </Link>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_value">Valor Total</Label>
                    <Input
                      id="total_value"
                      name="total_value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_value}
                      onChange={handleInputChange}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Data de Vencimento</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Contrato</CardTitle>
                <CardDescription>
                  Digite o texto do contrato ou faça upload de um arquivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload de Arquivo
                      </span>
                    </Button>
                  </Label>
                  <span className="text-sm text-slate-500">
                    Aceita .txt, .doc, .docx
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Texto do Contrato *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Digite o conteúdo do contrato aqui..."
                    className="min-h-96"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || !formData.title || !formData.content || !formData.client_id}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>

                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'send')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading || !formData.title || !formData.content || !formData.client_id}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Enviando...' : 'Enviar para Cliente'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="font-medium">📝 Use variáveis</p>
                  <p>Nome do cliente, data atual, valor total</p>
                </div>
                <div>
                  <p className="font-medium">📋 Templates</p>
                  <p>Use nossos templates pré-definidos para agilizar</p>
                </div>
                <div>
                  <p className="font-medium">📄 Upload</p>
                  <p>Carregue contratos existentes em .txt ou .doc</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewContract;
