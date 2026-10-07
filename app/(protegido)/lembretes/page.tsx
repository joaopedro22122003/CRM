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

        <BotaoAtivarLembretes chavePublica={chavePublica} />
      </div>
    </>
  );
}
