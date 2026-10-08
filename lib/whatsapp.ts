/** Normaliza um número de telefone para comparação (sempre com
 * indicativo, sem "00" nem espaços/traços) — usado para encontrar um
 * cliente já existente pelo telemóvel, mesmo que escrito de forma
 * diferente (9 dígitos, 351..., 00351...). Nunca altera o valor
 * guardado — só serve para comparar. */
export function normalizarTelefone(telefone: string): string {
  let digitos = telefone.replace(/\D/g, "");
  // "00" é o prefixo internacional de marcação — descarta-se para a comparação.
  if (digitos.startsWith("00")) digitos = digitos.slice(2);
  // Números portugueses têm 9 dígitos; se não vier já com indicativo, acrescenta 351.
  return digitos.length === 9 ? `351${digitos}` : digitos;
}

/** Gera um link wa.me a partir de um número em formato português. Nunca
 * altera o valor guardado — só converte no momento de construir o link. */
export function linkWhatsApp(telefone: string, mensagem?: string): string {
  const comIndicativo = normalizarTelefone(telefone);
  const query = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${comIndicativo}${query}`;
}
