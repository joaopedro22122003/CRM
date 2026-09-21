"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarServico, adicionarFotos } from "@/lib/data/servicos";
import { atualizarEstadoFaturacao } from "@/lib/data/faturacao";
import type { TipoFoto } from "@/lib/types";

export type EstadoFormulario = { erro?: string };

function ficheirosValidos(formData: FormData, campo: string): File[] {
  return formData
    .getAll(campo)
    .filter((v): v is File => v instanceof File && v.size > 0);
}

export async function criarServicoAction(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const marcacaoId = String(formData.get("marcacao_id") ?? "") || null;
  const viaturaId = String(formData.get("viatura_id") ?? "");
  const clienteId = String(formData.get("cliente_id") ?? "");
  const dataConclusao = String(formData.get("data_conclusao") ?? "");
  const precoFinal = Number(formData.get("preco_final"));
  const custoProdutos = Number(formData.get("custo_produtos") ?? 0);
  const tempoExecucao = formData.get("tempo_execucao_min") ? Number(formData.get("tempo_execucao_min")) : null;
  const tempoDeslocacao = Number(formData.get("tempo_deslocacao_min") ?? 0);
  const notasIncidentes = String(formData.get("notas_incidentes") ?? "").trim() || null;

  if (!pedidoId || !viaturaId || !clienteId) return { erro: "Faltam dados do pedido/viatura/cliente." };
  if (!dataConclusao) return { erro: "Indica a data de conclusão." };
  if (!Number.isFinite(precoFinal) || precoFinal <= 0) return { erro: "Indica o preço final cobrado." };

  const servico = await criarServico({
    pedido_id: pedidoId,
    marcacao_id: marcacaoId,
    viatura_id: viaturaId,
    cliente_id: clienteId,
    data_conclusao: dataConclusao,
    preco_final: precoFinal,
    custo_produtos: Number.isFinite(custoProdutos) ? custoProdutos : 0,
    tempo_execucao_min: tempoExecucao,
    tempo_deslocacao_min: Number.isFinite(tempoDeslocacao) ? tempoDeslocacao : 0,
    notas_incidentes: notasIncidentes,
  });

  const antes: { tipo: TipoFoto; file: File }[] = ficheirosValidos(formData, "fotos_antes").map((file) => ({
    tipo: "antes" as const,
    file,
  }));
  const depois: { tipo: TipoFoto; file: File }[] = ficheirosValidos(formData, "fotos_depois").map((file) => ({
    tipo: "depois" as const,
    file,
  }));

  await adicionarFotos(servico.id, [...antes, ...depois]);

  revalidatePath("/servicos");
  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/faturacao");
  redirect(`/servicos/${servico.id}`);
}

export async function mudarEstadoFaturacaoAction(formData: FormData): Promise<void> {
  const faturacaoId = String(formData.get("faturacao_id") ?? "");
  const estado = String(formData.get("estado") ?? "") as "pago" | "pendente";
  const metodoPagamento = String(formData.get("metodo_pagamento") ?? "").trim() || null;
  if (!faturacaoId || !estado) return;

  await atualizarEstadoFaturacao(faturacaoId, estado, metodoPagamento);
  revalidatePath("/faturacao");
}
