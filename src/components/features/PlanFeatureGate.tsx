
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { Link } from 'react-router-dom';

interface PlanFeatureGateProps {
  feature: string;
  requiredPlan: 'Profissional' | 'Empresarial';
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

const PlanFeatureGate: React.FC<PlanFeatureGateProps> = ({
  feature,
  requiredPlan,
  children,
  fallbackTitle,
  fallbackDescription
}) => {
  const { subscription, hasFeature } = usePlanFeatures();
  
  // Se tem acesso à feature, renderiza o conteúdo
  if (hasFeature(feature as any)) {
    return <>{children}</>;
  }

  // Se não tem acesso, mostra o bloqueio
  const planColors = {
    'Profissional': 'bg-blue-100 text-blue-800',
    'Empresarial': 'bg-purple-100 text-purple-800'
  };

  const planIcons = {
    'Profissional': Zap,
    'Empresarial': Crown
  };

  const Icon = planIcons[requiredPlan];

  return (
    <Card className="border-2 border-dashed border-slate-300">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-slate-500" />
        </div>
        <CardTitle className="text-xl">
          {fallbackTitle || `Recurso do Plano ${requiredPlan}`}
        </CardTitle>
        <CardDescription className="text-center">
          {fallbackDescription || `Este recurso está disponível apenas no plano ${requiredPlan} ou superior.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Badge className={planColors[requiredPlan]}>
          <Icon className="w-4 h-4 mr-1" />
          Plano {requiredPlan}
        </Badge>
        
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            Seu plano atual: <strong>{subscription?.plan.name || 'Nenhum'}</strong>
          </p>
          <Link to="/settings">
            <Button className="w-full">
              Fazer Upgrade
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanFeatureGate;
