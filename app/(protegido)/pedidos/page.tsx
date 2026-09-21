import Link from "next/link";
import { PageHeader, Cartao, EstadoVazio, Badge } from "@/components/ui";
import { listarPedidos } from "@/lib/data/pedidos";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/types";

const CORES_ESTADO: Record<EstadoPedido, "cinza" | "azul" | "amarelo" | "verde" | "vermelho" | "roxo"> = {
  novo: "azul",
  qualificado: "roxo",
  orcamentado: "amarelo",
  marcado: "verde",
  concluido: "cinza",
  perdido: "vermelho",
};

export default async function PedidosPage() {
  const pedidos = await listarPedidos();

  const grupos = ESTADOS_PEDIDO.map(({ valor, rotulo }) => ({
    valor,
    rotulo,
    pedidos: pedidos.filter((p) => p.estado === valor),
  }));

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        acao={
          <Link
            href="/pedidos/novo"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white"
            aria-label="Novo pedido"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />

      <div className="flex flex-col gap-5 p-4">
        {pedidos.length === 0 && (
          <EstadoVazio titulo="Ainda sem pedidos" descricao="Cria o primeiro pedido a partir de um cliente." />
        )}

        {grupos
          .filter((g) => g.pedidos.length > 0)
          .map((grupo) => (
            <section key={grupo.valor} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-500">{grupo.rotulo}</h2>
                <span className="text-xs text-neutral-400">({grupo.pedidos.length})</span>
              </div>
              <ul className="flex flex-col gap-2">
                {grupo.pedidos.map((pedido) => (
                  <li key={pedido.id}>
                    <Link href={`/pedidos/${pedido.id}`}>
                      <Cartao className="flex items-center justify-between gap-3 active:bg-neutral-50">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-900">{pedido.cliente.nome}</p>
                          <p className="truncate text-sm text-neutral-500">
                            {pedido.viatura ? `${pedido.viatura.marca} ${pedido.viatura.modelo}` : "Sem viatura associada"}
                          </p>
                        </div>
                        <Badge cor={CORES_ESTADO[pedido.estado]}>{grupo.rotulo}</Badge>
                      </Cartao>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </>
  );
}
