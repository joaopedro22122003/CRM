"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ItemNavTipo = {
  href: string;
  rotulo: string;
  icone: (props: PropsIcone) => React.ReactElement;
  /** Outras secções que também devem acender este item (ex.: Mais cobre Serviços e Faturação). */
  ativoEm?: string[];
};

const ITENS_ESQUERDA: ItemNavTipo[] = [
  { href: "/pedidos", rotulo: "Pedidos", icone: IconePedidos },
  { href: "/clientes", rotulo: "Clientes", icone: IconeClientes },
];

const ITENS_DIREITA: ItemNavTipo[] = [
  { href: "/marcacoes", rotulo: "Marcações", icone: IconeMarcacoes },
  {
    href: "/mais",
    rotulo: "Mais",
    icone: IconeMais,
    ativoEm: ["/servicos", "/faturacao", "/despesas", "/para-contactar", "/orcamentos-sem-resposta"],
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  if (pathname === "/login") return null;

  function ItemNav({ href, rotulo, icone: Icone, ativoEm }: ItemNavTipo) {
    const prefixos = [href, ...(ativoEm ?? [])];
    const ativo = prefixos.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    return (
      <li className="flex-1">
        <Link
          href={href}
          className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
            ativo ? "text-brand" : "text-neutral-400"
          }`}
        >
          <Icone ativo={ativo} />
          {rotulo}
        </Link>
      </li>
    );
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-neutral-100/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto flex max-w-lg items-stretch justify-between">
          {ITENS_ESQUERDA.map((item) => (
            <ItemNav key={item.href} {...item} />
          ))}

          <li className="flex-1">
            <button
              type="button"
              onClick={() => setAberto(true)}
              aria-label="Novo"
              className="flex w-full flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-brand"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white active:bg-brand-dark">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.6}>
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </span>
              Novo
            </button>
          </li>

          {ITENS_DIREITA.map((item) => (
            <ItemNav key={item.href} {...item} />
          ))}
        </ul>
      </nav>

      {aberto && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-neutral-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-neutral-900">O que queres criar?</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/marcacao-rapida"
                onClick={() => setAberto(false)}
                className="rounded-xl bg-brand px-4 py-3 text-center text-base font-semibold text-white active:bg-brand-dark"
              >
                Nova marcação completa
              </Link>
              <Link
                href="/pedido-rapido"
                onClick={() => setAberto(false)}
                className="rounded-xl bg-neutral-200 px-4 py-3 text-center text-base font-semibold text-neutral-900 active:bg-neutral-300"
              >
                Pediu preço (registo rápido)
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="mt-3 w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium text-neutral-500 active:bg-neutral-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

type PropsIcone = { ativo: boolean };

function IconePedidos({ ativo }: PropsIcone) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={ativo ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h5" />
    </svg>
  );
}

function IconeClientes({ ativo }: PropsIcone) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={ativo ? 2.2 : 1.8}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
    </svg>
  );
}

function IconeMarcacoes({ ativo }: PropsIcone) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={ativo ? 2.2 : 1.8}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function IconeMais({ ativo }: PropsIcone) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={ativo ? 2.2 : 1.8}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
