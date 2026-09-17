"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/pedidos", rotulo: "Pedidos", icone: IconePedidos },
  { href: "/clientes", rotulo: "Clientes", icone: IconeClientes },
  { href: "/marcacoes", rotulo: "Marcações", icone: IconeMarcacoes },
  { href: "/servicos", rotulo: "Serviços", icone: IconeServicos },
  { href: "/mais", rotulo: "Mais", icone: IconeMais },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between">
        {ITENS.map(({ href, rotulo, icone: Icone }) => {
          const ativo = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  ativo ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                <Icone ativo={ativo} />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
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

function IconeServicos({ ativo }: PropsIcone) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={ativo ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
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
