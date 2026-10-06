import { formatDistanceToNowStrict } from "date-fns";
import { pt } from "date-fns/locale";
import { PageHeader, Cartao, EstadoVazio } from "@/components/ui";
import { listarClientesParaContactar } from "@/lib/data/para-contactar";
import BotaoEnviarMensagem from "./BotaoEnviarMensagem";

export default async function ParaContactarPage() {
  const clientes = await listarClientesParaContactar();

  return (
    <>
      <PageHeader titulo="Para contactar" voltarPara="/mais" />

      <div className="flex flex-col gap-3 p-4">
        {clientes.length === 0 ? (
          <EstadoVazio titulo="Não há clientes para contactar" />
        ) : (
          <ul className="flex flex-col gap-2">
            {clientes.map(({ cliente, viatura, dataUltimoServico }) => (
              <li key={cliente.id}>
                <Cartao className="flex flex-col gap-2">
                  <div>
                    <p className="font-semibold text-neutral-900">{cliente.nome}</p>
                    <p className="text-sm text-neutral-500">
                      {viatura ? `${viatura.marca} ${viatura.modelo}` : "Sem viatura"} · último serviço{" "}
                      {formatDistanceToNowStrict(new Date(`${dataUltimoServico}T00:00:00`), {
                        locale: pt,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <BotaoEnviarMensagem
                    clienteId={cliente.id}
                    telefone={cliente.telefone}
                    nome={cliente.nome}
                    carro={viatura ? `${viatura.marca} ${viatura.modelo}` : "teu carro"}
                  />
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
