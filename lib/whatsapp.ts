/** Gera um link wa.me a partir de um número em formato português. */
export function linkWhatsApp(telefone: string, mensagem?: string): string {
  const digitos = telefone.replace(/\D/g, "");
  // Números portugueses têm 9 dígitos; se não vier já com indicativo, acrescenta 351.
  const comIndicativo = digitos.length === 9 ? `351${digitos}` : digitos;
  const query = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${comIndicativo}${query}`;
}
