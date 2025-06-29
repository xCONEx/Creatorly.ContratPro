import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database, Users, Eye, EyeOff } from 'lucide-react';

const ClientsDebugInfo = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugInfo = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Buscar todos os clientes do usuário
      const { data: userClients, error: userError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id);

      // Buscar total de clientes na base
      const { data: allClients, error: allError } = await supabase
        .from('clients')
        .select('id, name, user_id, created_at');

      // Buscar informações do usuário - corrigindo o nome da tabela
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setDebugInfo({
        userClients: userClients || [],
        allClientsCount: allClients?.length || 0,
        userInfo: {
          id: user.id,
          email: user.email,
          profile: profile
        },
        errors: {
          userError,
          allError,
          profileError
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isVisible) {
      fetchDebugInfo();
    }
  }, [user, isVisible]);

  if (!isVisible) {
    return (
      <Card className="mb-4 border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <Button 
            onClick={() => setIsVisible(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Mostrar Debug de Clientes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Debug de Clientes
          </CardTitle>
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={fetchDebugInfo}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Carregando...' : 'Atualizar Debug'}
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded border">
                <h4 className="font-semibold text-blue-600 mb-2">Seus Clientes</h4>
                <p>Quantidade: {debugInfo.userClients?.length || 0}</p>
                {debugInfo.userClients?.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {debugInfo.userClients.map((client: any) => (
                      <div key={client.id} className="text-xs p-1 border-b">
                        <strong>{client.name}</strong>
                        <br />
                        <span className="text-gray-500">
                          {client.email || 'Sem email'} | 
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-white rounded border">
                <h4 className="font-semibold text-green-600 mb-2">Info do Sistema</h4>
                <p>Total de clientes na base: {debugInfo.allClientsCount}</p>
                <p>Seu ID: {debugInfo.userInfo?.id}</p>
                <p>Seu email: {debugInfo.userInfo?.email}</p>
                <p>Perfil encontrado: {debugInfo.userInfo?.profile ? 'Sim' : 'Não'}</p>
              </div>
            </div>

            {debugInfo.errors && Object.values(debugInfo.errors).some(Boolean) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-600 mb-2">Erros Encontrados</h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.errors, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Última atualização: {new Date(debugInfo.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsDebugInfo;
