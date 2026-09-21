import Link from "next/link";
import { PageHeader, Cartao } from "@/components/ui";
import { sairAction } from "./actions";

const LIGACOES = [
  { href: "/faturacao", titulo: "Faturação", descricao: "Pagamentos por receber e histórico" },
];

export default function MaisPage() {
  return (
    <>
      <PageHeader titulo="Mais" />
      <div className="flex flex-col gap-2 p-4">
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
