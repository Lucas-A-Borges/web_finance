import { useState } from 'react';
import { aplicarFiltroPrivacidade } from './utils/privacidade';
import { interpretarExtratoComIA, type TransacaoEstruturada } from './services/iaService';

export default function App() {
  const [textoBruto, setTextoBruto] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Estados para mostrar os resultados no ecrã
  const [textoFiltrado, setTextoFiltrado] = useState<string | null>(null);
  const [resultadoJSON, setResultadoJSON] = useState<TransacaoEstruturada[] | null>(null);

  const processarDados = async () => {
    setErro(null);
    setTextoFiltrado(null);
    setResultadoJSON(null);

    if (!apiKey) {
      setErro('Por favor, insere a tua API Key do Gemini.');
      return;
    }
    if (!textoBruto.trim()) {
      setErro('Por favor, cola os dados do extrato antes de processar.');
      return;
    }

    setCarregando(true);

    try {
      // 1. Passa pelo filtro LOCAL (nada vai para a internet ainda)
      const textoSeguro = aplicarFiltroPrivacidade(textoBruto);
      setTextoFiltrado(textoSeguro); // Mostra no ecrã para o utilizador ver que está seguro

      // 2. Envia apenas o texto limpo para a IA
      const dadosEstruturados = await interpretarExtratoComIA(textoSeguro, apiKey);
      setResultadoJSON(dadosEstruturados);

    } catch (err: any) {
      console.error(err);
      setErro(err.message || 'Ocorreu um erro ao processar com a IA.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>💸 App Finanças - Módulo de teste</h1>
      <p style={{ color: '#555' }}>
        Cola o teu extrato abaixo. Os teus dados pessoais serão removidos <strong>localmente</strong> antes de serem enviados para a IA.
      </p>

      {/* Input da API Key */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>API Key do Gemini:</label>
        <input 
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          placeholder="Cola a tua chave do Google AI Studio aqui..."
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {/* Input do Extrato */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Texto Bruto do Extrato:</label>
        <textarea 
          rows={8} 
          value={textoBruto} 
          onChange={(e) => setTextoBruto(e.target.value)}
          placeholder="Ex: 12/05 COMPRA SUPERMERCADO - R$ 150,00&#10;CPF: 123.456.789-00 C/C: 12345-6"
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {/* Botão de Ação */}
      <button 
        onClick={processarDados} 
        disabled={carregando}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: carregando ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: carregando ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {carregando ? 'A processar e a estruturar...' : 'Processar Extrato com IA'}
      </button>

      {/* Mensagem de Erro */}
      {erro && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {/* Resultados Visuais */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
        {/* Painel do Texto Anonimizado */}
        {textoFiltrado && (
          <div style={{ flex: 1, backgroundColor: '#f1f8e9', padding: '15px', borderRadius: '4px', border: '1px solid #c5e1a5' }}>
            <h3 style={{ marginTop: 0, color: '#33691e' }}>1. Texto Seguro (Enviado à IA)</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#555' }}>
              {textoFiltrado}
            </pre>
          </div>
        )}

        {/* Painel do JSON Final */}
        {resultadoJSON && (
          <div style={{ flex: 1, backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px', border: '1px solid #90caf9' }}>
            <h3 style={{ marginTop: 0, color: '#0d47a1' }}>2. Resultado Estruturado (JSON)</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#333', overflowX: 'auto' }}>
              {JSON.stringify(resultadoJSON, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}