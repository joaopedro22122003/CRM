import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { PageHeader, Cartao, BotaoLink } from "@/components/ui";
import { obterMarcacaoComDetalhe } from "@/lib/data/marcacoes";
import { linkWhatsApp } from "@/lib/whatsapp";
import AcoesMarcacao from "../AcoesMarcacao";

export default async function MarcacaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalhe = await obterMarcacaoComDetalhe(id);
  if (!detalhe) notFound();

  const { marcacao, pedido, cliente, viatura } = detalhe;
  const dataHora = new Date(marcacao.data_hora);

  return (
    <>
      <PageHeader titulo="Marcação" voltarPara="/marcacoes" />

      <div className="flex flex-col gap-4 p-4">
        <Cartao className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href={`/clientes/${cliente.id}`} className="font-semibold text-neutral-900 active:underline">
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

          <p className="text-sm text-neutral-600">
            {viatura ? `${viatura.marca} ${viatura.modelo}` : "Sem viatura associada"}
          </p>

          <div className="flex flex-col gap-1 border-t border-neutral-100 pt-3 text-sm">
            <p>
              <span className="text-neutral-500">Quando: </span>
              <span className="font-medium text-neutral-900">
                {format(dataHora, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: pt })}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">Duração estimada: </span>
              <span className="font-medium text-neutral-900">{marcacao.duracao_estimada_min} min</span>
            </p>
            <p>
              <span className="text-neutral-500">Tipo: </span>
              <span className="font-medium text-neutral-900">
                {marcacao.tipo === "recolha_entrega" ? `Recolha/entrega — ${marcacao.zona}` : "Cliente traz o carro"}
              </span>
            </p>
            {marcacao.notas && (
              <p>
                <span className="text-neutral-500">Notas: </span>
                {marcacao.notas}
              </p>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-3">
            <AcoesMarcacao marcacaoId={marcacao.id} estadoAtual={marcacao.estado} />
          </div>
        </Cartao>

        <BotaoLink href="/pedidos">Ir a Pedidos para marcar como pago</BotaoLink>

        <BotaoLink variante="secundario" href={`/servicos/novo?pedido_id=${pedido.id}&marcacao_id=${marcacao.id}`}>
          Registar serviço com mais detalhe (fotos, custos…)
        </BotaoLink>
      </div>
    </>
  );
}
