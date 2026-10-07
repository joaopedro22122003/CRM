"use server";

import { guardarInscricao, apagarInscricao, enviarPushParaEndpoint } from "@/lib/data/push";

export type EstadoAcaoLembretes = { erro?: string };

export async function guardarInscricaoAction(dados: {
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<EstadoAcaoLembretes> {
  if (!dados.endpoint || !dados.p256dh || !dados.auth) return { erro: "Dados da subscrição incompletos." };
  try {
    await guardarInscricao(dados);
    return {};
  } catch {
    return { erro: "Não foi possível guardar a subscrição. Tenta outra vez." };
  }
}

export async function apagarInscricaoAction(endpoint: string): Promise<void> {
  if (!endpoint) return;
  await apagarInscricao(endpoint);
}

export async function testarLembreteAction(endpoint: string): Promise<EstadoAcaoLembretes> {
  if (!endpoint) return { erro: "Este aparelho ainda não está inscrito." };
  try {
    await enviarPushParaEndpoint(endpoint, {
      titulo: "Garagem do Jota",
      corpo: "Notificação de teste — se vês isto, os lembretes estão a funcionar! 🎉",
      url: "/lembretes",
    });
    return {};
  } catch (erro) {
    return { erro: erro instanceof Error ? erro.message : "Não foi possível enviar a notificação de teste." };
  }
}
