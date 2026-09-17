import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, EstadoFaturacao, Faturacao, Servico } from "@/lib/types";

export interface FaturacaoResumo extends Faturacao {
  servico: Pick<Servico, "id" | "data_conclusao"> & {
    cliente: Pick<Cliente, "id" | "nome">;
  };
}

export async function listarFaturacao(): Promise<FaturacaoResumo[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("faturacao")
    .select("*, servico:servicos(id, data_conclusao, cliente:clientes(id, nome))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as FaturacaoResumo[];
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
