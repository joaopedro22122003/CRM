"use client";

import { useEffect } from "react";

/** Regista o Service Worker em silêncio, assim que a app abre — não
 * pede nenhuma permissão, só o deixa pronto para quando o utilizador
 * ativar os lembretes em Mais → Lembretes. */
export default function RegistoServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sem suporte (ex.: Safari fora do ecrã principal) — ignora,
        // o ecrã de Lembretes já explica isso ao utilizador.
      });
    }
  }, []);

  return null;
}
