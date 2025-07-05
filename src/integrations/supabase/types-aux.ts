import { Database } from './types';

// Tipos dos enums
export type ContractStatus = Database['public']['Enums']['contract_status'];

// Constantes dos enums
export const CONTRACT_STATUS = {
  DRAFT: 'draft' as ContractStatus,
  ACTIVE: 'active' as ContractStatus,
  COMPLETED: 'completed' as ContractStatus,
  CANCELLED: 'cancelled' as ContractStatus,
} as const;

// Tipos das tabelas principais
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type SubscriptionPlanInsert = Database['public']['Tables']['subscription_plans']['Insert'];
export type SubscriptionPlanUpdate = Database['public']['Tables']['subscription_plans']['Update'];

export type UserProfile = Database['public']['Tables']['profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];
export type UserSubscriptionInsert = Database['public']['Tables']['user_subscriptions']['Insert'];
export type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions']['Update'];

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type Contract = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

// Funções auxiliares para status de contratos
export const getContractStatusLabel = (status: ContractStatus): string => {
  switch (status) {
    case CONTRACT_STATUS.DRAFT:
      return 'Rascunho';
    case CONTRACT_STATUS.ACTIVE:
      return 'Ativo';
    case CONTRACT_STATUS.COMPLETED:
      return 'Concluído';
    case CONTRACT_STATUS.CANCELLED:
      return 'Cancelado';
    default:
      return 'Desconhecido';
  }
};

export const getContractStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case CONTRACT_STATUS.DRAFT:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case CONTRACT_STATUS.ACTIVE:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case CONTRACT_STATUS.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case CONTRACT_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

// Tipos para queries com joins
export type ContractWithClient = Contract & {
  clients: Pick<Client, 'name' | 'email' | 'phone'>;
};

export type ClientWithContracts = Client & {
  contracts: Pick<Contract, 'id' | 'title' | 'status' | 'total_value' | 'end_date'>[];
};

// Tipos para formulários
export interface ContractFormData {
  title: string;
  client_id: string;
  total_value: string;
  end_date: string;
  status: ContractStatus;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UserProfileFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface UserSettingsFormData {
  theme: string;
  notifications_enabled: boolean;
  language: string;
} 