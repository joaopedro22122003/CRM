import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Despesa } from "@/lib/types";

export async function listarDespesas(): Promise<Despesa[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("despesas")
    .select("*")
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface DadosDespesa {
  valor: number;
  descricao: string;
  data: string;
}

export async function criarDespesa(dados: DadosDespesa): Promise<Despesa> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("despesas").insert(dados).select().single();
  if (error) throw error;
  return data;
}

export async function apagarDespesa(id: string): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase.from("despesas").delete().eq("id", id);
  if (error) throw error;
}
