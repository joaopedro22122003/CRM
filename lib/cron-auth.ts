import "server-only";

/** Autoriza um pedido de cron — aceita o segredo tanto no cabeçalho
 * Authorization (usado pela Vercel) como num parâmetro ?segredo= na
 * URL (para testares manualmente a partir do telemóvel, onde não dá
 * para definir cabeçalhos). */
export function autorizarCron(request: Request): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;

  const autorizacao = request.headers.get("authorization");
  if (autorizacao === `Bearer ${segredo}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("segredo") === segredo;
}
