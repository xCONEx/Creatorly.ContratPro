import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useCache } from './useCache';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  syncWithFinanceFlow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearCache } = useCache();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      // Se falhar ao restaurar sessão, faz logout preventivo
      console.error('Erro ao restaurar sessão inicial:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        await createUserProfile(session.user);
      }
      // Se evento for SIGNED_OUT, limpa tudo
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // Debug: Log all user metadata
      console.log('User metadata completo:', user.user_metadata);
      console.log('User email:', user.email);
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Get user data from Google OAuth
        const nameValue = user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.full_name || 'Usuário';
        const emailValue = user.email || '';
        
        // Get avatar URL from Google (available in user_metadata)
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        
        console.log('Criando perfil com dados do Google:', {
          name: nameValue,
          email: emailValue,
          avatar_url: avatarUrl,
          user_metadata_keys: Object.keys(user.user_metadata || {})
        });

        // Create profile with all available data
        const profileData: any = {
          id: user.id,
          name: nameValue,
          email: emailValue
        };

        // Add avatar_url if available
        if (avatarUrl) {
          profileData.avatar_url = avatarUrl;
        }

        try {
          console.log('Tentando inserir perfil com dados:', profileData);
          
          const { error } = await supabase
            .from('profiles')
            .insert(profileData);

          if (error) {
            console.error('Erro ao criar perfil do usuário:', error);
            
            // Fallback: try without avatar_url
            const fallbackData = {
              id: user.id,
              name: nameValue,
              email: emailValue
            };
            
            console.log('Tentando fallback sem avatar:', fallbackData);
            
            const { error: fallbackError } = await supabase
              .from('profiles')
              .insert(fallbackData);

            if (fallbackError) {
              console.error('Erro no fallback ao criar perfil:', fallbackError);
            } else {
              console.log('Perfil criado com sucesso (sem avatar)');
            }
          } else {
            console.log('Perfil criado com sucesso (com avatar do Google)');
          }
        } catch (error) {
          console.error('Erro ao criar perfil do usuário:', error);
        }
      } else {
        // Profile exists, but let's update avatar if it's not set and we have one from Google
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        
        console.log('Perfil existente encontrado:', {
          existingAvatar: (existingProfile as any).avatar_url,
          newAvatarUrl: avatarUrl,
          hasNewAvatar: !!avatarUrl,
          needsUpdate: avatarUrl && !(existingProfile as any).avatar_url
        });
        
        if (avatarUrl && !(existingProfile as any).avatar_url) {
          console.log('Atualizando avatar do perfil existente com foto do Google');
          
          const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl } as any)
            .eq('id', user.id);

          if (error) {
            console.error('Erro ao atualizar avatar do perfil:', error);
          } else {
            console.log('Avatar atualizado com sucesso');
          }
        } else if (avatarUrl) {
          console.log('Avatar já existe no perfil, não precisa atualizar');
        } else {
          console.log('Nenhum avatar disponível do Google');
        }
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar perfil do usuário:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Limpa qualquer cache local antes do logout
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Limpa o cache da aplicação
      clearCache();
      
      // Faz o logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro durante logout:', error);
        throw error;
      }
      
      // Limpa estados locais
      setUser(null);
      setSession(null);
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro durante logout:', error);
      throw error;
    }
  };

  const syncWithFinanceFlow = async () => {
    // Implementação da sincronização com FinanceFlow
    console.log('Sincronização com FinanceFlow iniciada');
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
    syncWithFinanceFlow,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
