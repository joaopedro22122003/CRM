import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { PageHeader, Cartao, EstadoVazio } from "@/components/ui";
import { listarMarcacoesEntre } from "@/lib/data/marcacoes";
import { limitesDeAmanhaEmLisboa } from "@/lib/fuso-horario";
import { linkWhatsApp } from "@/lib/whatsapp";
import { mensagemConfirmacaoMarcacao } from "@/lib/mensagens";

export default async function MarcacoesDeAmanhaPage() {
  const { inicioIso, fimIso, dataTexto } = limitesDeAmanhaEmLisboa();
  const marcacoes = await listarMarcacoesEntre(inicioIso, fimIso);

  return (
    <>
      <PageHeader titulo="Marcações de amanhã" voltarPara="/marcacoes" />

      <div className="flex flex-col gap-3 p-4">
        {marcacoes.length === 0 ? (
          <EstadoVazio titulo="Sem marcações para amanhã" />
        ) : (
          <ul className="flex flex-col gap-2">
            {marcacoes.map((m) => {
              const hora = format(new Date(m.data_hora), "HH:mm");
              const link = linkWhatsApp(
                m.pedido.cliente.telefone,
                mensagemConfirmacaoMarcacao(m.pedido.cliente.nome, hora)
              );
              return (
                <li key={m.id}>
                  <Cartao className="flex flex-col gap-2">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {hora} · {m.pedido.cliente.nome}
                      </p>
                      <p className="truncate text-sm text-neutral-500">
                        {m.pedido.viatura ? `${m.pedido.viatura.marca} ${m.pedido.viatura.modelo}` : "Sem viatura"}
                        {m.tipo === "recolha_entrega" && m.zona ? ` · ${m.zona}` : ""}
                      </p>
                    </div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-green-700"
                    >
                      Enviar mensagem
                    </a>
                  </Cartao>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-center text-xs text-neutral-400">
          {format(new Date(`${dataTexto}T12:00:00`), "EEEE, d 'de' MMMM", { locale: pt })}
        </p>
      </div>
    </>
  );
}
