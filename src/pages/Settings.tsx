import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { User, Settings as SettingsIcon, Bell, Crown, Building2, Users } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  cpf_cnpj: string;
  user_type: 'pessoa_fisica' | 'pessoa_juridica';
  address: string;
}

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  contract_reminders: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { subscription, plans, contractCount } = useSubscription();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    user_type: 'pessoa_fisica',
    address: ''
  });
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    contract_reminders: true,
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSettings();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          cpf_cnpj: data.cpf_cnpj || '',
          user_type: (data.user_type as 'pessoa_fisica' | 'pessoa_juridica') || 'pessoa_fisica',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({
          notifications_enabled: data.notifications_enabled ?? true,
          email_notifications: data.email_notifications ?? true,
          contract_reminders: data.contract_reminders ?? true,
          theme: (data.theme as 'light' | 'dark' | 'system') || 'light',
          language: data.language || 'pt-BR',
          timezone: data.timezone || 'America/Sao_Paulo'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlan = () => {
    return subscription?.plan || plans.find(p => p.name === 'Gratuito');
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600">Gerencie seu perfil e preferências da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfil */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Perfil do Usuário</span>
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e dados para contratos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user_type">Tipo de conta</Label>
                    <Select
                      value={profile.user_type}
                      onValueChange={(value: 'pessoa_fisica' | 'pessoa_juridica') => 
                        setProfile({ ...profile, user_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pessoa_fisica">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Pessoa Física</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pessoa_juridica">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <span>Pessoa Jurídica</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">
                    {profile.user_type === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}
                  </Label>
                  <Input
                    id="cpf_cnpj"
                    value={profile.cpf_cnpj}
                    onChange={(e) => setProfile({ ...profile, cpf_cnpj: e.target.value })}
                    placeholder={profile.user_type === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Endereço completo"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>Preferências</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notificações</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Ativar notificações</Label>
                    <Switch
                      id="notifications"
                      checked={settings.notifications_enabled}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, notifications_enabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Notificações por email</Label>
                    <Switch
                      id="email-notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, email_notifications: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contract-reminders">Lembretes de contratos</Label>
                    <Switch
                      id="contract-reminders"
                      checked={settings.contract_reminders}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, contract_reminders: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Aparência e Idioma</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        setSettings({ ...settings, theme: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleSettingsUpdate} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Plano Atual */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>Plano Atual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlan && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant={currentPlan.name === 'Gratuito' ? 'secondary' : 'default'} className="mb-2">
                      {currentPlan.name}
                    </Badge>
                    <p className="text-2xl font-bold">
                      R$ {currentPlan.price_monthly.toFixed(2)}
                      <span className="text-sm font-normal text-slate-500">/mês</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-2">{currentPlan.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Contratos este mês:</span>
                      <span className="text-sm font-bold">
                        {contractCount} / {currentPlan.max_contracts_per_month}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((contractCount / currentPlan.max_contracts_per_month) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recursos inclusos:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {currentPlan.name === 'Gratuito' && (
                    <Button className="w-full" variant="default">
                      Fazer Upgrade
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
