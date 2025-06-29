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
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Trigger FinanceFlow sync on sign in
        if (event === 'SIGNED_IN' && session?.user?.email) {
          console.log('User signed in, triggering FinanceFlow sync...');
          setTimeout(() => {
            syncWithFinanceFlow();
          }, 2000); // Delay to ensure user data is loaded
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncWithFinanceFlow = async () => {
    if (!user?.email) return;
    
    try {
      console.log('Syncing with FinanceFlow for:', user.email);
      
      const { data, error } = await supabase.functions.invoke('sync-financeflow-plan', {
        body: { user_email: user.email }
      });

      if (error) {
        console.error('FinanceFlow sync error:', error);
        return;
      }

      console.log('FinanceFlow sync result:', data);
      
      if (data?.success) {
        // Refresh the page to update subscription data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
    } catch (error) {
      console.error('FinanceFlow sync failed:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
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
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      loading,
      syncWithFinanceFlow
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
