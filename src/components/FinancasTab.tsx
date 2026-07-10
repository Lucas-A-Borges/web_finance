import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export default function FinancasTab({ mostrarValores }: { mostrarValores: boolean }) {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarTransacoes();
  }, []);

  async function buscarTransacoes() {
    setCarregando(true);
    // Busca os dados lá no seu Supabase
    const { data, error } = await supabase
      .from('financas')
      .select('*')
      .order('data', { ascending: false });

    if (!error && data) {
      setTransacoes(data);
    }
    setCarregando(false);
  }

  // A matemática financeira sendo feita no seu navegador
  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const saldo = receitas - despesas;

  // Função que respeita o botão de "olho" aberto/fechado
  const formatarMoeda = (valor: number) => {
    if (!mostrarValores) return 'R$ •••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataString: string) => {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. CARTÕES DE RESUMO (DASHBOARD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Saldo Atual</h3>
          <p className={`text-3xl font-bold mt-2 ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Receitas (Total)</h3>
          <p className="text-3xl font-bold mt-2 text-green-500">{formatarMoeda(receitas)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Despesas (Total)</h3>
          <p className="text-3xl font-bold mt-2 text-red-500">{formatarMoeda(despesas)}</p>
        </div>
      </div>

      {/* 2. TABELA DE HISTÓRICO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Histórico de Transações</h3>
          <button onClick={buscarTransacoes} className="text-sm text-blue-600 hover:underline">Atualizar</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Buscando dados no Supabase...</td></tr>
              ) : transacoes.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhuma transação encontrada.</td></tr>
              ) : (
                transacoes.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500">{formatarData(t.data)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{t.descricao}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">
                        {t.categoria}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatarMoeda(t.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}