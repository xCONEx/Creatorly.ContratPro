
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Zap, Settings, Key, Bot, Webhook, BarChart3 } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanFeatureGate from '@/components/features/PlanFeatureGate';
import UsageMeter from '@/components/features/UsageMeter';
import ApiKeyManager from '@/components/features/ApiKeyManager';
import WebhookManager from '@/components/features/WebhookManager';
import AutomationBuilder from '@/components/features/AutomationBuilder';

const Features = () => {
  const { subscription, hasFeature } = usePlanFeatures();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Recursos</h1>
        <p className="text-slate-600 mt-2">
          Gerencie recursos avançados e configurações do seu plano
        </p>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Plano Atual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {subscription?.plan.name || 'Nenhum Plano'}
              </h3>
              <p className="text-slate-600">
                {subscription?.plan.description || 'Selecione um plano para começar'}
              </p>
            </div>
            <div className="text-right">
              {subscription?.plan.price_monthly && (
                <p className="text-2xl font-bold text-green-600">
                  R$ {subscription.plan.price_monthly}/mês
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UsageMeter
          feature="contracts"
          currentUsage={5}
          title="Contratos"
          description="Contratos criados este mês"
        />
        <UsageMeter
          feature="templates"
          currentUsage={2}
          title="Templates"
          description="Templates personalizados"
        />
        <UsageMeter
          feature="api"
          currentUsage={150}
          title="Chamadas de API"
          description="Requests da API este mês"
        />
      </div>

      {/* Feature Tabs */}
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>Automações</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <WebhookManager />
          
          <PlanFeatureGate
            feature="zapierIntegration"
            requiredPlan="Empresarial"
            fallbackTitle="Integração Zapier"
            fallbackDescription="Conecte seus contratos com mais de 5000 aplicativos através do Zapier."
          >
            <Card>
              <CardHeader>
                <CardTitle>Integração Zapier</CardTitle>
                <CardDescription>
                  Conecte com mais de 5000 aplicativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Zapier Configurado</h3>
                  <p className="text-slate-600">
                    Suas integrações Zapier estão funcionando perfeitamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </PlanFeatureGate>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiKeyManager />
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <AutomationBuilder />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PlanFeatureGate
            feature="analytics"
            requiredPlan="Empresarial"
            fallbackTitle="Analytics Avançado"
            fallbackDescription="Visualize métricas detalhadas sobre seus contratos, clientes e performance."
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </CardTitle>
                <CardDescription>
                  Métricas e insights dos seus contratos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics em Desenvolvimento</h3>
                  <p className="text-slate-600">
                    Dashboards avançados estarão disponíveis em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </PlanFeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Features;
