import "server-only";
import { differenceInCalendarDays } from "date-fns";
import { criarClienteSupabase } from "@/lib/supabase/server";

/** A partir de quantos dias sem seguimento é que vale a pena incomodar
 * (aviso das 9h e contador em "Mais") — a lista em si mostra todos,
 * sem este corte. */
const DIAS_MINIMOS_PARA_AVISO = 3;

export interface RegistoOrcamentoSemResposta {
  id: string;
  nome: string;
  telefone: string;
  carro: string | null;
  pacote: string | null;
  criadoEm: string;
  /** Dias desde o registo (0 = hoje). */
  dias: number;
}

/** Base partilhada: todos os registos ainda ativos e sem seguimento,
 * do mais antigo para o mais recente. */
async function buscarAtivosSemSeguimento(): Promise<RegistoOrcamentoSemResposta[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("orcamentos_sem_resposta")
    .select("id, nome, telefone, carro, pacote, criado_em")
    .eq("estado", "ativo")
    .is("seguimento_em", null)
    .order("criado_em", { ascending: true });
  if (error) throw error;

  const hoje = new Date();
  return (data ?? []).map((r) => ({
    id: r.id,
    nome: r.nome,
    telefone: r.telefone,
    carro: r.carro,
    pacote: r.pacote,
    criadoEm: r.criado_em,
    dias: differenceInCalendarDays(hoje, new Date(`${r.criado_em}T00:00:00`)),
  }));
}

/** Todos os registos ativos e sem seguimento, desde o momento do
 * registo — usado pelo ecrã "Orçamentos sem resposta". */
export async function listarOrcamentosSemResposta(): Promise<RegistoOrcamentoSemResposta[]> {
  return buscarAtivosSemSeguimento();
}

/** Só os que têm 3 dias ou mais — usado pelo aviso das 9h e pelo
 * contador em "Mais", para os dois baterem sempre certo. */
export async function listarOrcamentosSemRespostaParaAviso(): Promise<RegistoOrcamentoSemResposta[]> {
  const todos = await buscarAtivosSemSeguimento();
  return todos.filter((r) => r.dias >= DIAS_MINIMOS_PARA_AVISO);
}

export interface DadosRegistoOrcamentoSemResposta {
  nome: string;
  telefone: string;
  carro: string | null;
  pacote: string | null;
}

/** Cria um registo novo — usado pelo formulário "Orçamento sem
 * resposta". Não mexe em clientes, viaturas, pedidos nem orçamentos. */
export async function criarRegistoOrcamentoSemResposta(
  dados: DadosRegistoOrcamentoSemResposta
): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase.from("orcamentos_sem_resposta").insert(dados);
  if (error) throw error;
}

/** Regista o (único) seguimento feito — o registo sai da lista e nunca
 * volta a aparecer por este motivo. Nunca apaga nada. */
export async function marcarSeguimentoOrcamentoSemResposta(id: string): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("orcamentos_sem_resposta")
    .update({ seguimento_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw error;
}

/** Muda o estado para "marcou" ou "perdido" — só muda o estado, nunca
 * apaga o registo (fica disponível para as Estatísticas). */
export async function atualizarEstadoOrcamentoSemResposta(
  id: string,
  estado: "marcou" | "perdido"
): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("orcamentos_sem_resposta")
    .update({ estado, resolvido_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw error;
}
