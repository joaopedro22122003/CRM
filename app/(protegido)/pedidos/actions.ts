"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  criarPedido,
  atualizarEstadoPedido,
  associarViaturaAoPedido,
  obterPedidoComDetalhe,
} from "@/lib/data/pedidos";
import { criarServico } from "@/lib/data/servicos";
import { marcarFaturacaoPaga } from "@/lib/data/faturacao";
import type { EstadoPedido } from "@/lib/types";

export type EstadoFormulario = { erro?: string };

export async function criarPedidoAction(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const clienteId = String(formData.get("cliente_id") ?? "");
  const viaturaId = String(formData.get("viatura_id") ?? "") || null;
  const resumo = String(formData.get("resumo_problema") ?? "").trim() || null;

  if (!clienteId) return { erro: "Falta selecionar o cliente." };

  const pedido = await criarPedido({ cliente_id: clienteId, viatura_id: viaturaId, resumo_problema: resumo });

  revalidatePath("/pedidos");
  redirect(`/pedidos/${pedido.id}`);
}

export async function mudarEstadoAction(formData: FormData): Promise<void> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoPedido;
  if (!pedidoId || !estado) return;

  await atualizarEstadoPedido(pedidoId, estado);
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
}

export async function associarViaturaAction(formData: FormData): Promise<void> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const viaturaId = String(formData.get("viatura_id") ?? "");
  if (!pedidoId || !viaturaId) return;

  await associarViaturaAoPedido(pedidoId, viaturaId);
  revalidatePath(`/pedidos/${pedidoId}`);
}

/** Confirma o pagamento de um pedido a partir da lista — cria o serviço
 * se ainda não existir (atalho ao registo completo) ou só atualiza a
 * faturação já existente, com o valor e a forma de pagamento que o
 * cliente efetivamente usou. */
export async function marcarPedidoPagoAction(
  pedidoId: string,
  valor: number,
  metodoPagamento: string | null
): Promise<{ erro?: string }> {
  if (!pedidoId || !valor || valor <= 0) return { erro: "Indica um valor válido." };

  const detalhe = await obterPedidoComDetalhe(pedidoId);
  if (!detalhe) return { erro: "Pedido não encontrado." };
  if (!detalhe.viatura) return { erro: "Associa uma viatura a este pedido primeiro." };

  const servicoExistente = detalhe.servicos[0] ?? null;

  if (servicoExistente) {
    await marcarFaturacaoPaga(servicoExistente.id, valor, metodoPagamento);
  } else {
    const marcacaoRecente = detalhe.marcacoes[0] ?? null;
    await criarServico(
      {
        pedido_id: pedidoId,
        marcacao_id: marcacaoRecente?.id ?? null,
        viatura_id: detalhe.viatura.id,
        cliente_id: detalhe.cliente.id,
        data_conclusao: new Date().toISOString().slice(0, 10),
        preco_final: valor,
        custo_produtos: 0,
        tempo_execucao_min: null,
        tempo_deslocacao_min: 0,
        notas_incidentes: null,
      },
      { pago: true, metodoPagamento }
    );
  }

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/faturacao");
  revalidatePath("/servicos");
  revalidatePath("/marcacoes");
  revalidatePath("/para-contactar");

  return {};
}
