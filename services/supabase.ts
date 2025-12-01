
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec les clés fournies
const supabaseUrl = 'https://kqbghewwaqpksnryocka.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYmdoZXd3YXFwa3NucnlvY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDcwNzYsImV4cCI6MjA4MDE4MzA3Nn0.mi7SGy4x-aUzDCQ7coHXHwKwh-f3xvG17seJ527_1YY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth Helpers
export const signIn = async (email: string, pass: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  return { data, error };
};

export const signUp = async (email: string, pass: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
