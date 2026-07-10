import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import {Auth} from './components/Auth';
import FinancasTab from './components/FinancasTab';
import { Eye, EyeOff, LayoutDashboard, Wallet, TrendingUp, LogOut } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [abaAtiva, setAbaAtiva] = useState('financas');
  const [mostrarValores, setMostrarValores] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
      
      {/* CABEÇALHO */}
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-black text-blue-700 tracking-tight">
          Patrimônio<span className="text-gray-800">.IA</span>
        </h1>
        
        <div className="flex items-center gap-6">
          {/* Botão de Ocultar Valores */}
          <button 
            onClick={() => setMostrarValores(!mostrarValores)}
            className="text-gray-400 hover:text-blue-600 transition flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
          >
            {mostrarValores ? <Eye size={20} /> : <EyeOff size={20} />}
            <span className="text-sm font-medium hidden sm:block">
              {mostrarValores ? "Ocultar" : "Mostrar"}
            </span>
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      {/* NAVEGAÇÃO DE ABAS */}
      <nav className="flex justify-center bg-white border-b border-gray-200 shadow-sm mb-8">
        <button onClick={() => setAbaAtiva('inicial')} className={`flex items-center gap-2 px-8 py-4 font-semibold transition ${abaAtiva === 'inicial' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-blue-500'}`}>
          <LayoutDashboard size={20} /> Resumo
        </button>
        <button onClick={() => setAbaAtiva('financas')} className={`flex items-center gap-2 px-8 py-4 font-semibold transition ${abaAtiva === 'financas' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-blue-500'}`}>
          <Wallet size={20} /> Finanças
        </button>
        <button onClick={() => setAbaAtiva('investimentos')} className={`flex items-center gap-2 px-8 py-4 font-semibold transition ${abaAtiva === 'investimentos' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-blue-500'}`}>
          <TrendingUp size={20} /> Investimentos
        </button>
      </nav>

      {/* ÁREA DE CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-6">
        {abaAtiva === 'inicial' && (
          <div className="text-center py-20 text-gray-500">
            <h2 className="text-2xl font-bold mb-2">Visão Geral (Em breve)</h2>
            <p>Aqui ficarão os gráficos de Metas vs Realidade.</p>
          </div>
        )}
        
        {abaAtiva === 'financas' && (
          <FinancasTab mostrarValores={mostrarValores} />
        )}
        
        {abaAtiva === 'investimentos' && (
          <div className="text-center py-20 text-gray-500">
            <h2 className="text-2xl font-bold mb-2">Investimentos e Sonhos (Em breve)</h2>
            <p>Aqui ficará a tabela de ativos (Renda Fixa, FIIs, etc) e os objetivos.</p>
          </div>
        )}
      </main>
    </div>
  );
}
/*
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { deslogarUsuario } from './services/authService';
import { Auth } from './components/Auth';
import { salvarTransacoesNoSupabase } from './services/financasService';
import { aplicarFiltroPrivacidade } from './utils/privacidade';
import { interpretarExtratoComIA, type TransacaoEstruturada } from './services/iaService';

export default function App() {
  // Estados de Autenticação
  const [sessao, setSessao] = useState<any>(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  // Estados do Processamento
  const [textoBruto, setTextoBruto] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  
  // Estados Visuais
  const [textoFiltrado, setTextoFiltrado] = useState<string | null>(null);
  const [resultadoJSON, setResultadoJSON] = useState<TransacaoEstruturada[] | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      setCarregandoAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const processarESalvarDados = async () => {
    setErro(null);
    setMensagemSucesso(null);
    setTextoFiltrado(null);
    setResultadoJSON(null);

    if (!apiKey) {
      setErro('Por favor, insira sua API Key do Gemini.');
      return;
    }
    if (!textoBruto.trim()) {
      setErro('Por favor, cole os dados do extrato antes de processar.');
      return;
    }

    setCarregando(true);

    try {
      // 1. Filtro Local
      const textoSeguro = aplicarFiltroPrivacidade(textoBruto);
      setTextoFiltrado(textoSeguro);

      // 2. Processamento IA
      const dadosEstruturados = await interpretarExtratoComIA(textoSeguro, apiKey);
      setResultadoJSON(dadosEstruturados);

      // 3. Salvamento no Supabase
      const { success, error } = await salvarTransacoesNoSupabase(dadosEstruturados);
      
      if (!success) {
        throw new Error(error);
      }

      setMensagemSucesso('Transações processadas e salvas com sucesso no banco de dados!');

    } catch (err: any) {
      console.error(err);
      setErro(err.message || 'Ocorreu um erro durante o processamento.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoAuth) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando sistema...</div>;
  }

  if (!sessao) {
    return (
      <div style={{ fontFamily: 'sans-serif' }}>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>💸 Sistema Financeiro</h1>
        <Auth />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ margin: 0 }}>💸 Painel Financeiro</h1>
          <small style={{ color: '#666' }}>Logado como: {sessao.user.email}</small>
        </div>
        <button 
          onClick={deslogarUsuario}
          style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sair
        </button>
      </header>

      <p style={{ color: '#555' }}>
        Cole seu extrato abaixo. Os dados pessoais serão removidos <strong>localmente</strong> antes de serem processados pela IA e salvos na sua conta.
      </p>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>API Key do Gemini:</label>
        <input 
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          placeholder="Cole sua chave do Google AI Studio aqui..."
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Texto Bruto do Extrato:</label>
        <textarea 
          rows={8} 
          value={textoBruto} 
          onChange={(e) => setTextoBruto(e.target.value)}
          placeholder="Ex: 12/05 COMPRA SUPERMERCADO - R$ 150,00&#10;CPF: 123.456.789-00 C/C: 12345-6"
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
      </div>

      <button 
        onClick={processarESalvarDados} 
        disabled={carregando}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: carregando ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: carregando ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        {carregando ? 'Processando e salvando...' : 'Processar e Salvar Extrato'}
      </button>

      {erro && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {mensagemSucesso && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px' }}>
          <strong>Sucesso:</strong> {mensagemSucesso}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        {textoFiltrado && (
          <div style={{ flex: '1 1 300px', backgroundColor: '#f1f8e9', padding: '15px', borderRadius: '4px', border: '1px solid #c5e1a5' }}>
            <h3 style={{ marginTop: 0, color: '#33691e', fontSize: '16px' }}>1. Texto Seguro (IA)</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#555' }}>
              {textoFiltrado}
            </pre>
          </div>
        )}

        {resultadoJSON && (
          <div style={{ flex: '1 1 300px', backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px', border: '1px solid #90caf9' }}>
            <h3 style={{ marginTop: 0, color: '#0d47a1', fontSize: '16px' }}>2. Salvo no Supabase (JSON)</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#333', overflowX: 'auto' }}>
              {JSON.stringify(resultadoJSON, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}*/