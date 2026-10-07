"use client";

import { useEffect, useState } from "react";
import { guardarInscricaoAction, apagarInscricaoAction, testarLembreteAction } from "./actions";

function base64UrlParaUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const preenchimento = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + preenchimento).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(base64);
  const saida = new Uint8Array(new ArrayBuffer(bruto.length));
  for (let i = 0; i < bruto.length; i++) saida[i] = bruto.charCodeAt(i);
  return saida;
}

type Estado = "a_verificar" | "nao_suportado" | "desativado" | "ativado";

export default function BotaoAtivarLembretes({ chavePublica }: { chavePublica: string | null }) {
  const [estado, setEstado] = useState<Estado>("a_verificar");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [aProcessar, setAProcessar] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    async function verificar() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setEstado("nao_suportado");
        return;
      }
      try {
        const registo = await navigator.serviceWorker.ready;
        const subscricao = await registo.pushManager.getSubscription();
        if (subscricao) {
          setEndpoint(subscricao.endpoint);
          setEstado("ativado");
        } else {
          setEstado("desativado");
        }
      } catch {
        setEstado("nao_suportado");
      }
    }
    verificar();
  }, []);

  async function ativar() {
    if (!chavePublica) {
      setMensagem("Ainda faltam configurar as chaves dos lembretes (VAPID) na Vercel.");
      return;
    }
    setMensagem(null);
    setAProcessar(true);
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setMensagem("Sem permissão para notificações, não é possível ativar os lembretes.");
        setAProcessar(false);
        return;
      }

      const registo = await navigator.serviceWorker.ready;
      const subscricao = await registo.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlParaUint8Array(chavePublica),
      });

      const json = subscricao.toJSON();
      const resultado = await guardarInscricaoAction({
        endpoint: subscricao.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });

      if (resultado?.erro) {
        setMensagem(resultado.erro);
      } else {
        setEndpoint(subscricao.endpoint);
        setEstado("ativado");
      }
    } catch {
      setMensagem("Não foi possível ativar os lembretes neste aparelho.");
    } finally {
      setAProcessar(false);
    }
  }

  async function desativar() {
    setAProcessar(true);
    try {
      const registo = await navigator.serviceWorker.ready;
      const subscricao = await registo.pushManager.getSubscription();
      if (subscricao) {
        await apagarInscricaoAction(subscricao.endpoint);
        await subscricao.unsubscribe();
      }
      setEndpoint(null);
      setEstado("desativado");
      setMensagem(null);
    } catch {
      setMensagem("Não foi possível desativar neste aparelho.");
    } finally {
      setAProcessar(false);
    }
  }

  async function testar() {
    if (!endpoint) return;
    setMensagem(null);
    setAProcessar(true);
    const resultado = await testarLembreteAction(endpoint);
    setMensagem(resultado?.erro ?? "Notificação de teste enviada — deve chegar em segundos.");
    setAProcessar(false);
  }

  if (estado === "a_verificar") return null;

  if (estado === "nao_suportado") {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Este navegador/aparelho não suporta notificações. No iPhone, confirma que abriste a app a partir do ícone
        no ecrã principal (não do Safari) e que o iOS está atualizado (16.4 ou mais recente).
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {estado === "desativado" ? (
        <button
          type="button"
          onClick={ativar}
          disabled={aProcessar}
          className="w-full rounded-xl bg-brand px-4 py-3 text-center text-base font-semibold text-white active:bg-brand-dark disabled:opacity-50"
        >
          {aProcessar ? "A ativar…" : "Ativar lembretes"}
        </button>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-300">
            ✓ Ativado neste aparelho
          </div>
          <button
            type="button"
            onClick={testar}
            disabled={aProcessar}
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-center text-base font-semibold text-neutral-700 active:bg-neutral-200 disabled:opacity-50"
          >
            {aProcessar ? "A processar…" : "Testar agora"}
          </button>
          <button
            type="button"
            onClick={desativar}
            disabled={aProcessar}
            className="w-full rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700 active:bg-red-100 disabled:opacity-50"
          >
            Desativar neste aparelho
          </button>
        </>
      )}

      {mensagem && <p className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700">{mensagem}</p>}
    </div>
  );
}
