
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Zap, Database, Users, FileText } from 'lucide-react';
import { useFinanceFlowSync } from '@/hooks/useFinanceFlowSync';
import { useSubscription } from '@/hooks/useSubscription';

const FinanceFlowSync = () => {
  const { syncPlan, isLoading, lastSync } = useFinanceFlowSync();
  const { subscription } = useSubscription();

  const handleSync = async () => {
    await syncPlan();
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Empresarial':
        return <Database className="w-4 h-4 text-purple-500" />;
      case 'Profissional':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground">
          <Database className="w-5 h-5 text-blue-500" />
          <span>Sincronização FinanceFlow</span>
        </CardTitle>
        <CardDescription>
          Sincronize automaticamente seu plano, clientes e contratos do FinanceFlow com o ContratPro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div>
            <p className="font-medium text-card-foreground">Plano Atual</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={subscription?.plan.name === 'Gratuito' ? 'secondary' : 'default'}>
                {subscription?.plan.name || 'Carregando...'}
              </Badge>
              {getPlanIcon(subscription?.plan.name || '')}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Última sincronização</p>
            <p className="text-sm font-medium">{formatLastSync(lastSync)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-card-foreground">O que é sincronizado?</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">Planos de assinatura</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-green-700 dark:text-green-300">Base de clientes</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="text-purple-700 dark:text-purple-300">Contratos ativos</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-card-foreground">Mapeamento de Planos</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span className="text-blue-700 dark:text-blue-300">FinanceFlow Premium</span>
              <span>→</span>
              <Badge variant="default" className="bg-blue-500">Profissional</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <span className="text-purple-700 dark:text-purple-300">FinanceFlow Enterprise</span>
              <span>→</span>
              <Badge variant="default" className="bg-purple-500">Empresarial</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-700 dark:text-gray-300">FinanceFlow Free</span>
              <span>→</span>
              <Badge variant="secondary">Gratuito</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-card-foreground">Como funciona?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Conectamos com seu FinanceFlow usando seu email</li>
            <li>• Verificamos seu plano atual no FinanceFlow</li>
            <li>• Importamos seus clientes cadastrados</li>
            <li>• Sincronizamos contratos existentes (se disponível)</li>
            <li>• Atualizamos automaticamente seu plano no ContratPro</li>
            <li>• Sincronização automática no login</li>
          </ul>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </Button>
          
          {subscription?.plan.name === 'Gratuito' && (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Plano gratuito detectado</span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <strong>📝 Importante:</strong> Para funcionar corretamente, você precisa ter uma conta no FinanceFlow 
          com o mesmo email usado aqui no ContratPro. Os clientes e contratos serão importados automaticamente evitando duplicatas.
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceFlowSync;
