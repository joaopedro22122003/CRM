import "server-only";
import { differenceInCalendarDays } from "date-fns";
import { criarClienteSupabase } from "@/lib/supabase/server";
import { ROTULOS_PACOTE } from "@/lib/types";
import type { Cliente, Pacote, Viatura } from "@/lib/types";

/** A partir de quantos dias sem seguimento é que vale a pena incomodar
 * (aviso das 9h e contador em "Mais") — a lista em si mostra todos,
 * sem este corte. */
const DIAS_MINIMOS_PARA_AVISO = 3;

export interface OrcamentoSemResposta {
  pedidoId: string;
  cliente: Pick<Cliente, "id" | "nome" | "telefone">;
  viatura: Pick<Viatura, "marca" | "modelo"> | null;
  pacote: string | null;
  dataReferencia: string;
  /** Dias desde a data de referência (0 = hoje). */
  dias: number;
}

/** Base partilhada: todos os pedidos em estado "orçamentado", ainda
 * sem seguimento (um pedido sai sozinho de "orçamentado" assim que
 * leva uma marcação — ver lib/data/marcacoes.ts, criarMarcacao — e
 * "perdido" sai de vez do estado "orçamentado"). A "data de
 * referência" (para contar os dias) é a do orçamento mais recente
 * quando existe um, ou a do próprio pedido quando nenhum pacote
 * chegou a ser escolhido. Do mais antigo para o mais recente. */
async function buscarOrcamentosSemRespostaBase(): Promise<OrcamentoSemResposta[]> {
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
  const resultado: OrcamentoSemResposta[] = pedidos.map((p) => {
    const orcamento = mapaOrcamento.get(p.id) ?? null;
    const dataReferencia = orcamento?.created_at ?? p.created_at;
    const dias = differenceInCalendarDays(hoje, new Date(dataReferencia));

    return {
      pedidoId: p.id,
      cliente: p.cliente as unknown as Pick<Cliente, "id" | "nome" | "telefone">,
      viatura: (p.viatura as unknown as Pick<Viatura, "marca" | "modelo"> | null) ?? null,
      pacote: orcamento ? (ROTULOS_PACOTE[orcamento.pacote] ?? orcamento.pacote) : null,
      dataReferencia,
      dias,
    };
  });

  resultado.sort((a, b) => (a.dataReferencia < b.dataReferencia ? -1 : 1));

  return resultado;
}

/** Todos os orçamentos sem resposta, desde o momento do registo — usado
 * pelo ecrã "Orçamentos sem resposta". */
export async function listarOrcamentosSemResposta(): Promise<OrcamentoSemResposta[]> {
  return buscarOrcamentosSemRespostaBase();
}

/** Só os orçamentos sem resposta há 3 dias ou mais — usado pelo aviso
 * das 9h e pelo contador em "Mais", para os dois baterem sempre certo. */
export async function listarOrcamentosSemRespostaParaAviso(): Promise<OrcamentoSemResposta[]> {
  const todos = await buscarOrcamentosSemRespostaBase();
  return todos.filter((o) => o.dias >= DIAS_MINIMOS_PARA_AVISO);
}
