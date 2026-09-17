import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Cartao, BotaoLink, Badge, Select, Botao } from "@/components/ui";
import { obterPedidoComDetalhe } from "@/lib/data/pedidos";
import { listarViaturasDoCliente } from "@/lib/data/viaturas";
import { mudarEstadoAction, associarViaturaAction } from "../actions";
import { ESTADOS_PEDIDO, ROTULOS_PACOTE } from "@/lib/types";
import { formatarEuros } from "@/lib/pricing";
import { linkWhatsApp } from "@/lib/whatsapp";

export default async function PedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalhe = await obterPedidoComDetalhe(id);
  if (!detalhe) notFound();

  const { pedido, cliente, viatura, orcamentos, marcacoes, servicos } = detalhe;
  const viaturasDoCliente = viatura ? [] : await listarViaturasDoCliente(cliente.id);

  return (
    <>
      <PageHeader titulo={cliente.nome} voltarPara="/pedidos" />

      <div className="flex flex-col gap-4 p-4">
        <Cartao className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href={`/clientes/${cliente.id}`} className="font-semibold text-neutral-900 underline-offset-2 active:underline">
              {cliente.nome}
            </Link>
            <a
              href={linkWhatsApp(cliente.telefone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 text-sm font-semibold text-white active:bg-green-700"
            >
              WhatsApp
            </a>
          </div>

          {viatura ? (
            <p className="text-sm text-neutral-600">
              {viatura.marca} {viatura.modelo} {viatura.matricula ? `· ${viatura.matricula}` : ""}
            </p>
          ) : viaturasDoCliente.length > 0 ? (
            <form action={associarViaturaAction} className="flex items-center gap-2">
              <input type="hidden" name="pedido_id" value={pedido.id} />
              <Select name="viatura_id" required className="flex-1">
                <option value="">Escolher viatura…</option>
                {viaturasDoCliente.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo}
                  </option>
                ))}
              </Select>
              <Botao variante="secundario" className="shrink-0 px-3 py-2 text-sm">
                Associar
              </Botao>
            </form>
          ) : (
            <p className="text-sm text-neutral-500">
              Sem viatura associada.{" "}
              <Link href={`/clientes/${cliente.id}/viaturas/novo`} className="font-semibold text-neutral-700 underline">
                Adicionar viatura
              </Link>
            </p>
          )}

          {pedido.resumo_problema && <p className="text-sm text-neutral-600">{pedido.resumo_problema}</p>}

          <form action={mudarEstadoAction} className="flex items-center gap-2 border-t border-neutral-100 pt-3">
            <input type="hidden" name="pedido_id" value={pedido.id} />
            <Select name="estado" defaultValue={pedido.estado} className="flex-1">
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.rotulo}
                </option>
              ))}
            </Select>
            <Botao variante="secundario" className="shrink-0 px-3 py-2 text-sm">
              Atualizar
            </Botao>
          </form>
        </Cartao>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Orçamentos</h2>
            <Link href={`/pedidos/${pedido.id}/orcamento`} className="text-sm font-semibold text-neutral-600">
              + Novo orçamento
            </Link>
          </div>
          {orcamentos.length === 0 ? (
            <p className="text-sm text-neutral-500">Ainda sem orçamento.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {orcamentos.map((o) => (
                <li key={o.id}>
                  <Cartao className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {ROTULOS_PACOTE[o.pacote]}
                        {o.tem_estofos && " + Estofos"}
                      </p>
                      {o.combo_aplicado && <Badge cor="verde">Combo aplicado (-{formatarEuros(o.desconto_combo)})</Badge>}
                    </div>
                    <span className="font-semibold text-neutral-900">desde {formatarEuros(o.preco_entrada)}</span>
                  </Cartao>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Marcações</h2>
            <Link href={`/marcacoes/nova?pedido_id=${pedido.id}`} className="text-sm font-semibold text-neutral-600">
              + Nova marcação
            </Link>
          </div>
          {marcacoes.length === 0 ? (
            <p className="text-sm text-neutral-500">Ainda sem marcação.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {marcacoes.map((m) => (
                <li key={m.id}>
                  <Link href={`/marcacoes/${m.id}`}>
                    <Cartao className="flex items-center justify-between active:bg-neutral-50">
                      <span>{new Date(m.data_hora).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</span>
                      <Badge cor={m.estado === "concluido" ? "verde" : m.estado === "cancelado" ? "vermelho" : "azul"}>
                        {m.estado}
                      </Badge>
                    </Cartao>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Serviços</h2>
            <Link href={`/servicos/novo?pedido_id=${pedido.id}`} className="text-sm font-semibold text-neutral-600">
              + Registar serviço
            </Link>
          </div>
          {servicos.length === 0 ? (
            <p className="text-sm text-neutral-500">Ainda sem serviço registado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {servicos.map((s) => (
                <li key={s.id}>
                  <Link href={`/servicos/${s.id}`}>
                    <Cartao className="flex items-center justify-between active:bg-neutral-50">
                      <span>{new Date(s.data_conclusao).toLocaleDateString("pt-PT")}</span>
                      <span className="font-semibold">{formatarEuros(Number(s.preco_final))}</span>
                    </Cartao>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {orcamentos.length === 0 && <BotaoLink href={`/pedidos/${pedido.id}/orcamento`}>Criar orçamento</BotaoLink>}
      </div>
    </>
  );
}
