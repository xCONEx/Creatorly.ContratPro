
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, DollarSign, Clock, Plus, TrendingUp, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  totalClients: number;
  monthlyRevenue: number;
}

interface RecentContract {
  id: string;
  title: string;
  status: string;
  client_name?: string;
  created_at: string;
  total_value?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    activeContracts: 0,
    totalClients: 0,
    monthlyRevenue: 0
  });
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Buscar estatísticas dos contratos
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id, status, total_value, created_at')
        .eq('user_id', user.id);

      if (contractsError) throw contractsError;

      // Buscar clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      // Buscar contratos recentes com nome do cliente
      const { data: recentContractsData, error: recentError } = await supabase
        .from('contracts')
        .select(`
          id,
          title,
          status,
          created_at,
          total_value,
          clients:client_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Calcular estatísticas
      const totalContracts = contracts?.length || 0;
      const activeContracts = contracts?.filter(c => c.status === 'active' || c.status === 'sent').length || 0;
      const totalClients = clients?.length || 0;

      // Calcular receita do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = contracts
        ?.filter(c => {
          const contractDate = new Date(c.created_at);
          return contractDate.getMonth() === currentMonth && 
                 contractDate.getFullYear() === currentYear &&
                 c.status === 'signed';
        })
        .reduce((sum, c) => sum + (Number(c.total_value) || 0), 0) || 0;

      setStats({
        totalContracts,
        activeContracts,
        totalClients,
        monthlyRevenue
      });

      // Processar contratos recentes
      const processedRecentContracts = recentContractsData?.map(contract => ({
        id: contract.id,
        title: contract.title,
        status: contract.status,
        client_name: (contract.clients as any)?.name || 'Cliente não encontrado',
        created_at: contract.created_at,
        total_value: contract.total_value
      })) || [];

      setRecentContracts(processedRecentContracts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-slate-600 bg-slate-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'signed': return 'Assinado';
      case 'sent': return 'Enviado';
      case 'draft': return 'Rascunho';
      case 'expired': return 'Expirado';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Visão geral dos seus contratos e negócios</p>
        </div>
        <Link to="/contracts/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeContracts} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              contratos assinados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              aguardando assinatura
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contratos Recentes</CardTitle>
              <CardDescription>
                Últimos contratos criados na sua conta
              </CardDescription>
            </div>
            <Link to="/contracts">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentContracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-600 mb-2">Nenhum contrato ainda</h3>
              <p className="text-slate-500 mb-4">Crie seu primeiro contrato para começar</p>
              <Link to="/contracts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{contract.title}</h4>
                    <p className="text-sm text-slate-600">Cliente: {contract.client_name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {contract.total_value && (
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          R$ {Number(contract.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {getStatusLabel(contract.status)}
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
