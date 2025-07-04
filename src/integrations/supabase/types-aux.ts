import { Database } from './types';

// Tipos dos enums
export type ClientOrigin = Database['public']['Enums']['client_origin'];
export type ContractStatus = Database['public']['Enums']['contract_status'];

// Constantes dos enums
export const CLIENT_ORIGIN = {
  MANUAL: 'manual' as ClientOrigin,
  FINANCEFLOW: 'financeflow' as ClientOrigin,
  IMPORT: 'import' as ClientOrigin,
} as const;

export const CONTRACT_STATUS = {
  PENDING: 'pending' as ContractStatus,
  ACTIVE: 'active' as ContractStatus,
  COMPLETED: 'completed' as ContractStatus,
  CANCELLED: 'cancelled' as ContractStatus,
  EXPIRED: 'expired' as ContractStatus,
} as const;

// Tipos das tabelas principais
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type SubscriptionPlanInsert = Database['public']['Tables']['subscription_plans']['Insert'];
export type SubscriptionPlanUpdate = Database['public']['Tables']['subscription_plans']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];
export type UserSubscriptionInsert = Database['public']['Tables']['user_subscriptions']['Insert'];
export type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions']['Update'];

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type ContractTemplate = Database['public']['Tables']['contract_templates']['Row'];
export type ContractTemplateInsert = Database['public']['Tables']['contract_templates']['Insert'];
export type ContractTemplateUpdate = Database['public']['Tables']['contract_templates']['Update'];

export type Contract = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export type ContractEvent = Database['public']['Tables']['contract_events']['Row'];
export type ContractEventInsert = Database['public']['Tables']['contract_events']['Insert'];
export type ContractEventUpdate = Database['public']['Tables']['contract_events']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

// Funções auxiliares para status de contratos
export const getContractStatusLabel = (status: ContractStatus): string => {
  switch (status) {
    case CONTRACT_STATUS.PENDING:
      return 'Pendente';
    case CONTRACT_STATUS.ACTIVE:
      return 'Ativo';
    case CONTRACT_STATUS.COMPLETED:
      return 'Concluído';
    case CONTRACT_STATUS.CANCELLED:
      return 'Cancelado';
    case CONTRACT_STATUS.EXPIRED:
      return 'Expirado';
    default:
      return 'Desconhecido';
  }
};

export const getContractStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case CONTRACT_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case CONTRACT_STATUS.ACTIVE:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case CONTRACT_STATUS.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case CONTRACT_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case CONTRACT_STATUS.EXPIRED:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

// Funções auxiliares para origem de clientes
export const getClientOriginLabel = (origin: ClientOrigin): string => {
  switch (origin) {
    case CLIENT_ORIGIN.MANUAL:
      return 'Manual';
    case CLIENT_ORIGIN.FINANCEFLOW:
      return 'FinanceFlow';
    case CLIENT_ORIGIN.IMPORT:
      return 'Importado';
    default:
      return 'Desconhecido';
  }
};

export const getClientOriginColor = (origin: ClientOrigin): string => {
  switch (origin) {
    case CLIENT_ORIGIN.MANUAL:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case CLIENT_ORIGIN.FINANCEFLOW:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case CLIENT_ORIGIN.IMPORT:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

// Tipos para queries com joins
export type ContractWithClient = Contract & {
  clients: Pick<Client, 'name' | 'email' | 'phone'>;
};

export type ContractWithClientAndTemplate = Contract & {
  clients: Pick<Client, 'name' | 'email' | 'phone'>;
  contract_templates: Pick<ContractTemplate, 'name'>;
};

export type ClientWithContracts = Client & {
  contracts: Pick<Contract, 'id' | 'title' | 'status' | 'total_value' | 'due_date'>[];
};

// Tipos para formulários
export interface ContractFormData {
  title: string;
  client_id: string;
  template_id?: string;
  content: string;
  total_value: string;
  due_date: string;
  status: ContractStatus;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  origin: ClientOrigin;
}

export interface UserProfileFormData {
  full_name: string;
  avatar_url?: string;
}

export interface UserSettingsFormData {
  theme: string;
  notifications_enabled: boolean;
  language: string;
} 