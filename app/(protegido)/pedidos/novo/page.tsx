import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Cartao, BotaoLink, EstadoVazio } from "@/components/ui";
import { listarClientes, obterCliente } from "@/lib/data/clientes";
import { listarViaturasDoCliente } from "@/lib/data/viaturas";
import PedidoForm from "../PedidoForm";

export default async function NovoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string; q?: string }>;
}) {
  const { cliente_id, q } = await searchParams;

  if (!cliente_id) {
    const clientes = await listarClientes(q);
    return (
      <>
        <PageHeader titulo="Novo pedido" voltarPara="/pedidos" />
        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm text-neutral-500">Escolhe o cliente para este pedido.</p>
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
              titulo="Nenhum cliente encontrado"
              descricao="Cria primeiro o cliente."
              acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {clientes.map((cliente) => (
                <li key={cliente.id}>
                  <Link href={`/pedidos/novo?cliente_id=${cliente.id}`}>
                    <Cartao className="active:bg-neutral-50">
                      <p className="font-semibold text-neutral-900">{cliente.nome}</p>
                      <p className="text-sm text-neutral-500">{cliente.telefone}</p>
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

  const cliente = await obterCliente(cliente_id);
  if (!cliente) notFound();
  const viaturas = await listarViaturasDoCliente(cliente_id);

  return (
    <>
      <PageHeader titulo={`Novo pedido — ${cliente.nome}`} voltarPara={`/clientes/${cliente.id}`} />
      <div className="p-4">
        <Cartao>
          <PedidoForm clienteId={cliente.id} viaturas={viaturas} />
        </Cartao>
      </div>
    </>
  );
}
