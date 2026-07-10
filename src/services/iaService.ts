export type TransacaoEstruturada = {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria_sugerida: string;
};

export async function interpretarExtratoComIA(textoAnonimizado: string, apiKey: string): Promise<TransacaoEstruturada[]> {
  if (!apiKey) throw new Error("API Key do Groq não fornecida.");

  const prompt = `És um assistente financeiro especialista. Analisa o extrato abaixo e retorna APENAS um array JSON puro (sem markdown, sem introduções) contendo as transações.
  
  Regras para o JSON:
  1. data: no formato AAAA-MM-DD (ano-mês-dia)..
  2. descricao: o nome do estabelecimento ou origem.
  3. valor: apenas o número positivo (ex: 150.00).
  4. tipo: obrigatoriamente "receita" ou "despesa".
  5. categoria_sugerida: ex (Moradia, Alimentação, Transporte, Salário, etc).
  
  Extrato:
  ${textoAnonimizado}`;

  // Ligação DIRETA à API ultrarrápida do Groq
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Modelo poderoso e rápido da Meta
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.1, // Define uma criatividade baixa para focar na precisão dos dados
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erro desconhecido na API do Groq.");
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Limpeza de segurança extra para garantir que só lemos o JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Erro completo da IA (Groq):", error);
    throw new Error(`Falha na IA: ${error.message}`);
  }
}