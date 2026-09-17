import Link from "next/link";
import { PageHeader, Cartao, BotaoLink, EstadoVazio, Badge } from "@/components/ui";
import { listarClientes } from "@/lib/data/clientes";
import { ROTULOS_FONTE } from "@/lib/types";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clientes = await listarClientes(q);

  return (
    <>
      <PageHeader
        titulo="Clientes"
        acao={
          <Link
            href="/clientes/novo"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white"
            aria-label="Novo cliente"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        <form method="GET" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Pesquisar por nome ou telemóvel…"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-base focus:border-neutral-900 focus:outline-none"
          />
        </form>

        {clientes.length === 0 ? (
          <EstadoVazio
            titulo={q ? "Nenhum cliente encontrado" : "Ainda sem clientes"}
            descricao={q ? "Tenta outra pesquisa." : "Cria o primeiro cliente para começar."}
            acao={!q && <BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {clientes.map((cliente) => (
              <li key={cliente.id}>
                <Link href={`/clientes/${cliente.id}`}>
                  <Cartao className="flex items-center justify-between gap-3 active:bg-neutral-50">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neutral-900">{cliente.nome}</p>
                      <p className="text-sm text-neutral-500">{cliente.telefone}</p>
                    </div>
                    <Badge cor="cinza">{ROTULOS_FONTE[cliente.fonte]}</Badge>
                  </Cartao>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
