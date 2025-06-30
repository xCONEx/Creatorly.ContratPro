
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanFeatureGate from './PlanFeatureGate';

const AutomationBuilder = () => {
  const { hasFeature } = usePlanFeatures();

  if (!hasFeature('automations')) {
    return (
      <PlanFeatureGate
        feature="automations"
        requiredPlan="Empresarial"
        fallbackTitle="Automações Personalizadas"
        fallbackDescription="Crie fluxos automatizados para otimizar seus processos de contratos e comunicação com clientes."
      >
        <div />
      </PlanFeatureGate>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Automações</span>
              </CardTitle>
              <CardDescription>
                Configure fluxos automatizados para seus processos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Recurso em Desenvolvimento</h3>
            <p className="text-slate-600 mb-4">
              O construtor de automações estará disponível em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationBuilder;
