import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, DollarSign, Clock, Plus, TrendingUp, Eye, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useContracts } from '@/hooks/useContracts';
import { useClients } from '@/hooks/useClients';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, recentContracts, loading: contractsLoading } = useContracts();
  const { clients, loading: clientsLoading } = useClients();

  const loading = contractsLoading || clientsLoading;

  // Calcular estatísticas combinadas usando useMemo
  const dashboardStats = useMemo(() => {
    return {
      totalContracts: stats.totalContracts,
      activeContracts: stats.activeContracts,
      totalClients: clients.length,
      monthlyRevenue: stats.monthlyRevenue
    };
  }, [stats, clients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'active': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'draft': return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

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
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos seus contratos e negócios</p>
        </div>
        <Link to="/contracts/new">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalContracts}</div>
            <p className="text-xs text-gray-500">
              {dashboardStats.activeContracts} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalClients}</div>
            <p className="text-xs text-gray-500">
              clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {dashboardStats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">
              contratos concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contratos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardStats.activeContracts}</div>
            <p className="text-xs text-gray-500">
              em andamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/contracts/new">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Novo Contrato</h3>
                  <p className="text-sm text-gray-600">Criar contrato personalizado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/clients">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 cursor-pointer transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gerenciar Clientes</h3>
                  <p className="text-sm text-gray-600">Ver e editar clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/contracts">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 cursor-pointer transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ver Contratos</h3>
                  <p className="text-sm text-gray-600">Todos os contratos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Contracts */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-900">Contratos Recentes</CardTitle>
              <CardDescription className="text-gray-600">
                Últimos contratos criados na sua conta
              </CardDescription>
            </div>
            <Link to="/contracts">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contrato ainda</h3>
              <p className="text-gray-500 mb-6">Crie seu primeiro contrato para começar</p>
              <Link to="/contracts/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContracts.slice(0, 5).map((contract) => (
                <div 
                  key={contract.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{contract.title}</h4>
                    <p className="text-sm text-gray-600">
                      Cliente: {contract.clients?.name || 'Cliente não encontrado'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    {contract.total_value && (
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          R$ {Number(contract.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status || 'draft')}`}>
                      {getStatusLabel(contract.status || 'draft')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
