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
}