import "server-only";
import webpush from "web-push";
import { criarClienteSupabase } from "@/lib/supabase/server";

function configurarWebPush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error(
      "Faltam configurar as variáveis VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY."
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export interface DadosInscricao {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Guarda (ou atualiza, se o mesmo aparelho já tinha subscrito antes)
 * a subscrição de notificações deste aparelho. */
export async function guardarInscricao(dados: DadosInscricao): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase.from("push_subscriptions").upsert(dados, { onConflict: "endpoint" });
  if (error) throw error;
}

export async function apagarInscricao(endpoint: string): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw error;
}

export async function obterInscricao(endpoint: string): Promise<DadosInscricao | null> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("endpoint", endpoint)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface PayloadPush {
  titulo: string;
  corpo: string;
  url: string;
}

/** Manda a notificação a um aparelho específico — usado no "Testar agora". */
export async function enviarPushParaEndpoint(endpoint: string, payload: PayloadPush): Promise<void> {
  configurarWebPush();
  const inscricao = await obterInscricao(endpoint);
  if (!inscricao) throw new Error("Este aparelho ainda não tem os lembretes ativados.");

  await webpush.sendNotification(
    { endpoint: inscricao.endpoint, keys: { p256dh: inscricao.p256dh, auth: inscricao.auth } },
    JSON.stringify(payload)
  );
}

/** Manda a notificação a todos os aparelhos que já ativaram os
 * lembretes — usado pelo lembrete automático da véspera. Subscrições
 * que já não são válidas (ex.: app desinstalada) são limpas sozinhas. */
export async function enviarPushParaTodos(payload: PayloadPush): Promise<{ enviados: number }> {
  configurarWebPush();
  const supabase = criarClienteSupabase();
  const { data: inscricoes, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (error) throw error;

  let enviados = 0;
  await Promise.all(
    (inscricoes ?? []).map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          { endpoint: inscricao.endpoint, keys: { p256dh: inscricao.p256dh, auth: inscricao.auth } },
          JSON.stringify(payload)
        );
        enviados += 1;
      } catch (erro: unknown) {
        const estado = (erro as { statusCode?: number }).statusCode;
        if (estado === 404 || estado === 410) {
          await apagarInscricao(inscricao.endpoint);
        }
      }
    })
  );

  return { enviados };
}
