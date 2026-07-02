import { supabase } from './supabaseClient';
import type { TransacaoEstruturada } from './iaService';

export async function salvarTransacoesNoSupabase(transacoes: TransacaoEstruturada[]): Promise<{ success: boolean; error: any }> {
  try {
    // Busca o usuário logado no momento
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Usuário não autenticado no Supabase.');
    }

    // Mapeia o retorno da IA para os campos exatos da tabela 'financas'
    const transacoesParaInserir = transacoes.map(t => ({
      user_id: user.id, // Amarra a transação ao seu usuário via RLS
      data: t.data,
      descricao: t.descricao,
      valor: t.valor,
      tipo: t.tipo,
      categoria: t.categoria_sugerida,
      dados_adicionais: {} // Campo JSONB livre para futuras expansões
    }));

    // Realiza o insert em lote (bulk insert) no banco
    const { error } = await supabase
      .from('financas')
      .insert(transacoesParaInserir);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao salvar transações:', error.message);
    return { success: false, error: error.message };
  }
}