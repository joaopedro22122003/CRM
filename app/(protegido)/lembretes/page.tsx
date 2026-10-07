import { PageHeader, Cartao } from "@/components/ui";
import BotaoAtivarLembretes from "./BotaoAtivarLembretes";

export default function LembretesPage() {
  const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;

  return (
    <>
      <PageHeader titulo="Lembretes" voltarPara="/mais" />

      <div className="flex flex-col gap-4 p-4">
        <Cartao className="flex flex-col gap-2">
          <p className="font-semibold text-neutral-900">O que faz</p>
          <p className="text-sm text-neutral-600">
            Todos os dias, por volta das 18h, se houver alguma marcação para amanhã recebes uma notificação. Ao
            tocar, abre a lista dos clientes de amanhã, cada um já com um botão para abrir o WhatsApp com a
            mensagem de confirmação escrita.
          </p>
        </Cartao>

        <Cartao className="flex flex-col gap-2 border-amber-300 bg-amber-50">
          <p className="font-semibold text-amber-900">Antes de ativares, no iPhone</p>
          <ol className="list-decimal space-y-1 pl-4 text-sm text-amber-800">
            <li>Abre esta app no Safari (se ainda não a tiveres aberto assim).</li>
            <li>
              Toca no botão de partilhar (o quadrado com a seta para cima) e escolhe{" "}
              <strong>&quot;Adicionar ao Ecrã Principal&quot;</strong>.
            </li>
            <li>Fecha o Safari e abre a app a partir do novo ícone no ecrã principal.</li>
            <li>Só a partir daí é que o botão abaixo consegue ativar os lembretes.</li>
          </ol>
        </Cartao>

        <BotaoAtivarLembretes chavePublica={chavePublica} />
      </div>
    </>
  );
}
