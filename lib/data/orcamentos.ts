import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import { atualizarEstadoPedido } from "@/lib/data/pedidos";
import { ROTULOS_PACOTE, type EstofosMaterial, type Orcamento, type Pacote } from "@/lib/types";
import type { ExtraOrcamento, ResultadoPreco } from "@/lib/pricing";

export interface ResumoOrcamento {
  pacote: string;
  temEstofos: boolean;
  extras: string[];
}

/** Resumo do orçamento mais recente de um pedido — usado para mostrar
 * o que foi combinado (pacote, estofos, extras) junto do serviço e da
 * faturação. */
export async function obterUltimoOrcamentoDoPedido(pedidoId: string): Promise<ResumoOrcamento | null> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("orcamentos")
    .select("pacote, tem_estofos, orcamento_extras(descricao)")
    .eq("pedido_id", pedidoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    pacote: ROTULOS_PACOTE[data.pacote as Pacote] ?? data.pacote,
    temEstofos: data.tem_estofos,
    extras: (data.orcamento_extras ?? []).map((e: { descricao: string }) => e.descricao),
  };
}

export async function criarOrcamento(params: {
  pedidoId: string;
  pacote: Pacote;
  temEstofos: boolean;
  estofosMaterial: EstofosMaterial | null;
  extras: ExtraOrcamento[];
  notasVariacao: string | null;
  resultado: ResultadoPreco;
}): Promise<Orcamento> {
  const { pedidoId, pacote, temEstofos, estofosMaterial, extras, notasVariacao, resultado } = params;
  const supabase = criarClienteSupabase();

  const { data: orcamento, error } = await supabase
    .from("orcamentos")
    .insert({
      pedido_id: pedidoId,
      pacote,
      tem_estofos: temEstofos,
      estofos_material: estofosMaterial,
      combo_aplicado: resultado.comboAplicado,
      preco_base: resultado.precoBase,
      preco_estofos: resultado.precoEstofos,
      desconto_combo: resultado.descontoCombo,
      total_extras: resultado.totalExtras,
      preco_entrada: resultado.precoEntrada,
      notas_variacao: notasVariacao,
    })
    .select()
    .single();

  if (error) throw error;

  if (extras.length > 0) {
    const { error: erroExtras } = await supabase.from("orcamento_extras").insert(
      extras.map((extra) => ({
        orcamento_id: orcamento.id,
        descricao: extra.descricao,
        preco: extra.preco,
      }))
    );
    if (erroExtras) throw erroExtras;
  }

  await atualizarEstadoPedido(pedidoId, "orcamentado");

  return orcamento;
}
