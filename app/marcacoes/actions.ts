"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarMarcacao, atualizarEstadoMarcacao } from "@/lib/data/marcacoes";
import type { EstadoMarcacao, TipoMarcacao } from "@/lib/types";

export type EstadoFormulario = { erro?: string };

export async function criarMarcacaoAction(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const data = String(formData.get("data") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const duracao = Number(formData.get("duracao_estimada_min") ?? 90);
  const tipo = String(formData.get("tipo") ?? "cliente_traz") as TipoMarcacao;
  const zona = String(formData.get("zona") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;

  if (!pedidoId) return { erro: "Falta o pedido associado." };
  if (!data || !hora) return { erro: "Indica a data e a hora." };
  if (tipo === "recolha_entrega" && !zona) return { erro: "Indica a zona para a recolha/entrega." };

  const dataHora = new Date(`${data}T${hora}`);
  if (Number.isNaN(dataHora.getTime())) return { erro: "Data ou hora inválida." };

  const marcacao = await criarMarcacao({
    pedido_id: pedidoId,
    data_hora: dataHora.toISOString(),
    duracao_estimada_min: duracao,
    tipo,
    zona,
    notas,
  });

  revalidatePath("/marcacoes");
  revalidatePath(`/pedidos/${pedidoId}`);
  redirect(`/marcacoes/${marcacao.id}`);
}

export async function mudarEstadoMarcacaoAction(formData: FormData): Promise<void> {
  const marcacaoId = String(formData.get("marcacao_id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoMarcacao;
  if (!marcacaoId || !estado) return;

  await atualizarEstadoMarcacao(marcacaoId, estado);
  revalidatePath("/marcacoes");
  revalidatePath(`/marcacoes/${marcacaoId}`);
}
