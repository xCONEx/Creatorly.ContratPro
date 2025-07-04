import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
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
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create new profile with minimal data first
        const minimalProfileData: any = {
          id: user.id
        };

        // Try to add name/full_name if the column exists
        const nameValue = user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário';
        
        // Try different column names for name
        try {
          const { error: nameError } = await supabase
            .from('user_profiles')
            .insert({
              ...minimalProfileData,
              full_name: nameValue
            });

          if (nameError && nameError.message.includes('full_name')) {
            // Try with 'name' column
            const { error: nameError2 } = await supabase
              .from('user_profiles')
              .insert({
                ...minimalProfileData,
                name: nameValue
              });

            if (nameError2 && nameError2.message.includes('name')) {
              // If both fail, just insert with id
              const { error } = await supabase
                .from('user_profiles')
                .insert(minimalProfileData);

              if (error) {
                console.error('Erro ao criar perfil do usuário (apenas id):', error);
              } else {
                console.log('Perfil criado com sucesso (apenas id)');
              }
            } else if (nameError2) {
              console.error('Erro ao criar perfil do usuário (com name):', nameError2);
            } else {
              console.log('Perfil criado com sucesso (com name)');
            }
          } else if (nameError) {
            console.error('Erro ao criar perfil do usuário (com full_name):', nameError);
          } else {
            console.log('Perfil criado com sucesso (com full_name)');
          }
        } catch (error) {
          console.error('Erro ao criar perfil do usuário:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
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
    await supabase.auth.signOut();
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
