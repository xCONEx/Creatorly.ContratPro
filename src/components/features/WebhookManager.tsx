
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanFeatureGate from './PlanFeatureGate';

const WebhookManager = () => {
  const { hasFeature } = usePlanFeatures();

  if (!hasFeature('fullApi')) {
    return (
      <PlanFeatureGate
        feature="fullApi"
        requiredPlan="Empresarial"
        fallbackTitle="Webhooks Avançados"
        fallbackDescription="Configure webhooks para receber notificações automáticas sobre eventos importantes em seus contratos."
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
              <Webhook className="w-5 h-5" />
              <span>Webhooks</span>
            </CardTitle>
            <CardDescription>
              Configure webhooks para notificações automáticas
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-center py-8">
          <Webhook className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Recurso em Desenvolvimento</h3>
          <p className="text-slate-600 mb-4">
            O gerenciamento de webhooks estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookManager;
