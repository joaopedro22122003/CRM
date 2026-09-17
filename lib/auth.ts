// Autenticação simples por palavra-passe única (sem contas de
// utilizador). Compatível com o runtime Edge do middleware, por isso
// usa apenas Web Crypto (crypto.subtle), disponível em ambos os lados.

export const COOKIE_NAME = "gj_sessao";

async function sha256Hex(texto: string): Promise<string> {
  const dados = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function tokenParaPassword(password: string): Promise<string> {
  return sha256Hex(`gj:${password}`);
}

/** Token esperado no cookie de sessão, ou null se a app ainda não tem
 * a palavra-passe configurada em APP_PASSWORD. */
export async function tokenSessaoEsperado(): Promise<string | null> {
  const password = process.env.APP_PASSWORD;
  if (!password) return null;
  return tokenParaPassword(password);
}
