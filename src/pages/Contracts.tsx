
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Download,
  Trash2
} from 'lucide-react';

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const contracts = [
    {
      id: 1,
      title: "Contrato de Prestação de Serviços - Desenvolvimento Web",
      client: "Tech Solutions Ltda",
      status: "pending",
      date: "2024-12-25",
      value: "R$ 15.000,00",
      type: "Prestação de Serviços",
      progress: 75
    },
    {
      id: 2,
      title: "Acordo de Confidencialidade - Projeto Alpha",
      client: "StartupX Inovação",
      status: "signed",
      date: "2024-12-24",
      value: "R$ 2.500,00",
      type: "NDA",
      progress: 100
    },
    {
      id: 3,
      title: "Contrato de Desenvolvimento de Software",
      client: "E-commerce Pro",
      status: "draft",
      date: "2024-12-23",
      value: "R$ 25.000,00",
      type: "Desenvolvimento",
      progress: 25
    },
    {
      id: 4,
      title: "Termo de Parceria Comercial",
      client: "Marketing Digital+",
      status: "signed",
      date: "2024-12-22",
      value: "R$ 8.750,00",
      type: "Parceria",
      progress: 100
    },
    {
      id: 5,
      title: "Contrato de Consultoria em TI",
      client: "Consultoria Empresarial",
      status: "review",
      date: "2024-12-21",
      value: "R$ 12.000,00",
      type: "Consultoria",
      progress: 50
    },
    {
      id: 6,
      title: "Acordo de Licenciamento de Software",
      client: "Fintech Solutions",
      status: "pending",
      date: "2024-12-20",
      value: "R$ 35.000,00",
      type: "Licenciamento",
      progress: 80
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'signed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Assinado</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Em Revisão</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Contratos</h1>
            <p className="text-slate-600">Gerencie todos os seus contratos</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Filters */}
        <Card className="mb-6">
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
                  <SelectItem value="review">Em Revisão</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="signed">Assinado</SelectItem>
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
                        {contract.type}
                      </span>
                      <span>•</span>
                      <span>{contract.client}</span>
                      <span>•</span>
                      <span>{new Date(contract.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{contract.value}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Progresso</span>
                    <span className="text-sm font-medium text-slate-800">{contract.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(contract.progress)}`}
                      style={{ width: `${contract.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Contrato
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Contracts;
