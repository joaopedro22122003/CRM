import { NextResponse } from "next/server";
import { listarClientesParaContactar } from "@/lib/data/para-contactar";
import { listarOrcamentosSemResposta } from "@/lib/data/orcamentos-sem-resposta";
import { enviarPushParaTodos } from "@/lib/data/push";
import { mensagemAvisoDiario } from "@/lib/mensagens";
import { autorizarCron } from "@/lib/cron-auth";

// Chamado uma vez por dia pela Vercel (ver vercel.json). Nunca deve
// ser pré-gerado nem guardado em cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!autorizarCron(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("teste") === "1") {
    const resultado = await enviarPushParaTodos({
      titulo: "Garagem do Jota",
      corpo: "Teste: o aviso de clientes para contactar está a funcionar.",
      url: "/para-contactar",
    });
    return NextResponse.json({ teste: true, ...resultado });
  }

  const [clientes, orcamentos] = await Promise.all([
    listarClientesParaContactar(),
    listarOrcamentosSemResposta(),
  ]);

  const total = clientes.length + orcamentos.length;
  if (total === 0) {
    return NextResponse.json({ enviado: false, paraContactar: 0, semResposta: 0 });
  }

  // Se só um dos dois ecrãs tiver itens, a notificação abre logo esse
  // ecrã; com os dois, abre "Para contactar" (o mais antigo dos dois).
  const url_ =
    clientes.length > 0 && orcamentos.length === 0
      ? "/para-contactar"
      : orcamentos.length > 0 && clientes.length === 0
        ? "/orcamentos-sem-resposta"
        : "/para-contactar";

  const resultado = await enviarPushParaTodos({
    titulo: "Garagem do Jota",
    corpo: mensagemAvisoDiario(clientes.length, orcamentos.length),
    url: url_,
  });

  return NextResponse.json({
    enviado: true,
    paraContactar: clientes.length,
    semResposta: orcamentos.length,
    ...resultado,
  });
}
