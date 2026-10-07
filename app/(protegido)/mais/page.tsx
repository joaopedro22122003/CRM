import Link from "next/link";
import { PageHeader, Cartao, Badge } from "@/components/ui";
import { listarClientesParaContactar } from "@/lib/data/para-contactar";
import { sairAction } from "./actions";

const LIGACOES = [
  { href: "/servicos", titulo: "Serviços", descricao: "Histórico de serviços registados" },
  { href: "/faturacao", titulo: "Faturação", descricao: "Pagamentos por receber e histórico" },
  { href: "/despesas", titulo: "Despesas", descricao: "Aponta o que gastas no negócio" },
];

export default async function MaisPage() {
  const paraContactar = await listarClientesParaContactar();

  return (
    <>
      <PageHeader titulo="Mais" />
      <div className="flex flex-col gap-2 p-4">
        <Link href="/para-contactar">
          <Cartao
            className={`flex items-center justify-between active:bg-neutral-50 ${
              paraContactar.length > 0 ? "border-brand bg-brand-50" : ""
            }`}
          >
            <div>
              <p className="font-semibold text-neutral-900">Para contactar</p>
              <p className="text-sm text-neutral-500">Clientes para reativar</p>
            </div>
            {paraContactar.length > 0 && <Badge cor="marca">{paraContactar.length}</Badge>}
          </Cartao>
        </Link>

        {LIGACOES.map((l) => (
          <Link key={l.href} href={l.href}>
            <Cartao className="active:bg-neutral-50">
              <p className="font-semibold text-neutral-900">{l.titulo}</p>
              <p className="text-sm text-neutral-500">{l.descricao}</p>
            </Cartao>
          </Link>
        ))}

        <form action={sairAction} className="pt-4">
          <button type="submit" className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-center text-base font-semibold text-neutral-700 active:bg-neutral-200">
            Sair
          </button>
        </form>
      </div>
    </>
  );
}
