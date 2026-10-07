import { NextResponse } from "next/server";
import { listarMarcacoesEntre } from "@/lib/data/marcacoes";
import { limitesDeAmanhaEmLisboa } from "@/lib/fuso-horario";
import { enviarPushParaTodos } from "@/lib/data/push";

// Chamado uma vez por dia pela Vercel (ver vercel.json). Nunca deve
// ser pré-gerado nem guardado em cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const autorizacao = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || autorizacao !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { inicioIso, fimIso } = limitesDeAmanhaEmLisboa();
  const marcacoes = await listarMarcacoesEntre(inicioIso, fimIso);

  if (marcacoes.length === 0) {
    return NextResponse.json({ enviado: false, total: 0 });
  }

  const corpo =
    marcacoes.length === 1
      ? "Tens 1 marcação amanhã. Toca para confirmar com o cliente."
      : `Tens ${marcacoes.length} marcações amanhã. Toca para confirmar com os clientes.`;

  const resultado = await enviarPushParaTodos({
    titulo: "Garagem do Jota",
    corpo,
    url: "/lembretes/amanha",
  });

  return NextResponse.json({ enviado: true, total: marcacoes.length, ...resultado });
}
