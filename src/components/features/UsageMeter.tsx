
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Crown } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface UsageMeterProps {
  feature: 'contracts' | 'templates' | 'api' | 'storage' | 'users';
  currentUsage: number;
  title: string;
  description?: string;
  unit?: string;
}

const UsageMeter: React.FC<UsageMeterProps> = ({
  feature,
  currentUsage,
  title,
  description,
  unit = ''
}) => {
  const { getFeatureLimit, getUsagePercentage, canUseFeature } = usePlanFeatures();
  
  const limit = getFeatureLimit(feature);
  const percentage = getUsagePercentage(feature, currentUsage);
  const canUse = canUseFeature(feature, currentUsage);
  
  const isUnlimited = limit === -1;
  const isNearLimit = percentage >= 80 && !isUnlimited;
  const isAtLimit = percentage >= 100 && !isUnlimited;

  const getStatusColor = () => {
    if (isUnlimited) return 'text-purple-600';
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isUnlimited) return Crown;
    if (isAtLimit || isNearLimit) return AlertTriangle;
    return CheckCircle;
  };

  const getProgressColor = () => {
    if (isUnlimited) return 'bg-purple-500';
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
        </div>
        {description && (
          <p className="text-xs text-slate-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {isUnlimited ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Uso atual:</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Crown className="w-3 h-3 mr-1" />
                Ilimitado
              </Badge>
            </div>
          ) : (
            <>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  // @ts-ignore
                  '--progress-background': getProgressColor()
                }}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {currentUsage}{unit} de {limit}{unit}
                </span>
                <span className={`font-medium ${getStatusColor()}`}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </>
          )}
          
          {isAtLimit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2">
              <p className="text-xs text-red-700">
                Limite atingido! Faça upgrade para continuar usando este recurso.
              </p>
            </div>
          )}
          
          {isNearLimit && !isAtLimit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
              <p className="text-xs text-yellow-700">
                Você está próximo do limite. Considere fazer upgrade.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageMeter;
