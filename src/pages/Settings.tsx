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
  full_name: string;
  avatar_url: string;
  plan_id: number | null;
}

interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { subscription, plans, contractCount } = useSubscription();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    avatar_url: '',
    plan_id: null,
  });
  const [settings, setSettings] = useState<UserSettings>({
    id: '',
    theme: 'light',
    notifications_enabled: true,
    language: 'pt-BR',
    created_at: '',
    updated_at: ''
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
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) {
        setProfile({
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || '',
          plan_id: profile.plan_id ?? null,
        });
      } else {
        setProfile({
          full_name: '',
          avatar_url: '',
          plan_id: null,
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
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({
          id: data.id || '',
          theme: (data.theme as 'light' | 'dark' | 'system') || 'light',
          notifications_enabled: data.notifications_enabled ?? true,
          language: data.language || 'pt-BR',
          created_at: data.created_at || '',
          updated_at: data.updated_at || ''
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
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          plan_id: profile.plan_id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;

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
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          id: user.id,
          theme: settings.theme,
          notifications_enabled: settings.notifications_enabled,
          language: settings.language,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (settingsError) throw settingsError;

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
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil e preferências da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfil */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
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
                    <Label htmlFor="full_name">Nome completo *</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      placeholder="URL do avatar"
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan_id">Plano Atual</Label>
                  <Select
                    value={profile.plan_id !== null ? String(profile.plan_id) : 'none'}
                    onValueChange={(value) => setProfile({ ...profile, plan_id: value !== 'none' ? Number(value) : null })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum plano</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isLoading} className="gradient-primary text-white">
                  {isLoading ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <SettingsIcon className="w-5 h-5" />
                <span>Preferências</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center space-x-2 text-card-foreground">
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
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground">Aparência e Idioma</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        setSettings({ ...settings, theme: value })
                      }
                    >
                      <SelectTrigger className="bg-background border-border">
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
                      <SelectTrigger className="bg-background border-border">
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

              <Button onClick={handleSettingsUpdate} disabled={isLoading} className="gradient-primary text-white">
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Plano Atual */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Crown className="w-5 h-5" />
                <span>Plano Atual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlan && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className={currentPlan.name === 'Gratuito' ? 'bg-secondary' : 'bg-default'} className="mb-2">
                      {currentPlan.name}
                    </Badge>
                    <p className="text-2xl font-bold text-card-foreground">
                      R$ {(currentPlan.price || 0).toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{currentPlan.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Contratos este mês:</span>
                      <span className="text-sm font-bold">
                        {contractCount} / {currentPlan.max_contracts_per_month}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((contractCount / currentPlan.max_contracts_per_month) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-card-foreground">Recursos inclusos:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {currentPlan.name === 'Gratuito' && (
                    <Button className="w-full gradient-primary text-white" variant="default">
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
