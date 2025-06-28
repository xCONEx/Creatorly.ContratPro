
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download
} from 'lucide-react';

interface ReportStats {
  totalContracts: number;
  activeContracts: number;
  totalClients: number;
  totalRevenue: number;
  monthlyContracts: Array<{ month: string; count: number }>;
  contractsByStatus: Array<{ status: string; count: number; color: string }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

const Reports = () => {
  const { user } = useAuth();
  const { subscription, checkPlanLimit } = useSubscription();
  const [stats, setStats] = useState<ReportStats>({
    totalContracts: 0,
    activeContracts: 0,
    totalClients: 0,
    totalRevenue: 0,
    monthlyContracts: [],
    contractsByStatus: [],
    revenueByMonth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);

  const fetchReportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar contratos
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id);

      if (contractsError) throw contractsError;

      // Buscar clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      // Processar dados
      const totalContracts = contracts?.length || 0;
      const activeContracts = contracts?.filter(c => c.status === 'sent' || c.status === 'signed').length || 0;
      const totalClients = clients?.length || 0;
      const totalRevenue = contracts?.reduce((sum, contract) => sum + (contract.total_value || 0), 0) || 0;

      // Contratos por mês (últimos 6 meses)
      const monthlyData = getMonthlyData(contracts || []);
      
      // Contratos por status
      const statusData = getStatusData(contracts || []);
      
      // Receita por mês
      const revenueData = getRevenueData(contracts || []);

      setStats({
        totalContracts,
        activeContracts,
        totalClients,
        totalRevenue,
        monthlyContracts: monthlyData,
        contractsByStatus: statusData,
        revenueByMonth: revenueData
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyData = (contracts: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const count = contracts.filter(contract => {
        const contractDate = new Date(contract.created_at);
        const contractMonthKey = `${contractDate.getFullYear()}-${String(contractDate.getMonth() + 1).padStart(2, '0')}`;
        return contractMonthKey === monthKey;
      }).length;
      
      months.push({
        month: `${monthName}/${year.toString().slice(-2)}`,
        count
      });
    }
    
    return months;
  };

  const getStatusData = (contracts: any[]) => {
    const statusColors: Record<string, string> = {
      'draft': '#94a3b8',
      'sent': '#3b82f6', 
      'signed': '#10b981',
      'expired': '#ef4444'
    };

    const statusLabels: Record<string, string> = {
      'draft': 'Rascunho',
      'sent': 'Enviado',
      'signed': 'Assinado',
      'expired': 'Expirado'
    };

    const statusCounts = contracts.reduce((acc, contract) => {
      const status = contract.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: statusLabels[status] || status,
      count: count as number,
      color: statusColors[status] || '#64748b'
    }));
  };

  const getRevenueData = (contracts: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const revenue = contracts
        .filter(contract => {
          const contractDate = new Date(contract.created_at);
          const contractMonthKey = `${contractDate.getFullYear()}-${String(contractDate.getMonth() + 1).padStart(2, '0')}`;
          return contractMonthKey === monthKey && contract.status === 'signed';
        })
        .reduce((sum, contract) => sum + (contract.total_value || 0), 0);
      
      months.push({
        month: `${monthName}/${year.toString().slice(-2)}`,
        revenue
      });
    }
    
    return months;
  };

  const generateReport = async (type: 'contracts' | 'clients' | 'revenue') => {
    const canGenerate = await checkPlanLimit('api');
    if (!canGenerate && subscription?.plan.name === 'Gratuito') {
      toast({
        title: "Recurso Premium",
        description: "Geração de relatórios detalhados está disponível apenas nos planos pagos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const reportData = {
        type,
        data: type === 'contracts' ? stats.monthlyContracts : 
              type === 'clients' ? { totalClients: stats.totalClients } :
              stats.revenueByMonth,
        generated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user?.id,
          title: `Relatório ${type === 'contracts' ? 'de Contratos' : 
                              type === 'clients' ? 'de Clientes' : 
                              'de Receita'}`,
          type,
          data: reportData
        });

      if (error) throw error;

      toast({
        title: "Relatório gerado",
        description: "O relatório foi salvo com sucesso.",
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-600">Analise o desempenho do seu negócio</p>
        </div>
        
        {subscription?.plan.name !== 'Gratuito' && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => generateReport('contracts')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Contratos
            </Button>
            <Button variant="outline" onClick={() => generateReport('revenue')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Receita
            </Button>
          </div>
        )}
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Contratos</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalContracts}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Contratos Ativos</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeContracts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Clientes</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Receita Total</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Contratos por mês */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos por Mês</CardTitle>
            <CardDescription>Evolução mensal dos contratos criados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyContracts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contratos por status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Contratos</CardTitle>
            <CardDescription>Distribuição por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.contractsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.contractsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Receita por mês */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Receita por Mês</CardTitle>
            <CardDescription>Evolução da receita dos contratos assinados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Receita']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limitações do plano gratuito */}
      {subscription?.plan.name === 'Gratuito' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Badge variant="secondary">Plano Gratuito</Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-yellow-800">
                  Desbloqueie Relatórios Avançados
                </h3>
                <p className="text-yellow-700 mt-1">
                  Faça upgrade para ter acesso a relatórios detalhados, exportação de dados e análises avançadas.
                </p>
                <Button className="mt-4" variant="default">
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
