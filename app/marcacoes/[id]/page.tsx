import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { PageHeader, Cartao, Select, Botao, BotaoLink } from "@/components/ui";
import { obterMarcacaoComDetalhe } from "@/lib/data/marcacoes";
import { mudarEstadoMarcacaoAction } from "../actions";
import { linkWhatsApp } from "@/lib/whatsapp";

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

          <form action={mudarEstadoMarcacaoAction} className="flex items-center gap-2 border-t border-neutral-100 pt-3">
            <input type="hidden" name="marcacao_id" value={marcacao.id} />
            <Select name="estado" defaultValue={marcacao.estado} className="flex-1">
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </Select>
            <Botao variante="secundario" className="shrink-0 px-3 py-2 text-sm">
              Atualizar
            </Botao>
          </form>
        </Cartao>

        <BotaoLink href={`/servicos/novo?pedido_id=${pedido.id}&marcacao_id=${marcacao.id}`}>
          Registar serviço concluído
        </BotaoLink>
      </div>
    </>
  );
}
