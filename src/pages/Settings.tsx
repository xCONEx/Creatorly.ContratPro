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
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Crown, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  Palette,
  Shield,
  Zap,
  CheckCircle,
  Save,
  X
} from 'lucide-react';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { AvatarWithInitials } from '@/components/ui/avatar-with-initials';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

// Mapeamento de nomes bonitos para recursos
const featureNames: Record<string, string> = {
  basicTemplates: 'Templates Básicos',
  pdfExport: 'Exportação em PDF',
  emailSupport: 'Suporte por E-mail',
  premiumTemplates: 'Templates Premium',
  electronicSignature: 'Assinatura Eletrônica',
  prioritySupport: 'Suporte Prioritário',
  basicApi: 'API Básica',
  basicReports: 'Relatórios Básicos',
  emailNotifications: 'Notificações por E-mail',
  autoBackup: 'Backup Automático',
  advancedClientManagement: 'Gestão Avançada de Clientes',
  customTemplates: 'Templates Personalizados',
  unlimitedContracts: 'Contratos Ilimitados',
  fullApi: 'API Completa',
  advancedReports: 'Relatórios Avançados',
  analytics: 'Analytics',
  support24_7: 'Suporte 24/7',
  adminPanel: 'Painel Administrativo',
  advancedIntegrations: 'Integrações Avançadas',
  zapierIntegration: 'Integração com Zapier',
  whiteLabel: 'White Label',
  fullBackup: 'Backup Completo',
  multiUser: 'Multiusuário',
  advancedSignature: 'Assinatura Avançada',
  automations: 'Automações',
  multiFormatExport: 'Exportação Multi-Formato',
  compliance: 'Compliance',
  sso: 'Login Único (SSO)'
};

const Settings = () => {
  const { user } = useAuth();
  const { subscription, plans, contractCount } = useSubscription();
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    avatar_url: '',
    created_at: '',
    updated_at: ''
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
  const [activeTab, setActiveTab] = useState('profile');

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
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) {
        setProfile({
          id: profile.id || '',
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          company: profile.company || '',
          address: profile.address || '',
          avatar_url: (profile as any).avatar_url || '',
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || ''
        });
      } else {
        setProfile({
          id: '',
          name: '',
          email: '',
          phone: '',
          company: '',
          address: '',
          avatar_url: '',
          created_at: '',
          updated_at: ''
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
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          company: profile.company,
          address: profile.address,
          avatar_url: profile.avatar_url,
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
          user_id: user.id,
          theme: settings.theme,
          notifications_enabled: settings.notifications_enabled,
          language: settings.language,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
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

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferências', icon: SettingsIcon },
    { id: 'subscription', label: 'Assinatura', icon: Crown },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie seu perfil e preferências da conta</p>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-6 h-6 text-blue-600" />
                    Perfil do Usuário
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e dados para contratos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <AvatarUpload
                          value={profile.avatar_url || ''}
                          onChange={(value) => setProfile({ ...profile, avatar_url: value })}
                          label="Alterar foto"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nome completo *
                        </Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          type="email"
                          className="h-11"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium">
                          CNPJ/CPF
                        </Label>
                        <Input
                          id="company"
                          value={profile.company || ''}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          placeholder="00.000.000/0000-00"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Endereço completo
                      </Label>
                      <Input
                        id="address"
                        value={profile.address || ''}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Rua, número, bairro, cidade - Estado, CEP"
                        className="h-11"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Perfil
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <SettingsIcon className="w-6 h-6 text-blue-600" />
                    Preferências
                  </CardTitle>
                  <CardDescription>
                    Configure suas preferências de notificações e aparência
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="w-5 h-5 text-gray-600" />
                      Notificações
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="notifications" className="text-sm font-medium">
                            Ativar notificações
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Receba alertas sobre novos contratos e atualizações
                          </p>
                        </div>
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

                  {/* Appearance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="w-5 h-5 text-gray-600" />
                      Aparência e Idioma
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tema</Label>
                        <Select
                          value={settings.theme}
                          onValueChange={(value: 'light' | 'dark' | 'system') => 
                            setSettings({ ...settings, theme: value })
                          }
                        >
                          <SelectTrigger className="h-11">
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
                        <Label className="text-sm font-medium">Idioma</Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) => setSettings({ ...settings, language: value })}
                        >
                          <SelectTrigger className="h-11">
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

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      onClick={handleSettingsUpdate} 
                      disabled={isLoading} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Crown className="w-6 h-6 text-yellow-600" />
                    Plano Atual
                  </CardTitle>
                  <CardDescription>
                    Gerencie sua assinatura e recursos disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPlan && (
                    <div className="space-y-6">
                      {/* Plan Info */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <Badge className={`mb-3 ${
                          currentPlan.name === 'Gratuito' 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {currentPlan.name}
                        </Badge>
                        <p className="text-3xl font-bold text-gray-900">
                          R$ {(currentPlan.price || 0).toFixed(2)}
                          <span className="text-sm font-normal text-gray-500">/mês</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{currentPlan.description}</p>
                      </div>
                      
                      {/* Usage */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Contratos este mês:</span>
                          <span className="text-sm font-bold text-gray-900">
                            {(() => {
                              if (currentPlan.name === 'Empresarial') return `${contractCount} / Ilimitado`;
                              if (currentPlan.name === 'Profissional') return `${contractCount} / 100`;
                              if (currentPlan.name === 'Gratuito') return `${contractCount} / 10`;
                              return `${contractCount}`;
                            })()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: (() => {
                                if (currentPlan.name === 'Empresarial') return '100%';
                                if (currentPlan.name === 'Profissional') return `${Math.min((contractCount / 100) * 100, 100)}%`;
                                if (currentPlan.name === 'Gratuito') return `${Math.min((contractCount / 10) * 100, 100)}%`;
                                return '0%';
                              })()
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-600" />
                          Recursos inclusos:
                        </h4>
                        <ul className="space-y-2">
                          {Array.isArray(currentPlan.features) ? currentPlan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{featureNames[feature] || feature}</span>
                            </li>
                          )) : (
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{currentPlan.features || 'Recursos do plano'}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      {/* Upgrade Button */}
                      {currentPlan.name === 'Gratuito' && (
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12">
                          <Crown className="w-4 h-4 mr-2" />
                          Fazer Upgrade
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
