
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqbghewwaqpksnryocka.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYmdoZXd3YXFwa3NucnlvY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDcwNzYsImV4cCI6MjA4MDE4MzA3Nn0.mi7SGy4x-aUzDCQ7coHXHwKwh-f3xvG17seJ527_1YY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email: string, pass: string) => {
  return await supabase.auth.signInWithPassword({ email, password: pass });
};

export const signUp = async (email: string, pass: string) => {
  return await supabase.auth.signUp({ email, password: pass });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getTournaments = async () => {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data;
};

export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('elo_rapid', { ascending: false });
  if (error) throw error;
  return data;
};

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};
