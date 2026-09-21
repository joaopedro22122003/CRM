import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, tokenSessaoEsperado } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const esperado = await tokenSessaoEsperado();

  // Sem APP_PASSWORD configurada ainda não há como validar — deixa
  // passar para não bloquear a app antes da configuração inicial.
  if (!esperado) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie === esperado) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("proximo", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|manifest.json|icons/).*)"],
};
