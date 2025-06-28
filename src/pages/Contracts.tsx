import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical,
  Eye,
  Edit,
  Download,
  Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  title: string;
  status: string;
  created_at: string;
  total_value?: number;
  due_date?: string;
  clients?: {
    name: string;
  };
}

const Contracts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

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
          clients (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contratos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}/view`);
  };

  const handleEditContract = (contractId: string) => {
    navigate(`/contracts/${contractId}/edit`);
  };

  const handleDownloadContract = async (contractId: string) => {
    toast({
      title: "Download iniciado",
      description: "O download do contrato será iniciado em breve.",
    });
    // TODO: Implementar download do PDF
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Contrato excluído",
        description: "O contrato foi removido com sucesso.",
      });

      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir contrato",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Enviado</Badge>;
      case 'signed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Assinado</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expirado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contract.clients?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contratos</h1>
          <p className="text-slate-600">Gerencie todos os seus contratos</p>
        </div>
        <Link to="/contracts/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="signed">Assinado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Grid */}
      <div className="grid gap-6">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{contract.title}</h3>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="flex items-center text-slate-600 space-x-4 text-sm">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Contrato
                    </span>
                    <span>•</span>
                    <span>{contract.clients?.name || 'Cliente não informado'}</span>
                    <span>•</span>
                    <span>{new Date(contract.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {contract.total_value && (
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        R$ {Number(contract.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewContract(contract.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditContract(contract.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadContract(contract.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteContract(contract.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Nenhum contrato encontrado
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Nenhum contrato corresponde aos filtros aplicados.'
                : 'Você ainda não criou nenhum contrato.'}
            </p>
            <Link to="/contracts/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Contrato
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contracts;
