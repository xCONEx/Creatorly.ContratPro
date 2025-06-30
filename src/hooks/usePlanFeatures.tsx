
import { useSubscription } from './useSubscription';

interface PlanLimits {
  contracts: number; // -1 = unlimited
  templates: number; // -1 = unlimited
  apiCalls: number; // -1 = unlimited
  storage: number; // in MB, -1 = unlimited
  users: number; // -1 = unlimited
}

interface PlanFeatures {
  // Basic features
  basicTemplates: boolean;
  pdfExport: boolean;
  emailSupport: boolean;
  
  // Professional features
  premiumTemplates: boolean;
  electronicSignature: boolean;
  prioritySupport: boolean;
  basicApi: boolean;
  basicReports: boolean;
  emailNotifications: boolean;
  autoBackup: boolean;
  advancedClientManagement: boolean;
  customTemplates: boolean;
  
  // Enterprise features
  unlimitedContracts: boolean;
  fullApi: boolean;
  advancedReports: boolean;
  analytics: boolean;
  support24_7: boolean;
  adminPanel: boolean;
  advancedIntegrations: boolean;
  zapierIntegration: boolean;
  whiteLabel: boolean;
  fullBackup: boolean;
  multiUser: boolean;
  advancedSignature: boolean;
  automations: boolean;
  multiFormatExport: boolean;
  compliance: boolean;
  sso: boolean;
}

export const usePlanFeatures = () => {
  const { subscription } = useSubscription();

  const getPlanLimits = (): PlanLimits => {
    if (!subscription) {
      return {
        contracts: 0,
        templates: 0,
        apiCalls: 0,
        storage: 0,
        users: 1
      };
    }

    switch (subscription.plan.name) {
      case 'Gratuito':
        return {
          contracts: 10,
          templates: 3,
          apiCalls: 0,
          storage: 100, // 100MB
          users: 1
        };
      case 'Profissional':
        return {
          contracts: 100,
          templates: -1, // unlimited
          apiCalls: 1000,
          storage: 1000, // 1GB
          users: 3
        };
      case 'Empresarial':
        return {
          contracts: -1, // unlimited
          templates: -1, // unlimited
          apiCalls: -1, // unlimited
          storage: -1, // unlimited
          users: -1 // unlimited
        };
      default:
        return {
          contracts: 0,
          templates: 0,
          apiCalls: 0,
          storage: 0,
          users: 1
        };
    }
  };

  const getPlanFeatures = (): PlanFeatures => {
    if (!subscription) {
      return {
        basicTemplates: false,
        pdfExport: false,
        emailSupport: false,
        premiumTemplates: false,
        electronicSignature: false,
        prioritySupport: false,
        basicApi: false,
        basicReports: false,
        emailNotifications: false,
        autoBackup: false,
        advancedClientManagement: false,
        customTemplates: false,
        unlimitedContracts: false,
        fullApi: false,
        advancedReports: false,
        analytics: false,
        support24_7: false,
        adminPanel: false,
        advancedIntegrations: false,
        zapierIntegration: false,
        whiteLabel: false,
        fullBackup: false,
        multiUser: false,
        advancedSignature: false,
        automations: false,
        multiFormatExport: false,
        compliance: false,
        sso: false
      };
    }

    const planName = subscription.plan.name;
    
    return {
      // Gratuito features
      basicTemplates: true,
      pdfExport: true,
      emailSupport: true,
      
      // Profissional features
      premiumTemplates: planName === 'Profissional' || planName === 'Empresarial',
      electronicSignature: planName === 'Profissional' || planName === 'Empresarial',
      prioritySupport: planName === 'Profissional' || planName === 'Empresarial',
      basicApi: planName === 'Profissional' || planName === 'Empresarial',
      basicReports: planName === 'Profissional' || planName === 'Empresarial',
      emailNotifications: planName === 'Profissional' || planName === 'Empresarial',
      autoBackup: planName === 'Profissional' || planName === 'Empresarial',
      advancedClientManagement: planName === 'Profissional' || planName === 'Empresarial',
      customTemplates: planName === 'Profissional' || planName === 'Empresarial',
      
      // Empresarial features
      unlimitedContracts: planName === 'Empresarial',
      fullApi: planName === 'Empresarial',
      advancedReports: planName === 'Empresarial',
      analytics: planName === 'Empresarial',
      support24_7: planName === 'Empresarial',
      adminPanel: planName === 'Empresarial',
      advancedIntegrations: planName === 'Empresarial',
      zapierIntegration: planName === 'Empresarial',
      whiteLabel: planName === 'Empresarial',
      fullBackup: planName === 'Empresarial',
      multiUser: planName === 'Empresarial',
      advancedSignature: planName === 'Empresarial',
      automations: planName === 'Empresarial',
      multiFormatExport: planName === 'Empresarial',
      compliance: planName === 'Empresarial',
      sso: planName === 'Empresarial'
    };
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    const features = getPlanFeatures();
    return features[feature];
  };

  const canUseFeature = (feature: 'contracts' | 'templates' | 'api' | 'storage' | 'users', currentUsage: number): boolean => {
    const limits = getPlanLimits();
    const limit = limits[feature];
    
    if (limit === -1) return true; // unlimited
    return currentUsage < limit;
  };

  const getFeatureLimit = (feature: 'contracts' | 'templates' | 'api' | 'storage' | 'users'): number => {
    const limits = getPlanLimits();
    return limits[feature];
  };

  const getUsagePercentage = (feature: 'contracts' | 'templates' | 'api' | 'storage' | 'users', currentUsage: number): number => {
    const limit = getFeatureLimit(feature);
    if (limit === -1) return 0; // unlimited
    return Math.min((currentUsage / limit) * 100, 100);
  };

  return {
    subscription,
    getPlanLimits,
    getPlanFeatures,
    hasFeature,
    canUseFeature,
    getFeatureLimit,
    getUsagePercentage
  };
};
