
import { Database } from '@/integrations/supabase/types';

// Define user roles as a strict union type
export type UserRole = 'admin' | 'user';

// Export database types
export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type BudgetItemRecord = Tables['budget_items']['Row'];
export type KomponenOutputRecord = Tables['komponen_output']['Row'];
export type SubKomponenRecord = Tables['sub_komponen']['Row'];
export type AkunRecord = Tables['akun']['Row'];
export type BudgetSummaryRecord = Views['budget_summary_by_account_group']['Row'] | 
                                 Views['budget_summary_by_komponen']['Row'] | 
                                 Views['budget_summary_by_akun']['Row'];
export type UserProfile = Tables['profiles']['Row'];

// Helper type to make specific fields optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Auth response type
export type AuthResponse = {
  user: any;
  session: any;
  weakPassword?: any;
} | {
  user: null;
  session: null;
  weakPassword?: null;
};
