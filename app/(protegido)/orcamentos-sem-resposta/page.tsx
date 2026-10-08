import Link from "next/link";
import { PageHeader, Cartao, Badge, EstadoVazio } from "@/components/ui";
import { listarOrcamentosSemResposta } from "@/lib/data/orcamentos-sem-resposta";
import BotaoEnviarMensagem from "./BotaoEnviarMensagem";
import BotaoJaMarcou from "./BotaoJaMarcou";
import BotaoDarComoPerdido from "./BotaoDarComoPerdido";

function rotuloDias(dias: number): string {
  if (dias <= 0) return "hoje";
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

export default async function OrcamentosSemRespostaPage() {
  const registos = await listarOrcamentosSemResposta();

  return (
    <>
      <PageHeader
        titulo="Orçamentos sem resposta"
        voltarPara="/mais"
        acao={
          <Link
            href="/pedido-rapido"
            className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-white active:bg-brand-dark"
          >
            Registar
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        {registos.length === 0 ? (
          <EstadoVazio titulo="Não há orçamentos sem resposta" />
        ) : (
          <ul className="flex flex-col gap-2">
            {registos.map((r) => (
              <li key={r.id}>
                <Cartao className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-neutral-900">{r.nome}</p>
                      <p className="text-sm text-neutral-500">
                        {r.carro ?? "Sem carro"} · pedido {rotuloDias(r.dias)}
                      </p>
                    </div>
                    {r.pacote && <Badge cor="azul">{r.pacote}</Badge>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <BotaoEnviarMensagem id={r.id} telefone={r.telefone} nome={r.nome} carro={r.carro} />
                    <div className="flex gap-2">
                      <BotaoJaMarcou id={r.id} />
                      <BotaoDarComoPerdido id={r.id} />
                    </div>
                  </div>
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
