import React, { useState, useEffect, useRef } from 'react';
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
import { useSubscription } from '@/hooks/useSubscription';

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
  const { subscription, plans } = useSubscription();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    company: '',
    user_type: 'individual',
    subscription: 'free'
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Fecha o menu quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Fecha o menu quando não há usuário ou quando o usuário muda
  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
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
    try {
      setIsLoggingOut(true);
      setMenuOpen(false); // Fecha o menu dropdown imediatamente
      
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await signOut();
      
      // Limpa estados locais
      setProfile({
        name: '',
        email: '',
        phone: '',
        company: '',
        user_type: 'individual',
        subscription: 'free'
      });
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro durante logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getCurrentPlan = () => {
    return subscription?.plan || plans.find(p => p.name === 'Gratuito');
  };
  const currentPlan = getCurrentPlan();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button 
            onClick={onMenuToggle} 
            className="lg:hidden p-2 h-10 w-10 rounded-lg hover:bg-gray-100" 
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-700 tracking-tight select-none">
            ContratPro
          </h1>
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-lg hover:bg-gray-50 transition-colors" 
              onClick={() => setMenuOpen((v) => !v)}
            >
              <AvatarWithInitials
                src={profile.avatar_url}
                name={profile.name}
                size="sm"
                className="w-8 h-8 sm:w-9 sm:h-9"
              />
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-semibold text-gray-900 leading-tight text-sm">
                  {profile.name}
                </span>
                <span className="text-xs text-blue-600 font-medium capitalize">
                  {currentPlan ? currentPlan.name : 'Gratuito'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border rounded-lg shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 text-left"
                  onClick={() => { setIsProfileOpen(true); setMenuOpen(false); }}
                >
                  <User className="w-4 h-4" /> 
                  <span>Editar Perfil</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Saindo...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" /> 
                      <span>Sair</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Editar Perfil
            </DialogTitle>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  type="email"
                  className="w-full"
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  type="tel"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleProfileUpdate} 
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setIsProfileOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
