import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { ExtraCatalogo } from "@/lib/types";

export async function listarExtrasCatalogo(): Promise<ExtraCatalogo[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("extras_catalogo")
    .select("*")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw error;
  return data ?? [];
}
