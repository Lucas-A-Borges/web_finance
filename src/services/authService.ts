import { supabase } from './supabaseClient';

export async function cadastrarUsuario(email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

export async function logarUsuario(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

export async function deslogarUsuario() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}