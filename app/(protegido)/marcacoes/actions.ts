"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarMarcacao, atualizarEstadoMarcacao, obterMarcacaoComDetalhe } from "@/lib/data/marcacoes";
import { obterPedidoComDetalhe } from "@/lib/data/pedidos";
import { criarServico, desfazerServicoDaMarcacao } from "@/lib/data/servicos";
import type { TipoMarcacao } from "@/lib/types";

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

export type EstadoAcaoMarcacao = { erro?: string };

function revalidarTudo(marcacaoId: string, pedidoId: string) {
  revalidatePath("/marcacoes");
  revalidatePath(`/marcacoes/${marcacaoId}`);
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/faturacao");
  revalidatePath("/servicos");
  revalidatePath("/para-contactar");
}

/** Um só toque: marca a marcação como concluída e regista a data de hoje
 * como data do serviço (reaproveitando criarServico, a mesma função usada
 * por "Registar serviço" e pelo botão "Pago" — nunca duplica a escrita
 * da data). Sem orçamento, o valor fica "por confirmar". */
export async function marcarServicoFeitoAction(marcacaoId: string): Promise<EstadoAcaoMarcacao> {
  const detalheMarcacao = await obterMarcacaoComDetalhe(marcacaoId);
  if (!detalheMarcacao) return { erro: "Marcação não encontrada." };
  const { pedido, cliente, viatura } = detalheMarcacao;
  if (!viatura) return { erro: "Este pedido não tem viatura associada." };

  const detalhePedido = await obterPedidoComDetalhe(pedido.id);
  const servicoDestaMarcacao = detalhePedido?.servicos.find((s) => s.marcacao_id === marcacaoId) ?? null;

  if (servicoDestaMarcacao) {
    await atualizarEstadoMarcacao(marcacaoId, "concluido");
  } else {
    const ultimoOrcamento = detalhePedido?.orcamentos[0] ?? null;
    await criarServico(
      {
        pedido_id: pedido.id,
        marcacao_id: marcacaoId,
        viatura_id: viatura.id,
        cliente_id: cliente.id,
        data_conclusao: new Date().toISOString().slice(0, 10),
        preco_final: ultimoOrcamento ? Number(ultimoOrcamento.preco_entrada) : 0,
        custo_produtos: 0,
        tempo_execucao_min: null,
        tempo_deslocacao_min: 0,
        notas_incidentes: null,
      },
      { valorPorConfirmar: !ultimoOrcamento }
    );
  }

  revalidarTudo(marcacaoId, pedido.id);
  return {};
}

export async function cancelarMarcacaoAction(marcacaoId: string): Promise<EstadoAcaoMarcacao> {
  const detalhe = await obterMarcacaoComDetalhe(marcacaoId);
  if (!detalhe) return { erro: "Marcação não encontrada." };

  const resultado = await desfazerServicoDaMarcacao(marcacaoId);
  if (resultado === "bloqueado_pago") {
    return {
      erro:
        "Este serviço já tem um pagamento confirmado — reverte o pagamento em Faturação antes de cancelar esta marcação.",
    };
  }

  await atualizarEstadoMarcacao(marcacaoId, "cancelado");
  revalidarTudo(marcacaoId, detalhe.pedido.id);
  return {};
}

export async function reverterParaAgendadoAction(marcacaoId: string): Promise<EstadoAcaoMarcacao> {
  const detalhe = await obterMarcacaoComDetalhe(marcacaoId);
  if (!detalhe) return { erro: "Marcação não encontrada." };

  const resultado = await desfazerServicoDaMarcacao(marcacaoId);
  if (resultado === "bloqueado_pago") {
    return {
      erro:
        "Este serviço já tem um pagamento confirmado — reverte o pagamento em Faturação antes de reverter esta marcação.",
    };
  }

  await atualizarEstadoMarcacao(marcacaoId, "agendado");
  revalidarTudo(marcacaoId, detalhe.pedido.id);
  return {};
}
