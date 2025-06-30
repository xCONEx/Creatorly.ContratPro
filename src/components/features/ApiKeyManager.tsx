
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanFeatureGate from './PlanFeatureGate';

const ApiKeyManager = () => {
  const { hasFeature } = usePlanFeatures();

  if (!hasFeature('basicApi')) {
    return (
      <PlanFeatureGate
        feature="basicApi"
        requiredPlan="Profissional"
        fallbackTitle="Acesso à API"
        fallbackDescription="Integre sua aplicação com nossa API REST para automatizar processos e criar integrações personalizadas."
      >
        <div />
      </PlanFeatureGate>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Chaves de API</span>
            </CardTitle>
            <CardDescription>
              Gerencie suas chaves de API para integrações
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-center py-8">
          <Key className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Recurso em Desenvolvimento</h3>
          <p className="text-slate-600 mb-4">
            O gerenciamento de chaves de API estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
