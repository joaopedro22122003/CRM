import { formatDistanceToNowStrict } from "date-fns";
import { pt } from "date-fns/locale";
import { PageHeader, Cartao, Badge, EstadoVazio } from "@/components/ui";
import { listarOrcamentosSemResposta } from "@/lib/data/orcamentos-sem-resposta";
import BotaoEnviarMensagem from "./BotaoEnviarMensagem";
import BotaoDarComoPerdido from "./BotaoDarComoPerdido";

export default async function OrcamentosSemRespostaPage() {
  const orcamentos = await listarOrcamentosSemResposta();

  return (
    <>
      <PageHeader titulo="Orçamentos sem resposta" voltarPara="/mais" />

      <div className="flex flex-col gap-3 p-4">
        {orcamentos.length === 0 ? (
          <EstadoVazio titulo="Não há orçamentos sem resposta" />
        ) : (
          <ul className="flex flex-col gap-2">
            {orcamentos.map((o) => {
              const carro = o.viatura ? `${o.viatura.marca} ${o.viatura.modelo}` : null;
              return (
                <li key={o.pedidoId}>
                  <Cartao className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-neutral-900">{o.cliente.nome}</p>
                        <p className="text-sm text-neutral-500">
                          {carro ?? "Sem viatura"} · pedido{" "}
                          {formatDistanceToNowStrict(new Date(`${o.dataReferencia}T00:00:00`), {
                            locale: pt,
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {o.pacote && <Badge cor="azul">{o.pacote}</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <BotaoEnviarMensagem
                        pedidoId={o.pedidoId}
                        telefone={o.cliente.telefone}
                        nome={o.cliente.nome}
                        carro={carro}
                      />
                      <BotaoDarComoPerdido pedidoId={o.pedidoId} />
                    </div>
                  </Cartao>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
