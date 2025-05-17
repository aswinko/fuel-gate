export type UserRole = 'farmer' | 'supplier' | 'customer';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  pump_name?: string;
  address?: string;
  created_at?: string;
  bio?: string;
  status?: string;
  pen_no?: string;
} 