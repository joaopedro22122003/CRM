import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";

export interface EstatisticasOrcamentos {
  totalRegistados: number;
  registadosEsteMes: number;
  ativos: number;
  marcaram: number;
  perderam: number;
  resolvidos: number;
  /** null enquanto houver menos de 10 resolvidos (marcaram + perderam). */
  taxaConversao: number | null;
}

const MINIMO_PARA_TAXA = 10;

/** Única função de dados para o ecrã "Estatísticas" — conta só o que
 * está registado em orcamentos_sem_resposta. */
export async function obterEstatisticasOrcamentos(): Promise<EstatisticasOrcamentos> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("orcamentos_sem_resposta").select("estado, criado_em");
  if (error) throw error;

  const registos = data ?? [];
  const hoje = new Date();
  const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;

  let registadosEsteMes = 0;
  let ativos = 0;
  let marcaram = 0;
  let perderam = 0;

  for (const r of registos) {
    if (r.criado_em >= inicioMes) registadosEsteMes += 1;
    if (r.estado === "ativo") ativos += 1;
    else if (r.estado === "marcou") marcaram += 1;
    else if (r.estado === "perdido") perderam += 1;
  }

  const resolvidos = marcaram + perderam;
  const taxaConversao = resolvidos >= MINIMO_PARA_TAXA ? marcaram / resolvidos : null;

  return {
    totalRegistados: registos.length,
    registadosEsteMes,
    ativos,
    marcaram,
    perderam,
    resolvidos,
    taxaConversao,
  };
}
