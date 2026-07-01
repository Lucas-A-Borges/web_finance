/**
 * Filtro de Privacidade Client-Side
 * Remove dados sensíveis de strings/tabelas antes do envio para a LLM
 */
export function aplicarFiltroPrivacidade(textoBruto: string): string {
  let textoLimpo = textoBruto;

  // 1. Remover CPF e CNPJ (Formatados ou números limpos)
  // Padrão CPF: 000.000.000-00 ou 00000000000
  textoLimpo = textoLimpo.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_OMITIDO]');
  // Padrão CNPJ: 00.000.000/0001-00
  textoLimpo = textoLimpo.replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[CNPJ_OMITIDO]');

  // 2. Remover Número de Cartão de Crédito
  // Procura por sequências de 13 a 16 dígitos separados por espaços, traços ou juntos
  textoLimpo = textoLimpo.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARTAO_OMITIDO]');

  // 3. Remover Dados Bancários (Agência e Conta)
  // Pega variações como "Ag: 1234", "Agência 4321-0", "C/C 12345-6", "Conta: 12345"
  textoLimpo = textoLimpo.replace(/(?:agência|agência:|ag|ag:)\s*\d+[-]*\d*[a-zA-Z]?/gi, '[AGENCIA_OMITIDA]');
  textoLimpo = textoLimpo.replace(/(?:conta|conta:|c\/c|cc|c\.c\.)\s*\d+[-]*\d*[a-zA-Z]?/gi, '[CONTA_OMITIDA]');

  // 4. Remover Nomes Próprios e Termos de Titularidade Comuns
  // Extratos costumam ter "Titular: Fulano de Tal" ou "Nome: Ciclano"
  textoLimpo = textoLimpo.replace(/(?:titular|nome|cliente|usuário)[\s:]+[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,30}(?=\r|\n|$)/gi, '$1: [NOME_OMITIDO]');

  // 5. Linhas óbvias de identificação ou cabeçalhos de bancos específicos
  // Exemplo: "Banco Itaú S.A.", "Banco Bradesco", "Nu Pagamentos"
  const bancosComuns = /(banco\s+[a-zA-Z]+|itau|bradesco|santander|nubank|inter|caixa\s+economica|banco\s+do\s+brasil)/gi;
  textoLimpo = textoLimpo.replace(bancosComuns, '[INSTITUICAO_FINANCEIRA]');

  return textoLimpo;
}