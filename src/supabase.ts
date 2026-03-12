import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

// Use placeholders to prevent crash during initialization if keys are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  created_at: string;
};

export type Seed = {
  id: string;
  name: string;
  variety: string;
  quantity: number;
  unit: string;
  batch_number: string;
  expiry_date: string;
  created_at: string;
};

export type Fertilizer = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  batch_number: string;
  created_at: string;
};

export type VetChemical = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  created_at: string;
};

export type Pesticide = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  created_at: string;
};

export type Recipient = {
  id: string;
  rsbsa_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  address: string;
  contact_number: string;
  farm_location: string;
  farm_size: number;
  created_at: string;
};

export type Distribution = {
  id: string;
  recipient_id: string;
  item_type: 'seed' | 'fertilizer' | 'vet_chemical' | 'pesticide';
  item_id: string;
  quantity_given: number;
  date_distributed: string;
  distributed_by: string;
  created_at: string;
  recipient?: Recipient;
};
