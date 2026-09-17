import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase usado apenas no servidor (Server Components e
 * Server Actions). Usa a chave de serviço, que nunca é enviada para o
 * browser — por isso não precisa de RLS com políticas nem de login
 * Supabase. A proteção da app é feita pela palavra-passe simples em
 * middleware.ts.
 */
export function criarClienteSupabase() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chave) {
    throw new Error(
      "Faltam as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. " +
        "Configura-as em .env.local (vê o README para o guia passo a passo)."
    );
  }

  return createClient(url, chave, {
    auth: { persistSession: false },
  });
}
