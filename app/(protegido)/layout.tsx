import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, tokenSessaoEsperado } from "@/lib/auth";

// Protege todas as páginas dentro deste grupo de rotas com a
// palavra-passe simples da app. Não usamos middleware.ts para isto —
// esta verificação corre da mesma forma em todas as páginas, em cada
// pedido, porque o layout raiz já força renderização dinâmica.
export default async function LayoutProtegido({ children }: { children: React.ReactNode }) {
  const esperado = await tokenSessaoEsperado();

  if (esperado) {
    const store = await cookies();
    const cookie = store.get(COOKIE_NAME)?.value;
    if (cookie !== esperado) {
      redirect("/login");
    }
  }

  return <>{children}</>;
}
