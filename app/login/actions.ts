"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, tokenParaPassword, tokenSessaoEsperado } from "@/lib/auth";

export type EstadoLogin = { erro?: string };

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const password = String(formData.get("password") || "");
  const proximo = String(formData.get("proximo") || "/pedidos");

  const esperado = await tokenSessaoEsperado();
  if (!esperado) {
    return { erro: "A app ainda não tem a palavra-passe configurada. Define APP_PASSWORD (ver README)." };
  }

  const tentativa = await tokenParaPassword(password);
  if (tentativa !== esperado) {
    return { erro: "Palavra-passe incorreta." };
  }

  const store = await cookies();
  store.set(COOKIE_NAME, esperado, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(proximo.startsWith("/") ? proximo : "/pedidos");
}
