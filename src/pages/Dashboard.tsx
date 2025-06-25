
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  LogOut,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string;
  avatar: string;
  plan: string;
  joinDate: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logout realizado",
      description: "Até mais!",
    });
    navigate('/login');
  };

  if (!user) return null;

  const stats = [
    {
      title: "Contratos Ativos",
      value: "12",
      description: "3 pendentes de assinatura",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Clientes",
      value: "28",
      description: "+4 este mês",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Tempo Médio",
      value: "2.3h",
      description: "Para assinatura",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Taxa de Sucesso",
      value: "94%",
      description: "Contratos finalizados",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const recentContracts = [
    {
      id: 1,
      title: "Contrato de Prestação de Serviços",
      client: "Tech Solutions Ltda",
      status: "pending",
      date: "2024-12-25",
      value: "R$ 15.000,00"
    },
    {
      id: 2,
      title: "Acordo de Confidencialidade",
      client: "StartupX",
      status: "signed",
      date: "2024-12-24",
      value: "R$ 2.500,00"
    },
    {
      id: 3,
      title: "Contrato de Desenvolvimento",
      client: "E-commerce Pro",
      status: "draft",
      date: "2024-12-23",
      value: "R$ 25.000,00"
    },
    {
      id: 4,
      title: "Termo de Parceria",
      client: "Marketing Digital+",
      status: "signed",
      date: "2024-12-22",
      value: "R$ 8.750,00"
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
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContratPro
              </h1>
            </div>
            <div className="hidden md:block w-px h-6 bg-slate-300" />
            <p className="hidden md:block text-slate-600">Dashboard</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block text-sm">
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-slate-500">Plano {user.plan}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Olá, {user.name.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-600">
            Aqui está um resumo dos seus contratos e atividades.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Contracts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Contratos Recentes</CardTitle>
                    <CardDescription>Seus contratos mais recentes</CardDescription>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contrato
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {recentContracts.map((contract, index) => (
                    <div
                      key={contract.id}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        index !== recentContracts.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-slate-800">{contract.title}</h4>
                            {getStatusBadge(contract.status)}
                          </div>
                          <div className="flex items-center text-sm text-slate-600 space-x-4">
                            <span>{contract.client}</span>
                            <span>•</span>
                            <span>{new Date(contract.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-800">{contract.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Novo Contrato
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Clientes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-slate-800">Contrato assinado por Tech Solutions</p>
                      <p className="text-slate-500">Há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-slate-800">Novo cliente cadastrado</p>
                      <p className="text-slate-500">Há 5 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-slate-800">Template atualizado</p>
                      <p className="text-slate-500">Ontem</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
