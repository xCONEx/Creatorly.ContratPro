
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  onMenuToggle: () => void;
}

interface UserProfile {
  name: string;
  email: string;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Se não existe perfil, usar dados do user
        setProfile({
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: crypto.randomUUID(),
          user_id: user.id,
          name: profile.name,
          email: profile.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

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
                  onClick={handleSignOut}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Editar Perfil</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Seu nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
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
