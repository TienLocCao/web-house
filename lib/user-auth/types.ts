export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface UserSession {
  id: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
}