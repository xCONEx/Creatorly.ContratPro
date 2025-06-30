
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database, Eye, EyeOff, RefreshCw } from 'lucide-react';

const FinanceFlowDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFinanceFlowClients = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      console.log('Chamando função para buscar clientes do FinanceFlow...');
      
      const { data, error } = await supabase.functions.invoke('sync-financeflow-plan', {
        body: { 
          user_email: user.email,
          action: 'fetch_clients'
        }
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro ao chamar função:', error);
        setDebugInfo({
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        });
      } else {
        setDebugInfo({
          ...data,
          success: true,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <Button 
            onClick={() => setIsVisible(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Mostrar Debug FinanceFlow
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-500" />
            Debug FinanceFlow
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
            onClick={fetchFinanceFlowClients}
            disabled={isLoading}
            size="sm"
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Buscando...' : 'Buscar Clientes FinanceFlow'}
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-semibold text-blue-600 mb-2">
                {debugInfo.success ? '✅ Resultado da Busca' : '❌ Erro na Busca'}
              </h4>
              
              {debugInfo.success ? (
                <div className="space-y-2">
                  <p><strong>Email pesquisado:</strong> {debugInfo.user_email}</p>
                  <p><strong>Clientes encontrados:</strong> {debugInfo.clients_count || 0}</p>
                  
                  {debugInfo.clients && debugInfo.clients.length > 0 ? (
                    <div>
                      <p className="font-medium">Clientes:</p>
                      <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                        {debugInfo.clients.map((client: any, index: number) => (
                          <div key={index} className="text-xs border-b py-1">
                            <strong>{client.name || client.nome || 'Sem nome'}</strong>
                            <br />
                            <span className="text-gray-600">
                              Email: {client.email || 'Sem email'} | 
                              Telefone: {client.phone || client.telefone || client.celular || 'Sem telefone'} |
                              CNPJ: {client.cnpj || client.cpf_cnpj || client.document || client.cpf || 'Sem documento'}
                            </span>
                            <br />
                            <span className="text-gray-400 text-xs">
                              User Email: {client.user_email || 'Sem user_email'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-yellow-100 border border-yellow-300 rounded">
                      <p className="text-yellow-800">
                        <strong>⚠️ Nenhum cliente encontrado no FinanceFlow</strong>
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Possíveis causas:
                        <br />• Não há clientes cadastrados no FinanceFlow com seu email
                        <br />• O campo user_email não está preenchido na tabela clients do FinanceFlow
                        <br />• Problema de conectividade com o FinanceFlow
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-800"><strong>Erro:</strong> {debugInfo.error}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                Última busca: {new Date(debugInfo.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceFlowDebug;
