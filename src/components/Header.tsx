import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menu, User, LogOut, ChevronDown, User as UserIcon, Mail, Phone, Building, Save, X, CheckCircle } from 'lucide-react';
import { AvatarWithInitials } from '@/components/ui/avatar-with-initials';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar_url?: string;
  user_type: 'individual' | 'company' | 'agency';
  subscription: 'free' | 'basic' | 'professional' | 'enterprise';
}

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    company: '',
    user_type: 'individual',
    subscription: 'free'
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error || !profile) {
        setProfile({
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
          email: user.email || '',
          phone: '',
          company: '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          user_type: 'individual',
          subscription: 'free'
        });
        return;
      }
      setProfile({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        company: profile.company || '',
        avatar_url: (profile as any).avatar_url || '',
        user_type: (profile.user_type as 'individual' | 'company' | 'agency') || 'individual',
        subscription: (profile.subscription as 'free' | 'basic' | 'professional' | 'enterprise') || 'free'
      });
    } catch (error) {
      setProfile({
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
        email: user.email || '',
        phone: '',
        company: '',
        user_type: 'individual',
        subscription: 'free'
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          company: profile.company,
          user_type: profile.user_type,
          subscription: profile.subscription,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        });
        
        setTimeout(() => {
          setIsProfileOpen(false);
          setIsSuccess(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Button onClick={onMenuToggle} className="lg:hidden p-2" aria-label="Abrir menu">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight select-none">ContratPro</h1>
        </div>
        {user && (
          <div className="relative flex items-center gap-2">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setMenuOpen((v) => !v)}>
              <AvatarWithInitials
                src={profile.avatar_url}
                name={profile.name}
                size="sm"
                className="w-9 h-9"
              />
              <div className="flex flex-col text-right">
                <span className="font-semibold text-gray-900 leading-tight">{profile.name}</span>
                <span className="text-xs text-blue-600 font-medium capitalize">{profile.subscription}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            {menuOpen && (
              <div className="absolute right-0 mt-12 w-48 bg-white border rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700"
                  onClick={() => { setIsProfileOpen(true); setMenuOpen(false); }}
                >
                  <User className="w-4 h-4" /> Perfil
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="relative">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Editar Perfil
            </DialogTitle>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Nome Completo
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite seu nome completo"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Empresa
              </Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nome da sua empresa"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsProfileOpen(false)}
                className="flex-1 h-11 border-gray-300 hover:bg-gray-50 bg-white text-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Salvo!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
