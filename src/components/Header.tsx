import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Menu, LogOut, User, Building2, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  onMenuToggle: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  cpf_cnpj: string;
  user_type: 'individual' | 'company' | 'agency';
  address: string;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    user_type: 'individual',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
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

      if (error) {
        console.error('Error fetching profile:', error);
        // Usar dados do user como fallback
        setProfile({
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
          email: user.email || '',
          phone: '',
          cpf_cnpj: '',
          user_type: 'individual',
          address: ''
        });
        return;
      }

      if (profile) {
        setProfile({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          cpf_cnpj: profile.company || '',
          user_type: profile.user_type || 'individual',
          address: profile.address || ''
        });
      } else {
        // Se não existe perfil, usar dados do user
        setProfile({
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
          email: user.email || '',
          phone: '',
          cpf_cnpj: '',
          user_type: 'individual',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
        email: user.email || '',
        phone: '',
        cpf_cnpj: '',
        user_type: 'individual',
        address: ''
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          company: profile.cpf_cnpj,
          user_type: profile.user_type,
          address: profile.address,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      setIsProfileOpen(false);
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

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`;
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-slate-800">
                Bem-vindo, {profile.name || 'Usuário'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {profile.name || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500">
                  {profile.email}
                </p>
                {profile.user_type === 'company' && (
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">Empresarial</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Avatar 
                  className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <AvatarImage src={getAvatarUrl()} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(profile.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Editar Perfil</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Seu nome completo"
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
                  placeholder="seu@email.com"
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
                  onValueChange={(value: 'individual' | 'company' | 'agency') => 
                    setProfile({ ...profile, user_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Pessoa Física</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="company">
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
                {profile.user_type === 'individual' ? 'CPF' : 'CNPJ'}
              </Label>
              <Input
                id="cpf_cnpj"
                value={profile.cpf_cnpj}
                onChange={(e) => setProfile({ ...profile, cpf_cnpj: e.target.value })}
                placeholder={profile.user_type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileOpen(false)}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
