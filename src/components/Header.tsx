import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
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
      } else {
        setIsProfileOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                <User className="w-5 h-5" />
              </div>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Empresa
              </Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_type" className="text-right">
                Tipo
              </Label>
              <select
                id="user_type"
                value={profile.user_type}
                onChange={(e) => setProfile({ ...profile, user_type: e.target.value as 'individual' | 'company' | 'agency' })}
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="individual">Pessoa Física</option>
                <option value="company">Empresa</option>
                <option value="agency">Agência</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setIsProfileOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleProfileUpdate}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
