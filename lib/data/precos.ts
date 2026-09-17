import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { ConfiguracaoPrecos } from "@/lib/types";

export async function obterConfiguracaoPrecos(): Promise<ConfiguracaoPrecos> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("configuracoes_precos").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}
