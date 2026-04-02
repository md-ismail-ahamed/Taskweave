import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'manager' | 'team_member';
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  skills: string;
  hours: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};
