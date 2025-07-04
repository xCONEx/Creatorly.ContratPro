import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  Crown,
  Edit,
  Trash2,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_plans: {
    id: number;
    name: string;
    price: number;
  };
}

interface User {
  id: string;
  email: string;
  created_at: string;
  user_profiles?: {
    name: string;
    user_type: string;
  };
  user_subscriptions?: UserSubscription;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;

    try {
      console.log('Checking admin role for:', user.email);
      
      // Verificar se é admin pelo email
      const adminRole = user.email === 'yuriadrskt@gmail.com';
      
      console.log('Is admin:', adminRole);
      setIsAdmin(adminRole);
      
      if (adminRole) {
        await fetchUsers();
        await fetchPlans();
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          user_type,
          created_at
        `);

      console.log('User profiles data:', profiles);
      
      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      // Buscar assinaturas separadamente
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          user_id,
          status,
          subscription_plans (
            id,
            name,
            price
          )
        `);

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
      }

      // Combinar dados
      const transformedUsers = (profiles || []).map(profile => {
        const userSub = subscriptions?.find(sub => sub.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email,
          created_at: profile.created_at,
          user_profiles: {
            name: profile.name,
            user_type: profile.user_type
          },
          user_subscriptions: userSub ? {
            status: userSub.status,
            plan: {
              id: userSub.subscription_plans?.id || 0,
              name: userSub.subscription_plans?.name || '',
              price: userSub.subscription_plans?.price || 0
            }
          } : undefined
        };
      });
      
      console.log('Transformed users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar usuários",
        variant: "destructive",
      });
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price')
        .order('price');

      if (error) {
        console.error('Error fetching plans:', error);
        return;
      }
      
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpdateUserPlan = async () => {
    if (!selectedUser || !selectedPlan) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: selectedUser.id,
          plan_id: selectedPlan,
          status: 'active',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: "O plano do usuário foi atualizado com sucesso.",
      });

      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano do usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    try {
      // Deletar todos os dados relacionados - usando tabelas específicas uma por vez
      const tablesToClean = [
        'user_subscriptions',
        'user_settings', 
        'contracts',
        'clients',
        'user_profiles'
      ];
      
      for (const tableName of tablesToClean) {
        const { error } = await supabase
          .from(tableName as any)
          .delete()
          .eq('user_id', userId);
          
        if (error) {
          console.error(`Error deleting from ${tableName}:`, error);
        }
      }

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.user_profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Acesso Negado</h2>
          <p className="text-slate-600">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-slate-500 mt-2">Email atual: {user?.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel Admin</h1>
          <p className="text-slate-600">Gerencie usuários e assinaturas</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Crown className="w-4 h-4 mr-1" />
          Administrador
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Usuários ({filteredUsers.length})</span>
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários registrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.user_profiles?.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.user_profiles?.user_type === 'pessoa_juridica' ? 'PJ' : 'PF'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.user_subscriptions?.plan?.name || 'Sem plano'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.user_subscriptions?.status === 'active' ? 'default' : 'secondary'}
                    >
                      {user.user_subscriptions?.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedPlan(user.user_subscriptions?.plan?.id.toString() || '');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                            <DialogDescription>
                              Altere o plano de assinatura do usuário.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Usuário</Label>
                              <p className="text-sm text-slate-600">{selectedUser?.email}</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="plan">Plano</Label>
                              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                                <SelectContent>
                                  {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id.toString()}>
                                      {plan.name} - R$ {plan.price.toFixed(2)}/mês
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleUpdateUserPlan}>
                                Salvar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
