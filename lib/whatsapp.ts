/** Gera um link wa.me a partir de um número em formato português. Nunca
 * altera o valor guardado — só converte no momento de construir o link. */
export function linkWhatsApp(telefone: string, mensagem?: string): string {
  let digitos = telefone.replace(/\D/g, "");
  // "00" é o prefixo internacional de marcação — o wa.me só quer o
  // indicativo do país a seguir, sem esse "00" à frente.
  if (digitos.startsWith("00")) digitos = digitos.slice(2);
  // Números portugueses têm 9 dígitos; se não vier já com indicativo, acrescenta 351.
  const comIndicativo = digitos.length === 9 ? `351${digitos}` : digitos;
  const query = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${comIndicativo}${query}`;
}
