import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, EstadoFaturacao, Faturacao, Pacote, Servico } from "@/lib/types";
import { ROTULOS_PACOTE } from "@/lib/types";
import type { ResumoOrcamento } from "@/lib/data/orcamentos";

export interface FaturacaoResumo extends Faturacao {
  servico: Pick<Servico, "id" | "data_conclusao"> & {
    cliente: Pick<Cliente, "id" | "nome">;
  };
  orcamento: ResumoOrcamento | null;
}

/** Estado do pagamento do serviço ligado a esta marcação, se existir —
 * usado para esconder ações de pagamento já tratadas (ex.: o atalho
 * "marcar como pago" no ecrã da marcação). */
export async function obterEstadoPagamentoDaMarcacao(marcacaoId: string): Promise<EstadoFaturacao | null> {
  const supabase = criarClienteSupabase();

  const { data: servico, error: erroServico } = await supabase
    .from("servicos")
    .select("id")
    .eq("marcacao_id", marcacaoId)
    .maybeSingle();
  if (erroServico) throw erroServico;
  if (!servico) return null;

  const { data: faturacao, error } = await supabase
    .from("faturacao")
    .select("estado")
    .eq("servico_id", servico.id)
    .maybeSingle();
  if (error) throw error;
  return (faturacao?.estado as EstadoFaturacao) ?? null;
}

export async function listarFaturacao(): Promise<FaturacaoResumo[]> {
  const supabase = criarClienteSupabase();

  const { data: faturacao, error } = await supabase
    .from("faturacao")
    .select("*, servico:servicos(id, data_conclusao, pedido_id, cliente:clientes(id, nome))")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const registos = (faturacao ?? []) as unknown as (FaturacaoResumo & { servico: { pedido_id: string } })[];

  const pedidoIds = [...new Set(registos.map((r) => r.servico.pedido_id))];
  const mapaOrcamentos = new Map<string, ResumoOrcamento>();

  if (pedidoIds.length > 0) {
    const { data: orcamentos, error: erroOrc } = await supabase
      .from("orcamentos")
      .select("pedido_id, pacote, tem_estofos, created_at, orcamento_extras(descricao)")
      .in("pedido_id", pedidoIds)
      .order("created_at", { ascending: false });
    if (erroOrc) throw erroOrc;

    for (const o of orcamentos ?? []) {
      // Como vem ordenado do mais recente para o mais antigo, o
      // primeiro que encontramos para cada pedido é o orçamento atual.
      if (mapaOrcamentos.has(o.pedido_id)) continue;
      mapaOrcamentos.set(o.pedido_id, {
        pacote: ROTULOS_PACOTE[o.pacote as Pacote] ?? o.pacote,
        temEstofos: o.tem_estofos,
        extras: (o.orcamento_extras ?? []).map((e: { descricao: string }) => e.descricao),
      });
    }
  }

  return registos.map((r) => ({ ...r, orcamento: mapaOrcamentos.get(r.servico.pedido_id) ?? null }));
}

/** Confirma o pagamento de um serviço, com o valor e a forma de
 * pagamento que o cliente efetivamente usou (pode diferir do preço
 * orçamentado). */
export async function marcarFaturacaoPaga(
  servicoId: string,
  valor: number,
  metodoPagamento: string | null
): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("faturacao")
    .update({
      valor,
      estado: "pago",
      metodo_pagamento: metodoPagamento,
      data_pagamento: new Date().toISOString().slice(0, 10),
    })
    .eq("servico_id", servicoId);
  if (error) throw error;
}

/** Corrige só o estado (pago/pendente) de uma faturação já criada — a
 * forma de pagamento fica sempre a que foi escolhida no botão "Pago" em
 * Pedidos, não se mexe aqui. */
export async function atualizarEstadoFaturacao(id: string, estado: EstadoFaturacao): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("faturacao")
    .update({
      estado,
      data_pagamento: estado === "pago" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id);
  if (error) throw error;
}
