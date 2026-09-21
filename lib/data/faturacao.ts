import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, EstadoFaturacao, Faturacao, Servico } from "@/lib/types";
import { ROTULOS_PACOTE } from "@/lib/types";

export interface ResumoOrcamentoServico {
  pacote: string;
  temEstofos: boolean;
  extras: string[];
}

export interface FaturacaoResumo extends Faturacao {
  servico: Pick<Servico, "id" | "data_conclusao"> & {
    cliente: Pick<Cliente, "id" | "nome">;
  };
  orcamento: ResumoOrcamentoServico | null;
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
  const mapaOrcamentos = new Map<string, ResumoOrcamentoServico>();

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
        pacote: ROTULOS_PACOTE[o.pacote as keyof typeof ROTULOS_PACOTE] ?? o.pacote,
        temEstofos: o.tem_estofos,
        extras: (o.orcamento_extras ?? []).map((e: { descricao: string }) => e.descricao),
      });
    }
  }

  return registos.map((r) => ({ ...r, orcamento: mapaOrcamentos.get(r.servico.pedido_id) ?? null }));
}

export async function atualizarEstadoFaturacao(
  id: string,
  estado: EstadoFaturacao,
  metodoPagamento: string | null
): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("faturacao")
    .update({
      estado,
      metodo_pagamento: metodoPagamento,
      data_pagamento: estado === "pago" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id);
  if (error) throw error;
}
