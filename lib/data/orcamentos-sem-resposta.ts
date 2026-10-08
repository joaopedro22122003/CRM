import "server-only";
import { differenceInCalendarDays } from "date-fns";
import { criarClienteSupabase } from "@/lib/supabase/server";
import { ROTULOS_PACOTE } from "@/lib/types";
import type { Cliente, Pacote, Viatura } from "@/lib/types";

const DIAS_MINIMOS = 3;

export interface OrcamentoSemResposta {
  pedidoId: string;
  cliente: Pick<Cliente, "id" | "nome" | "telefone">;
  viatura: Pick<Viatura, "marca" | "modelo"> | null;
  pacote: string | null;
  dataReferencia: string;
}

/** Pedidos em estado "orçamentado", ainda sem marcação (um pedido sai
 * sozinho de "orçamentado" assim que leva uma marcação — ver
 * lib/data/marcacoes.ts, criarMarcacao) e ainda não seguidos, há pelo
 * menos 3 dias. A "data de referência" (para contar os dias) é a do
 * orçamento mais recente quando existe um, ou a do próprio pedido
 * quando nenhum pacote chegou a ser escolhido. */
export async function listarOrcamentosSemResposta(): Promise<OrcamentoSemResposta[]> {
  const supabase = criarClienteSupabase();

  const { data: pedidos, error: erroPedidos } = await supabase
    .from("pedidos")
    .select("id, created_at, cliente:clientes(id, nome, telefone), viatura:viaturas(marca, modelo)")
    .eq("estado", "orcamentado")
    .is("seguimento_em", null);
  if (erroPedidos) throw erroPedidos;
  if (!pedidos || pedidos.length === 0) return [];

  const ids = pedidos.map((p) => p.id);
  const { data: orcamentos, error: erroOrc } = await supabase
    .from("orcamentos")
    .select("pedido_id, pacote, created_at")
    .in("pedido_id", ids)
    .order("created_at", { ascending: false });
  if (erroOrc) throw erroOrc;

  const mapaOrcamento = new Map<string, { pacote: Pacote; created_at: string }>();
  for (const o of orcamentos ?? []) {
    if (!mapaOrcamento.has(o.pedido_id)) {
      mapaOrcamento.set(o.pedido_id, { pacote: o.pacote as Pacote, created_at: o.created_at });
    }
  }

  const hoje = new Date();
  const resultado: OrcamentoSemResposta[] = [];

  for (const p of pedidos) {
    const orcamento = mapaOrcamento.get(p.id) ?? null;
    const dataReferencia = orcamento?.created_at ?? p.created_at;
    const dias = differenceInCalendarDays(hoje, new Date(dataReferencia));
    if (dias < DIAS_MINIMOS) continue;

    resultado.push({
      pedidoId: p.id,
      cliente: p.cliente as unknown as Pick<Cliente, "id" | "nome" | "telefone">,
      viatura: (p.viatura as unknown as Pick<Viatura, "marca" | "modelo"> | null) ?? null,
      pacote: orcamento ? (ROTULOS_PACOTE[orcamento.pacote] ?? orcamento.pacote) : null,
      dataReferencia,
    });
  }

  resultado.sort((a, b) => (a.dataReferencia < b.dataReferencia ? -1 : 1));

  return resultado;
}
