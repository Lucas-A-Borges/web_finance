import { GoogleGenerativeAI } from "@google/generative-ai";

export type TransacaoEstruturada = {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria_sugerida: string;
};

export async function interpretarExtratoComIA(textoAnonimizado: string, apiKey: string): Promise<TransacaoEstruturada[]> {
  if (!apiKey) throw new Error("API Key do Gemini não fornecida.");

  const ai = new GoogleGenerativeAI(apiKey);
  
  const modelo = ai.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  // Prompt ajustado: Português BR + Regras de Segurança de Segunda Camada
  const systemPrompt = `
    Você é um especialista em processamento de dados financeiros e um parser de extratos.
    Sua missão é ler textos brutos e estruturar transações financeiras.

    ⚠️ REGRAS DE SEGURANÇA (CAMADA 2):
    1. PRIVACIDADE: O texto enviado já passou por uma anonimização local. Se, por falha, você identificar qualquer dado sensível (CPF, CNPJ, número de conta, agência, nomes próprios ou números de cartão), você DEVE ignorar essa informação e nunca incluí-la na resposta JSON.
    2. PRIVILÉGIO MÍNIMO: Extraia apenas informações de transações (data, descrição, valor). Não tente inferir dados do titular ou informações bancárias.

    REGRAS DE PROCESSAMENTO:
    1. Ignore cabeçalhos, propagandas, termos contratuais e saldos acumulados.
    2. Se o ano não estiver explícito na linha, deduza o ano atual (${new Date().getFullYear()}).
    3. O campo "valor" deve ser sempre um número real estritamente positivo.
    4. Classifique a transação como 'receita' ou 'despesa'.

    Retorne OBRIGATORIAMENTE um array JSON no seguinte formato:
    [
      {
        "data": "AAAA-MM-DD",
        "descricao": "Texto limpo da transação",
        "valor": 0.00,
        "tipo": "receita" ou "despesa",
        "categoria_sugerida": "Categoria curta (ex: Alimentação, Transporte, Salário)"
      }
    ]
  `;

  const resultado = await modelo.generateContent({
    contents: [
      { 
        role: 'user', 
        parts: [{ text: `${systemPrompt}\n\nTexto do Extrato Anonimizado:\n${textoAnonimizado}` }] 
      }
    ]
  });

  const respostaTexto = resultado.response.text();
  return JSON.parse(respostaTexto) as TransacaoEstruturada[];
}