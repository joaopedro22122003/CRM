import Link from "next/link";
import { PageHeader, Cartao, EstadoVazio } from "@/components/ui";
import { listarServicosRecentes } from "@/lib/data/servicos";
import { formatarEuros } from "@/lib/pricing";

export default async function ServicosPage() {
  const servicos = await listarServicosRecentes();

  return (
    <>
      <PageHeader titulo="Serviços" />
      <div className="flex flex-col gap-2 p-4">
        {servicos.length === 0 ? (
          <EstadoVazio titulo="Ainda sem serviços registados" />
        ) : (
          <ul className="flex flex-col gap-2">
            {servicos.map((servico) => (
              <li key={servico.id}>
                <Link href={`/servicos/${servico.id}`}>
                  <Cartao className="flex items-center justify-between gap-3 active:bg-neutral-50">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neutral-900">{servico.cliente.nome}</p>
                      <p className="truncate text-sm text-neutral-500">
                        {servico.viatura.marca} {servico.viatura.modelo} ·{" "}
                        {new Date(servico.data_conclusao).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-neutral-900">
                      {formatarEuros(Number(servico.preco_final))}
                    </span>
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
